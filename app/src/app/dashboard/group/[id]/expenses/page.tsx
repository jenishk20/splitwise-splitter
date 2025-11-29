"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useCallback, useEffect, useState } from "react";
import { getPendingExpenses } from "@/client/user";
import { toast } from "sonner";
import { ExpenseCard } from "../expense-card";

export default function ExpensesPage() {
  const { id } = useParams();
  const { groups, user } = useUser();
  const [expenses, setExpenses] = useState<any[]>([]);
  const group = groups?.find((g) => g.id === Number(id));

  const fetchPendingExpenses = useCallback(async () => {
    try {
      const pendingExpenses = await getPendingExpenses(id as string);
      setExpenses(pendingExpenses);
    } catch (error) {
      console.error("Failed to fetch pending expenses:", error);
      toast.error("Failed to fetch pending expenses");
    }
  }, [id]);

  useEffect(() => {
    fetchPendingExpenses();
  }, [fetchPendingExpenses]);

  if (!user) {
    return null;
  }

  const hasUserParticipation = (expense: any, userId: number) =>
    expense.preferencesFilled[userId.toString()];

  const pendingExpensesToFill = expenses.filter(
    (expense) => !hasUserParticipation(expense, user?.id)
  );

  const expensesFilledByUser = expenses.filter((expense) =>
    hasUserParticipation(expense, user?.id)
  );
  return (
    <>
      <div className="w-full space-y-4">
        {expenses.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No pending expenses yet.
          </div>
        ) : (
          <div className="space-y-6">
            {pendingExpensesToFill.length > 0 && (
              <div className="space-y-4">
                <h1 className="text-lg font-semibold">
                  Preferences pending to fill 🤓
                </h1>
                {pendingExpensesToFill.map((expense, idx) => (
                  <ExpenseCard
                    key={expense._id}
                    expense={expense}
                    index={idx}
                    expenseOwnerId={expense.userId}
                    groupMembers={group?.members || []}
                    refreshExpenses={fetchPendingExpenses}
                  />
                ))}
              </div>
            )}
            {expensesFilledByUser.length > 0 && (
              <div className="space-y-4">
                <h1 className="text-lg font-semibold">
                  Preferences filled by you 😎
                </h1>
                {expensesFilledByUser.map((expense, idx) => (
                  <ExpenseCard
                    key={expense._id}
                    expense={expense}
                    index={idx}
                    expenseOwnerId={expense.userId}
                    groupMembers={group?.members || []}
                    refreshExpenses={fetchPendingExpenses}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
