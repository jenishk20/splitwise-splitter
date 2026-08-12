"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/client/user";
import { updateExpensePreferences } from "@/client/user";
import { finalizeExpenseOnSplitwise, deleteExpenseItem } from "@/client/user";
import { predictSplit } from "@/client/user";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Check, Copy, Trash } from "lucide-react";
import { getPendingExpenses } from "@/client/user";

export default function ExpensePage() {
  const { id, expenseId } = useParams();
  const { user, groups } = useUser();
  const [expense, setExpense] = useState<any>(null);
  const [participation, setParticipation] = useState<{
    [itemIndex: number]: { [memberId: string]: boolean };
  }>({});
  // Auto-split: per-cell "why this was pre-checked" text, for the badge tooltip.
  // Display-only — has zero effect on what gets submitted.
  const [suggestionMeta, setSuggestionMeta] = useState<{
    [itemIndex: number]: { [memberId: string]: string };
  }>({});
  // Cells the member actually toggled this session. A suggestion that was
  // pre-filled and simply submitted is honoured for the split but must not be
  // fed back to the predictor as evidence, or it learns from its own guesses.
  const [touched, setTouched] = useState<{
    [itemIndex: number]: { [memberId: string]: boolean };
  }>({});

  const group = groups?.find((group) => group.id === Number(id));
  const groupMembers = useMemo(() => group?.members || [], [group?.members]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied]);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        console.log("Fetching expenses for group:", id);
        console.log("Looking for expense ID:", expenseId);
        const expenses = await getPendingExpenses(id as string);
        console.log("All expenses:", expenses);
        const foundExpense = expenses.find((exp: any) => exp._id === expenseId);
        console.log("Found expense:", foundExpense);
        if (foundExpense) {
          setExpense(foundExpense);
          // Initialize participation state from stored values. Cells are now
          // { value, source } objects (older ones are bare booleans), so read
          // the value rather than testing the cell -- an object is truthy and
          // would opt everyone into everything.
          const initial: any = {};
          foundExpense.items.forEach((item: any, idx: number) => {
            initial[idx] = {};
            groupMembers.forEach((member) => {
              const cell = item.participation?.[member.id];
              initial[idx][String(member.id)] =
                typeof cell === "object" && cell !== null
                  ? !!cell.value
                  : !!cell;
            });
          });

          // --- Auto-split suggestions (best-effort, purely additive) ---
          // Only on the user's first visit (don't override saved preferences),
          // and only ever turn a box ON — never off. If the call fails it
          // returns [], so the page behaves exactly as before.
          const currentUserId = String(user?.id ?? "");
          const alreadyFilled = !!foundExpense.preferencesFilled?.[
            currentUserId
          ];

          if (!alreadyFilled && currentUserId) {
            const memberIds = groupMembers.map((m) => String(m.id));
            const suggestions = await predictSplit(
              foundExpense._id,
              memberIds
            );
            const meta: { [i: number]: { [m: string]: string } } = {};
            suggestions.forEach((s) => {
              Object.entries(s.suggestions).forEach(([memberId, sug]) => {
                // Only ever pre-fill the viewer's OWN cells. This previously
                // also fired for the creator, who would then submit the
                // model's guesses about everyone else as if those people had
                // declared them -- someone who skipped the meal came back to
                // find themselves ticked into it.
                const editable = memberId === currentUserId;
                // Additive only: never uncheck an existing opt-in.
                if (editable && sug.suggested && sug.checked && sug.reason) {
                  initial[s.index][memberId] = true;
                  meta[s.index] = meta[s.index] || {};
                  meta[s.index][memberId] = sug.reason;
                }
              });
            });
            setSuggestionMeta(meta);
          }

          setParticipation(initial);
        } else {
          console.log("Expense not found!");
          toast.error("Expense not found");
        }
      } catch (error) {
        console.error("Failed to fetch expense:", error);
        toast.error("Failed to fetch expense");
      }
    };

    if (id && expenseId) {
      fetchExpense();
    }
  }, [id, expenseId, groupMembers, user?.id]);

  const handlePreferenceChange = (
    itemIndex: number,
    memberId: string,
    value: boolean
  ) => {
    if (
      memberId?.toString() !== user?.id?.toString() &&
      user?.id?.toString() !== expense?.userId?.toString()
    )
      return;
    setParticipation((prev) => ({
      ...prev,
      [itemIndex]: {
        ...prev[itemIndex],
        [memberId]: value,
      },
    }));
    setTouched((prev) => ({
      ...prev,
      [itemIndex]: { ...prev[itemIndex], [memberId]: true },
    }));
  };

  const deleteExp = async () => {
    try {
      await deleteExpense(expense._id);
      toast.success("Expense deleted successfully!");
      // Redirect back to expenses list
      window.location.href = `/dashboard/group/${id}/expenses`;
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    }
  };

  const submitPreferences = async () => {
    try {
      // Send provenance with each cell. The server decides what it will accept
      // and who may write which member; this only reports how the value came
      // to be, so an untouched suggestion never enters the training set.
      const itemsWithPreferences = expense.items.map(
        (item: any, idx: number) => ({
          ...item,
          participation: Object.fromEntries(
            Object.entries(participation[idx] || {}).map(
              ([memberId, value]) => [
                memberId,
                {
                  value,
                  source:
                    !touched[idx]?.[memberId] && suggestionMeta[idx]?.[memberId]
                      ? "suggested"
                      : "user",
                },
              ]
            )
          ),
        })
      );
      await updateExpensePreferences(expense._id, itemsWithPreferences);
      toast.success("Preferences submitted!");
    } catch {
      toast.error("Failed to submit preferences");
    }
  };

  const finalizeExpense = async () => {
    try {
      await finalizeExpenseOnSplitwise(expense._id);
      toast.success("Expense finalized on Splitwise!");
      // Redirect back to expenses list
      window.location.href = `/dashboard/group/${id}/expenses`;
    } catch {
      toast.error("Finalization failed");
    }
  };

  const deleteItem = async (itemIndex: number) => {
    try {
      await deleteExpenseItem(
        expense._id,
        String(expense.items[itemIndex]._id)
      );
      toast.success("Item deleted successfully!");
      // Refresh the expense data
      const expenses = await getPendingExpenses(id as string);
      const foundExpense = expenses.find((exp: any) => exp._id === expenseId);
      if (foundExpense) {
        setExpense(foundExpense);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  const handleCopyExpenseURL = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Expense URL copied to clipboard", {
      duration: 2000,
      description: `Happy Splitting! 😄 ${window.location.href}`,
      descriptionClassName: "text-xs text-muted-foreground font-mono",
    });
  };

  if (!expense) {
    return (
      <div className="w-full space-y-4">
        <Card>
          <CardContent className="px-2 sm:px-6 py-8">
            <div className="text-center text-muted-foreground">
              Loading expense...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = expense?.userId?.toString() === user?.id?.toString();

  // Non-owners only ever act on their own column; the owner sees everyone.
  const visibleMembers = isOwner
    ? groupMembers
    : groupMembers.filter((m) => m.id?.toString() === user?.id?.toString());

  type Member = (typeof groupMembers)[number];

  // Plain functions, not inner components: a component defined during render is
  // a new type every pass, so React remounts it and the checkbox loses focus.
  const renderCheckbox = (idx: number, member: Member, className?: string) => (
    <Checkbox
      checked={participation[idx]?.[String(member.id)] || false}
      onCheckedChange={(checked: boolean) =>
        handlePreferenceChange(idx, String(member.id), checked)
      }
      disabled={member?.id?.toString() !== user?.id?.toString() && !isOwner}
      className={`cursor-pointer ${className ?? ""}`}
    />
  );

  const renderSuggestionDot = (idx: number, member: Member) =>
    suggestionMeta[idx]?.[String(member.id)] ? (
      <span
        title={suggestionMeta[idx][String(member.id)]}
        aria-label="Suggested from past splits"
        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-violet-500"
      />
    ) : null;

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="min-w-0 break-words text-xl font-bold sm:text-2xl">
            {expense.description}
          </h1>
          <Button
            variant={"outline"}
            aria-label="Copy expense"
            size={"icon"}
            onClick={handleCopyExpenseURL}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600 animate-in fade-in-0 duration-200" />
            ) : (
              <Copy className="h-4 w-4 animate-in fade-in-0 duration-200" />
            )}
          </Button>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Posted by <span className="font-bold">{expense.userName}</span> on{" "}
            {new Date(expense.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Total:{" "}
            {expense.items.reduce(
              (acc: number, item: any) => acc + item.price,
              0
            )}
            $
          </p>
        </div>
      </div>
      {Object.keys(suggestionMeta).length > 0 && (
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-700 dark:text-violet-300">
          ✨ We pre-filled some items based on this group&apos;s past splits.
          Please review and adjust before submitting.
        </div>
      )}
      <Card>
        <CardContent className="px-2 sm:px-6">
          {/* Desktop: one column per member. */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Price</TableHead>
                  {visibleMembers.map((member) => (
                    <TableHead key={member.id} className="text-center">
                      {member.first_name}
                    </TableHead>
                  ))}
                  {isOwner && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expense.items.map((item: any, idx: number) => (
                  <TableRow key={idx}>
                    <TableCell>{item.item}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.price}</TableCell>
                    {visibleMembers.map((member) => (
                      <TableCell key={member.id} className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {renderCheckbox(idx, member)}
                          {renderSuggestionDot(idx, member)}
                        </div>
                      </TableCell>
                    ))}
                    {/* Previously rendered unconditionally while its header was
                        owner-only, so non-owners got a table one cell wider
                        than its header row. */}
                    {isOwner && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={`Delete ${item.item}`}
                          onClick={() => deleteItem(idx)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: a card per item. One column per member is unusable on a
              phone -- a six-person group renders ten columns at 375px, which is
              exactly the group this was built for. */}
          <div className="space-y-3 py-2 md:hidden">
            {expense.items.map((item: any, idx: number) => (
              <div key={idx} className="rounded-lg border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium leading-tight break-words">
                      {item.item}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Qty {item.quantity} &middot; ${item.price}
                    </p>
                  </div>
                  {isOwner && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      aria-label={`Delete ${item.item}`}
                      onClick={() => deleteItem(idx)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="mt-3 border-t pt-2">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Split with
                  </p>
                  <ul>
                    {visibleMembers.map((member) => (
                      <li key={member.id}>
                        {/* Whole row is the tap target; 44px is the iOS minimum. */}
                        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2 text-sm">
                            <span className="truncate">
                              {member.first_name}
                            </span>
                            {renderSuggestionDot(idx, member)}
                          </span>
                          {renderCheckbox(idx, member, "h-5 w-5")}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" onClick={submitPreferences}>
            Submit Preferences
          </Button>
          {isOwner && (
            <Button className="w-full sm:w-auto" onClick={finalizeExpense}>
              Finalize on Splitwise
            </Button>
          )}
          {isOwner && (
            <Button
              variant="destructive"
              className="w-full sm:w-auto"
              onClick={deleteExp}
            >
              Delete Expense
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
