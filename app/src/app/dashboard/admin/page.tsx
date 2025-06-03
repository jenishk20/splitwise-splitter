"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { useUser } from "@/hooks/use-user";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsData {
  quickStats: {
    totalUsers: number;
    totalVisits: number;
    onlineUsers: number;
    activeSessions: number;
  };
  visitsData: ChartData<"line">;
  loginsData: ChartData<"bar">;
}

export default function AdminDashboard() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsData, setStatsData] = useState<StatsData | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!user?.isAdmin) {
      redirect("/dashboard");
    }
  }, [user]);

  // Fetch statistics data
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch stats");
        }
        const data = await response.json();
        setStatsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!statsData) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview of site activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {statsData.quickStats.totalUsers}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {statsData.quickStats.totalVisits}
                </p>
                <p className="text-sm text-muted-foreground">Total Visits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Now</CardTitle>
            <CardDescription>Real-time user activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {statsData.quickStats.onlineUsers}
                </p>
                <p className="text-sm text-muted-foreground">Online Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {statsData.quickStats.activeSessions}
                </p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visits" className="w-full">
        <TabsList>
          <TabsTrigger value="visits">Site Visits</TabsTrigger>
          <TabsTrigger value="logins">User Logins</TabsTrigger>
        </TabsList>

        <TabsContent value="visits">
          <Card>
            <CardHeader>
              <CardTitle>Site Visits Over Time</CardTitle>
              <CardDescription>Daily site visit statistics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <Line
                  data={statsData.visitsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logins">
          <Card>
            <CardHeader>
              <CardTitle>User Logins</CardTitle>
              <CardDescription>Daily user login statistics</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[400px]">
                <Bar
                  data={statsData.loginsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top" as const,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
