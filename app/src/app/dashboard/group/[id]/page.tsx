"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeftIcon,
  ImageIcon,
  Loader2,
  Table,
  X,
  Home,
  Receipt,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GroupMember } from "@/lib/types";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getPendingExpenses,
  handleFileUpload,
  submitManualExpense,
} from "@/client/user";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { CompletedJobs } from "./completed-jobs";
import { type NavigationItem, useGroup } from "./group-provider";
import { ExpenseCard } from "./expense-card";
import { Accordion } from "@radix-ui/react-accordion";

interface Group {
  id: number;
  name: string;
  members: GroupMember[];
}

export default function GroupPage() {
  const { id } = useParams();
  const { groups } = useUser();
  const { activeElement, setActiveElement } = useGroup();
  const [expenses, setExpenses] = useState<any[]>([]);

  const group = groups?.find((group) => group.id === Number(id));

  const fetchPendingExpenses = async () => {
    try {
      const pendingExpenses = await getPendingExpenses(id as string);
      setExpenses(pendingExpenses);
    } catch (error) {
      console.error("Failed to fetch pending expenses:", error);
      toast.error("Failed to fetch pending expenses");
    }
  };
  useEffect(() => {
    fetchPendingExpenses();
  }, [activeElement]);

  // console.log("Group:", group);
  // console.log("Active Element:", activeElement);
  // console.log("Expenses:", expenses);

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <Sidebar activeItem={activeElement} onSelect={setActiveElement} />
      <div className="flex-1 w-full">
        <section className="w-full h-full px-4 sm:px-6 max-w-screen-lg mx-auto">
          <div className="pt-6 lg:pt-12 flex items-center justify-between text-primary animate-fade-in">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeftIcon className="w-4 h-4" />
                </Link>
              </Button>
              <h1 className="text-2xl lg:text-3xl font-bold">{group?.name}</h1>
            </div>
          </div>
          <Separator className="my-4 lg:my-6" />
          {activeElement === "home" && <HomeContent group={group} />}
          {activeElement === "expenses" && (
            <ExpensesContent
              expenses={expenses}
              refreshExpenses={fetchPendingExpenses}
            />
          )}
          {activeElement === "invoices" && (
            <CompletedJobs groupId={Number(id)} />
          )}
        </section>
      </div>
    </div>
  );
}

const GroupMembersCard = ({ members }: { members: GroupMember[] }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] lg:h-[600px]">
          <ul className="space-y-4">
            {members.map((member) => (
              <li key={member.id}>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.picture.small} />
                  </Avatar>
                  <div>
                    <div>{member.first_name}</div>
                    <div className="text-xs font-semibold opacity-60">
                      {member.email}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const GroupExpensesCard = () => {
  const { id } = useParams();
  const { groups } = useUser();
  const { setActiveElement } = useGroup();
  const group = groups?.find((group) => group.id === Number(id));

  const [pictureFileState, setPictureFileState] = useState<{
    file: File | null;
    error: boolean;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);

  // Manual expense state
  const [manualItems, setManualItems] = useState<
    Array<{
      name: string;
      quantity: number;
      price: number;
    }>
  >([]);
  const [currentItem, setCurrentItem] = useState({
    name: "",
    quantity: 0,
    price: 0,
  });
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const {
    getInputProps: getPictureInputProps,
    getRootProps: getPictureRootProps,
  } = useDropzone({
    onDrop: (acceptedFiles) => {
      setPictureFileState({
        file: acceptedFiles[0],
        error: false,
      });
    },
    onDropRejected: () => {
      setPictureFileState({
        file: null,
        error: true,
      });
      toast.error("Invalid file", {
        description: "Please make sure the file is an image",
      });
    },
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: false,
  });

  useEffect(() => {
    setTimeout(() => {
      if (pictureFileState?.error) {
        setPictureFileState({
          ...pictureFileState,
          error: false,
        });
      }
    }, 2000);
  }, [pictureFileState]);

  const handleUploadMutation = useMutation({
    mutationFn: async (file: File) => {
      return handleFileUpload(file, group?.id ?? 0);
    },
    onMutate: () => {
      setIsUploading(true);
    },
    onSettled: () => {
      setIsUploading(false);
    },
    onSuccess: () => {
      setActiveElement("invoices");
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: (error as Error).message,
      });
    },
  });

  const handleManualExpenseMutation = useMutation({
    mutationFn: async (
      items: Array<{ name: string; quantity: number; price: number }>
    ) => {
      return submitManualExpense(group?.id ?? 0, items, group as any);
    },
    onMutate: () => {
      setIsSubmittingManual(true);
    },
    onSettled: () => {
      setIsSubmittingManual(false);
    },
    onSuccess: () => {
      setActiveElement("expenses");
      setManualItems([]);
      setCurrentItem({ name: "", quantity: 0, price: 0 });
      toast.success("Manual expense added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add manual expense", {
        description: (error as Error).message,
      });
    },
  });

  const addManualItem = () => {
    if (!currentItem.name.trim()) {
      toast.error("Please enter an item name");
      return;
    }
    if (currentItem.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    if (currentItem.price <= 0) {
      toast.error("Price per item must be greater than 0");
      return;
    }

    setManualItems((prev) => [...prev, { ...currentItem }]);
    setCurrentItem({ name: "", quantity: 0, price: 0 });
  };

  const removeManualItem = (index: number) => {
    setManualItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitManualExpense = () => {
    if (manualItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }
    handleManualExpenseMutation.mutate(manualItems);
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <Tabs defaultValue="picture" className="w-full h-full">
          <TabsList className="w-full">
            <TabsTrigger value="picture" className="border-none w-full">
              <ImageIcon className="w-4 h-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="manual" className="border-none w-full">
              <Plus className="w-4 h-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="picture" className="h-full">
            {pictureFileState?.file ? (
              <ScrollArea className="relative w-full h-[500px]">
                <Image
                  src={URL.createObjectURL(pictureFileState.file)}
                  alt="Uploaded"
                  className="w-full h-full object-contain"
                  width={1000}
                  height={1000}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 cursor-pointer"
                  onClick={() => {
                    setPictureFileState(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  className="absolute bottom-2 right-2"
                  disabled={isUploading}
                  onClick={() => {
                    if (!pictureFileState?.file) {
                      toast.error("No image selected");
                      return;
                    }
                    handleUploadMutation.mutate(pictureFileState.file);
                  }}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </ScrollArea>
            ) : (
              <div
                {...getPictureRootProps()}
                className={`w-full h-full rounded-md border-4 
							cursor-pointer text-muted-foreground mt-4 
							border-border border-dashed flex flex-col items-center justify-center gap-4 ${
                pictureFileState?.error && "border-red-800 text-red-800"
              }`}
              >
                <ImageIcon className="w-14 h-14" />
                <h1 className="text-base">
                  Click or drag and drop your image here
                </h1>
                <p className="text-sm">Accepts: .png, .jpg, .jpeg</p>
                <input {...getPictureInputProps()} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="h-full">
            <div className="space-y-4 mt-4">
              {/* Add Item Form */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    placeholder="e.g., Pizza"
                    value={currentItem.name}
                    onChange={(e) =>
                      setCurrentItem((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={currentItem.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCurrentItem((prev) => ({
                        ...prev,
                        quantity: value === "" ? 0 : parseInt(value) || 0,
                      }));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Item ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={currentItem.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCurrentItem((prev) => ({
                        ...prev,
                        price: value === "" ? 0 : parseFloat(value) || 0,
                      }));
                    }}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addManualItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </div>

              {/* Items List */}
              {manualItems.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Items</Label>
                  <ScrollArea className="max-h-[300px] border rounded-lg p-4">
                    <div className="space-y-2">
                      {manualItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted rounded"
                        >
                          <div className="flex-1">
                            <span className="font-medium">{item.name}</span>
                            <span className="text-muted-foreground ml-2">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}{" "}
                              per item = $
                              {(item.quantity * item.price).toFixed(2)}
                            </span>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeManualItem(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Total and Submit */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-lg font-semibold">
                      Total: $
                      {manualItems
                        .reduce(
                          (sum, item) => sum + item.quantity * item.price,
                          0
                        )
                        .toFixed(2)}
                    </div>
                    <Button
                      onClick={handleSubmitManualExpense}
                      disabled={isSubmittingManual || manualItems.length === 0}
                      className="min-w-[120px]"
                    >
                      {isSubmittingManual ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Submit Expense
                    </Button>
                  </div>
                </div>
              )}

              {manualItems.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  No items added yet. Use the form above to add items.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Upload an image for AI-powered expense parsing, or manually enter
          expense items with their quantities and prices.
        </p>
      </CardFooter>
    </Card>
  );
};

const Sidebar = ({
  activeItem,
  onSelect,
}: {
  activeItem: NavigationItem;
  onSelect: (item: NavigationItem) => void;
}) => {
  return (
    <div className="w-full lg:w-64 lg:pt-12 h-auto lg:h-screen flex items-center lg:items-start border-b lg:border-b-0 lg:border-r">
      <div className="w-full lg:w-auto bg-background lg:rounded-lg lg:border lg:shadow-sm p-4 mx-4">
        <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
          <Button
            variant={activeItem === "home" ? "secondary" : "ghost"}
            className="flex-1 lg:flex-none lg:w-full justify-start"
            onClick={() => onSelect("home")}
          >
            <Home className="mr-2 h-4 w-4" />
            <span className="sm:inline">Home</span>
          </Button>
          <Button
            variant={activeItem === "expenses" ? "secondary" : "ghost"}
            className="flex-1 lg:flex-none lg:w-full justify-start"
            onClick={() => onSelect("expenses")}
          >
            <Receipt className="mr-2 h-4 w-4" />
            <span className="sm:inline">Expenses</span>
          </Button>
          <Button
            variant={activeItem === "invoices" ? "secondary" : "ghost"}
            className="flex-1 lg:flex-none lg:w-full justify-start"
            onClick={() => onSelect("invoices")}
          >
            <FileText className="mr-2 h-4 w-4" />
            <span className="sm:inline">Invoices</span>
          </Button>
        </nav>
      </div>
    </div>
  );
};

const HomeContent = ({ group }: { group: Group | undefined }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <GroupMembersCard members={group?.members ?? []} />
      <GroupExpensesCard />
    </div>
  );
};

// const ExpensesContent = () => {
//   return (
//     <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Expenses</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-muted-foreground">No expenses yet.</p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

const ExpensesContent = ({
  expenses,
  refreshExpenses,
}: {
  expenses: any[];
  refreshExpenses: () => void;
}) => {
  const { groups } = useUser();
  const { id } = useParams();
  const group = groups?.find((g) => g.id === Number(id));

  return (
    <Accordion type="multiple" className="w-full space-y-4">
      {expenses.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">
          No pending expenses yet.
        </div>
      ) : (
        expenses.map((expense, idx) => (
          <ExpenseCard
            key={expense._id}
            expense={expense}
            index={idx}
            groupMembers={group?.members || []}
            refreshExpenses={refreshExpenses}
          />
        ))
      )}
    </Accordion>
  );
};
