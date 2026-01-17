"use client";

import { Card, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface ExpenseCardProps {
  expense: any;
  index: number;
  groupMembers: any[];
  expenseOwnerId: string;
  refreshExpenses: () => void;
}

export const ExpenseCard = ({
  expense,
  index,
}: ExpenseCardProps) => {
  return (
    <Card>
      <CardContent>
        <CardTitle className="text-lg font-bold flex items-center justify-between">
          <Link
            className="hover:underline"
            href={`/dashboard/group/${expense.groupId}/expenses/${expense._id}`}
          >
            {`Expense ${index + 1}: ${expense.description}`}
          </Link>
          <span className="text-sm text-muted-foreground">
            {`${expense.items.length} items`}
          </span>
        </CardTitle>
      </CardContent>
    </Card>
  );
};
