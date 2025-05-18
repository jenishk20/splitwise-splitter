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
import { ArrowLeftIcon, ImageIcon, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GroupMember } from "@/lib/types";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { handleFileUpload } from "@/client/user";
import { group } from "console";

export default function GroupPage() {
  const { id } = useParams();
  const { groups } = useUser();

  const group = groups?.find((group) => group.id === Number(id));
  return (
    <section className="w-full h-full px-4 sm:px-6 max-w-screen-lg mx-auto">
      <div className="mt-12 mb-6 flex items-center justify-between text-primary animate-fade-in">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeftIcon className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{group?.name}</h1>
        </div>
      </div>
      <Separator className="my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GroupMembersCard members={group?.members ?? []} />
        <GroupExpensesCard />
      </div>
    </section>
  );
}

const GroupMembersCard = ({ members }: { members: GroupMember[] }) => {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
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

  const group = groups?.find((group) => group.id === Number(id));

  const [csvFileState, setCsvFileState] = useState<{
    file: File | null;
    error: boolean;
  } | null>(null);

  const [pictureFileState, setPictureFileState] = useState<{
    file: File | null;
    error: boolean;
  } | null>(null);

  const { getInputProps: getCsvInputProps, getRootProps: getCsvRootProps } =
    useDropzone({
      accept: {
        "text/csv": [".csv"],
      },
      onDrop: (acceptedFiles) => {
        setCsvFileState({
          file: acceptedFiles[0],
          error: false,
        });
      },
      onDropRejected: () => {
        setCsvFileState({
          file: null,
          error: true,
        });
        toast.error("Invalid file", {
          description: "Please make sure the file is a CSV file",
        });
      },
    });

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
  });

  useEffect(() => {
    setTimeout(() => {
      if (csvFileState?.error) {
        setCsvFileState({
          ...csvFileState,
          error: false,
        });
      }
    }, 2000);
  }, [csvFileState]);

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

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Add Expense</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <Tabs defaultValue="csv" className="w-full h-full">
          <TabsList className="w-full">
            <TabsTrigger value="csv" className="border-none w-full">
              <Table className="w-4 h-4" />
              CSV
            </TabsTrigger>
            <TabsTrigger value="picture" className="border-none w-full">
              <ImageIcon className="w-4 h-4" />
              Image
            </TabsTrigger>
          </TabsList>
          <TabsContent value="csv" className="h-full">
            <div
              {...getCsvRootProps()}
              className={`w-full h-full rounded-md border-4 
							cursor-pointer text-muted-foreground mt-4 
							border-border border-dashed flex flex-col items-center justify-center gap-4 ${
                csvFileState?.error && "border-red-800 text-red-800"
              }`}
            >
              <Table className="w-14 h-14" />
              <h1 className="text-base">
                Click or drag and drop your CSV file here
              </h1>
              <p className="text-sm">Accepts: .csv</p>
              <input {...getCsvInputProps()} />
            </div>
          </TabsContent>
          <TabsContent value="picture">
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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button
          className="ml-auto"
          onClick={async () => {
            if (!pictureFileState?.file) {
              toast.error("No image selected");
              return;
            }
            try {
              await handleFileUpload(pictureFileState.file, group?.id);
              toast.success("File uploaded successfully");
            } catch (err) {
              console.error(err);
              toast.error("Upload failed", {
                description: (err as Error).message,
              });
            }
          }}
        >
          Upload Image
        </Button>

        <p className="text-sm text-muted-foreground">
          Please make sure both the image and the CSV file are clear and
          readable. They must have amount, quantity and items.
        </p>
      </CardFooter>
    </Card>
  );
};
