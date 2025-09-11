"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GroupMember } from "@/lib/types";
import { useDropzone } from "react-dropzone";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { handleFileUpload } from "@/client/user";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { ImageIcon, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Group {
  id: number;
  name: string;
  members: GroupMember[];
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
  const router = useRouter();
  const group = groups?.find((group) => group.id === Number(id));

  const [pictureFileState, setPictureFileState] = useState<{
    file: File | null;
    error: boolean;
  } | null>(null);

  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    const handleImagePaste = (event: ClipboardEvent) => {
      if(!event.clipboardData) return;

      const items = event.clipboardData.items;
      const imageItems = Array.from(items).filter((item) => item.type.startsWith("image/"));
      if(imageItems.length === 0) return;

      const file = imageItems[0].getAsFile();
      if(!file) return;

      setPictureFileState({
        file,
        error: false,
      });
    }

    document.addEventListener("paste", handleImagePaste);
    return () => {
      document.removeEventListener("paste", handleImagePaste);
    };
  }, []);

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
      router.push(`/dashboard/group/${id}/invoices`);
      toast.success("File uploaded successfully");
    },
    onError: (error) => {
      toast.error("Upload failed", {
        description: (error as Error).message,
      });
    },
  });

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
                  Click or drag and drop your image here or paste from clipboard
                </h1>
                <p className="text-sm">Accepts: .png, .jpg, .jpeg</p>
                <input {...getPictureInputProps()} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default function HomePage() {
  const { id } = useParams();
  const { groups } = useUser();
  const group = groups?.find((group) => group.id === Number(id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <GroupMembersCard members={group?.members ?? []} />
      <GroupExpensesCard />
    </div>
  );
}
