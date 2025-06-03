"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { BugReport } from "@/lib/types";

export function BugReports() {
  const [loading, setLoading] = useState(true);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);

  useEffect(() => {
    const fetchBugReports = async () => {
      try {
        const response = await fetch("/api/bug-reports");
        if (!response.ok) {
          throw new Error("Failed to fetch bug reports");
        }
        const data = await response.json();
        setBugReports(data);
      } catch (error) {
        toast.error("Failed to fetch bug reports");
        console.error("Error fetching bug reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBugReports();
  }, []);

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/bug-reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setBugReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: newStatus as "open" | "in-progress" | "closed",
              }
            : report
        )
      );

      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Failed to update status");
      console.error("Error updating status:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bug Reports</CardTitle>
        <CardDescription>View and manage reported issues</CardDescription>
      </CardHeader>
      <CardContent>
        {bugReports.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No bug reports found
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bugReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge
                      variant={
                        report.type === "bug" ? "destructive" : "default"
                      }
                    >
                      {report.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {report.description}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{report.reporterName}</p>
                      {report.reporterEmail && (
                        <p className="text-sm text-muted-foreground">
                          {report.reporterEmail}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={report.status}
                      onValueChange={(value) =>
                        handleStatusChange(report.id, value)
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
