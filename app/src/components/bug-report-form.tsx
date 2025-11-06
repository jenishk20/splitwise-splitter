"use client";

import { useState } from "react";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportBug } from "@/client/user";

interface BugReportFormProps {
  onSubmitSuccess?: () => void;
}

export function BugReportForm({ onSubmitSuccess }: BugReportFormProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    reporterName: user?.first_name
      ? `${user.first_name} ${user.last_name}`
      : "Anonymous",
    reporterEmail: user?.email || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.type || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      await reportBug(formData);
      toast.success("Bug report submitted successfully");
      setFormData({
        type: "",
        description: "",
        reporterName: user?.first_name
          ? `${user.first_name} ${user.last_name}`
          : "Anonymous",
        reporterEmail: user?.email || "",
      });

      onSubmitSuccess?.();
    } catch (error) {
      toast.error("Failed to submit bug report");
      console.error("Error submitting bug report:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger className="border-slate-400">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please describe the issue or improvement in detail"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[150px] border border-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                placeholder="Anonymous"
                value={formData.reporterName}
                onChange={(e) =>
                  setFormData({ ...formData, reporterName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={formData.reporterEmail}
                onChange={(e) =>
                  setFormData({ ...formData, reporterEmail: e.target.value })
                }
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
