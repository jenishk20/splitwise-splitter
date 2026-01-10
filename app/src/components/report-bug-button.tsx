"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BugReportForm } from "./bug-report-form";
import { Bug, MessageSquarePlus } from "lucide-react";

export function ReportBugButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2 hover-lift border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5 text-amber-600 dark:text-amber-400"
        onClick={() => setIsOpen(true)}
      >
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Report Issue</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-primary/5 rounded-lg pointer-events-none" />
          <DialogHeader className="relative">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-amber-500/10">
                <MessageSquarePlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <DialogTitle className="text-xl">Report an Issue</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground">
              Help us improve by reporting bugs or suggesting improvements. We appreciate your feedback!
            </DialogDescription>
          </DialogHeader>
          <BugReportForm onSubmitSuccess={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
