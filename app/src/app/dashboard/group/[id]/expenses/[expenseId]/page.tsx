"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/client/user";
import { updateExpensePreferences } from "@/client/user";
import { finalizeExpenseOnSplitwise, deleteExpenseItem } from "@/client/user";
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
          // Initialize participation state
          const initial: any = {};
          foundExpense.items.forEach((item: any, idx: number) => {
            initial[idx] = {};
            groupMembers.forEach((member) => {
              initial[idx][String(member.id)] =
                item.participation?.[member.id] ?? false;
            });
          });
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
  }, [id, expenseId, groupMembers]);

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
      const itemsWithPreferences = expense.items.map(
        (item: any, idx: number) => ({
          ...item,
          participation: participation[idx],
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

  return (
    <div className="w-full space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{expense.description}</h1>
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
      <Card>
        <CardContent className="px-2 sm:px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Price</TableHead>
                {groupMembers.map((member) => (
                  <TableHead key={member.id} className="text-center">
                    {member.first_name}
                  </TableHead>
                ))}
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expense.items.map((item: any, idx: number) => (
                <TableRow key={idx}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  {groupMembers.map((member) => (
                    <TableCell key={member.id} className="text-center">
                      <Checkbox
                        checked={
                          participation[idx]?.[String(member.id)] || false
                        }
                        onCheckedChange={(checked: boolean) =>
                          handlePreferenceChange(
                            idx,
                            String(member.id),
                            checked
                          )
                        }
                        disabled={
                          member?.id?.toString() !== user?.id?.toString() &&
                          user?.id?.toString() !== expense?.userId?.toString()
                        }
                        className="cursor-pointer border-gray-300"
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    {expense?.userId?.toString() === user?.id?.toString() && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteItem(idx)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button onClick={submitPreferences}>Submit Preferences</Button>
          {expense?.userId?.toString() === user?.id?.toString() && (
            <Button onClick={finalizeExpense}>Finalize on Splitwise</Button>
          )}
          {expense?.userId?.toString() === user?.id?.toString() && (
            <Button variant={"destructive"} onClick={deleteExp}>
              Delete Expense
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
