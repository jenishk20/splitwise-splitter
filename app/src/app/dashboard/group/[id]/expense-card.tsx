"use client";

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { toast } from "sonner";
import { deleteExpense } from "@/client/user";
import { updateExpensePreferences } from "@/client/user";
import { finalizeExpenseOnSplitwise } from "@/client/user";

interface ExpenseCardProps {
  expense: any;
  index: number;
  groupMembers: any[];
  refreshExpenses: () => void;
}

export const ExpenseCard = ({
  expense,
  index,
  groupMembers,
  refreshExpenses,
}: ExpenseCardProps) => {
  const { user } = useUser();

  const [participation, setParticipation] = useState<{
    [itemIndex: number]: { [memberId: string]: boolean };
  }>(() => {
    const initial: any = {};
    expense.items.forEach((item: any, idx: number) => {
      initial[idx] = {};
      groupMembers.forEach((member) => {
        initial[idx][member.id] = item.participation?.[member.id] ?? false;
      });
    });
    return initial;
  });

  const handlePreferenceChange = (
    itemIndex: number,
    memberId: string,
    value: boolean
  ) => {
    if (memberId !== user?.id?.toString()) return;
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
      const response = await deleteExpense(expense._id);
      toast.success("Expense deleted successfully!");
      refreshExpenses();
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
      refreshExpenses();
    } catch (error) {
      toast.error("Failed to submit preferences");
    }
  };

  const finalizeExpense = async () => {
    try {
      await finalizeExpenseOnSplitwise(expense._id);
      toast.success("Expense finalized on Splitwise!");
      refreshExpenses();
    } catch (error) {
      toast.error("Finalization failed");
    }
  };

  return (
    <AccordionItem value={expense._id}>
      <AccordionTrigger>
        <CardTitle>{`Expense ${index + 1}: ${expense.description}`}</CardTitle>
      </AccordionTrigger>
      <AccordionContent>
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
                          checked={participation[idx]?.[member.id] || false}
                          onCheckedChange={(checked: boolean) =>
                            handlePreferenceChange(idx, member.id, checked)
                          }
                          disabled={
                            member?.id?.toString() !== user?.id?.toString()
                          }
                          className="cursor-pointer border-gray-300"
                        />
                      </TableCell>
                    ))}
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
              <Button
                className="bg-red-500 hover:bg-red-600"
                onClick={deleteExp}
              >
                Delete Expense
              </Button>
            )}
          </CardFooter>
        </Card>
      </AccordionContent>
    </AccordionItem>
  );
};
