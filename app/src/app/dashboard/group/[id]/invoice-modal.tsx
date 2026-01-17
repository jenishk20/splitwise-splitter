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
import { Input } from "@/components/ui/input";
import type { InvoiceItem, InvoiceJob } from "@/lib/types";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { submitExpenseToGroup } from "@/client/user";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const group = groups?.find((group) => group.id === Number(job.groupId));
  const [description, setDescription] = useState("");
  useEffect(() => {
    if (job?.parsedResult) {
      setParsedResult(JSON.parse(String(job?.parsedResult)));
    }
  }, [job?.parsedResult]);

  const handleSubmitExpense = async () => {
    try {
      if (!group) throw new Error("Group not found");
      await submitExpenseToGroup(group, parsedResult, description, job?._id);
      toast.success("Expense submitted to the group!");
      router.push(`/dashboard/group/${job.groupId}/expenses`);
    } catch (err) {
      console.error("Error submitting expense:", err);
    }
  };

  const handleAddItem = () => {
    setParsedResult([...parsedResult, { item: "", quantity: 1, price: "" }]);
  };

  const handleItemChange = (
    value: string,
    idx: number,
    field: "item" | "quantity" | "price"
  ) => {
    setParsedResult((prev) => {
      const newItems = [...prev];
      if (field === "item") {
        newItems[idx].item = value;
      } else if (field === "quantity") {
        newItems[idx].quantity = Number(value) || 0;
      } else if (field === "price") {
        newItems[idx].price = value;
      }
      return newItems;
    });
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
                <TableHead>Price ( Per Item )</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedResult?.map((item: InvoiceItem, idx) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <TableRow key={idx}>
                  <TableCell>
                    <Input
                      type="text"
                      value={item.item}
                      onChange={(e) =>
                        handleItemChange(e.target.value, idx, "item")
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(e.target.value, idx, "quantity")
                      }
                    />
                  </TableCell>

                  <TableCell>
                    <Input
                      type="text"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(e.target.value, idx, "price")
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleAddItem}>
            Add Item
          </Button>
          <Button onClick={handleSubmitExpense}>Submit Expense to Group</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
