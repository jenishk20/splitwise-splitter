import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InvoiceItem, InvoiceJob } from "@/lib/types";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { submitExpenseToGroup } from "@/client/user";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useGroup } from "@/app/dashboard/group/[id]/group-provider";
export const InvoiceModal = ({
  job,
  disabled,
  number,
}: {
  job: InvoiceJob;
  disabled: boolean;
  number: number;
}) => {
  const [parsedResult, setParsedResult] = useState<InvoiceItem[]>([]);
  const { groups } = useUser();
  const { setActiveElement } = useGroup();
  const group = groups?.find((group) => group.id === Number(job.groupId));
  const members = group?.members;
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (job?.parsedResult) {
      setParsedResult(JSON.parse(String(job?.parsedResult)));
    }
  }, [job?.parsedResult]);

  const handleSubmitExpense = async () => {
    try {
      if (!group) throw new Error("Group not found");
      await submitExpenseToGroup(group, parsedResult, description);
      toast.success("Expense submitted to the group!");
      setActiveElement("expenses");
    } catch (err) {
      console.error("Error submitting expense:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button disabled={disabled}>View</Button>
      </DialogTrigger>
      <DialogContent className="min-w-[90vw] min-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Invoice {number}</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short description (e.g., Grocery trip, Dinner bill, etc.)"
          />
        </div>

        <ScrollArea className="h-[70vh]">
          <Table>
            <TableHeader>
              <TableRow className="text-center text-base font-bold">
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                {/* {members?.map((member) => (
                  <TableHead className="text-center" key={member.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={member.picture.small} />
                      </Avatar>
                      {member.first_name}
                    </div>
                  </TableHead>
                ))} */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedResult?.map((item: InvoiceItem, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <TableRow key={item.item + idx}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price}</TableCell>
                  {/* {members?.map((member) => (
                    <TableCell key={member.id} className="text-center">
                      <Checkbox />
                    </TableCell>
                  ))} */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter>
          <Button onClick={handleSubmitExpense}>Submit Expense to Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
