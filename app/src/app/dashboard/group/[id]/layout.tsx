"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeftIcon,
  Home,
  Receipt,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const { id } = useParams();
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === `/dashboard/group/${id}${path}`;
  };

  return (
    <div className="w-full lg:w-64 lg:pt-12 h-auto lg:h-screen flex items-center lg:items-start border-b lg:border-b-0 lg:border-r">
      <div className="w-full lg:w-auto bg-background lg:rounded-lg lg:border lg:shadow-sm p-4 mx-4">
        <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
          <Button
            variant={isActive("/home") ? "secondary" : "ghost"}
            className="flex-1 lg:flex-none lg:w-full justify-start"
            asChild
          >
            <Link href={`/dashboard/group/${id}/home`}>
              <Home className="mr-2 h-4 w-4" />
              <span className="sm:inline">Home</span>
            </Link>
          </Button>
          <Button
            variant={isActive("/expenses") ? "secondary" : "ghost"}
            className="flex-1 lg:flex-none lg:w-full justify-start"
            asChild
          >
            <Link href={`/dashboard/group/${id}/expenses`}>
              <Receipt className="mr-2 h-4 w-4" />
              <span className="sm:inline">Expenses</span>
            </Link>
          </Button>
          <Button
            variant={isActive("/invoices") ? "secondary" : "ghost"}
            className="flex-1 lg:flex-none lg:w-full justify-start"
            asChild
          >
            <Link href={`/dashboard/group/${id}/invoices`}>
              <FileText className="mr-2 h-4 w-4" />
              <span className="sm:inline">Invoices</span>
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
};

export default function GroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
  const { id } = useParams();
  const { groups } = useUser();
  const group = groups?.find((group) => group.id === Number(id));

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      <Sidebar />
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
          {children}
        </section>
      </div>
    </div>
  );
}
