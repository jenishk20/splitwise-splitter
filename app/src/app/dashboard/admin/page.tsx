"use client";

import { useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useUser();

  // Redirect non-admin users
  useEffect(() => {
    if (!user?.isAdmin) {
      redirect("/dashboard");
    }
  }, [user]);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <Separator className="my-6" />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bug-reports">Bug Reports</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
                <CardDescription>Active users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Groups</CardTitle>
                <CardDescription>Active groups created</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bug Reports</CardTitle>
                <CardDescription>Pending reports to review</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bug-reports" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bug Reports</CardTitle>
              <CardDescription>View and manage reported issues</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No bug reports found</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
