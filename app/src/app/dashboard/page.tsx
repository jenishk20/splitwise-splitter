"use client";

import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { UserAvatar } from "./user-avatar";
import { GroupStats } from "./group-stats";
import { UserGroups } from "./user-groups";
import { ReportBugButton } from "@/components/report-bug-button";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import Link from "next/link";
import { RateLimitError } from "@/components/rate-limit-error";
import { AxiosError } from "axios";

export default function Dashboard() {
  const { user, groups, userError, groupsError, groupsLoading } = useUser();

  // Check for rate limiting errors
  const isRateLimited =
    (userError as AxiosError)?.response?.status === 429 ||
    (groupsError as AxiosError)?.response?.status === 429;

  if (isRateLimited) {
    return (
      <div className="w-full h-full px-4 sm:px-6 md:px-8 max-w-screen-lg mx-auto mt-12">
        <RateLimitError />
      </div>
    );
  }

  if (userError || groupsError) {
    window.location.href = "/";
  }

  return (
    <section className="w-full h-full px-4 sm:px-6 md:px-8 max-w-screen-lg mx-auto">
      <div className="mt-12 mb-6 flex items-center justify-between text-primary animate-fade-in">
        {user ? (
          <>
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">
                Hello, {user?.first_name} 👋
              </h1>
              <p className="text-muted-foreground">
                Welcome back to your dashboard
              </p>
            </div>
            <div className="flex items-center gap-4">
              {user?.isAdmin && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link href="/dashboard/admin">
                    <LineChart className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                </Button>
              )}
              <ReportBugButton />
              <UserAvatar />
            </div>
          </>
        ) : (
          <Skeleton className="w-full h-12" />
        )}
      </div>
      <Separator className="my-6" />
      <div className="space-y-8">
        <div className="animate-slide-up">
          <GroupStats groups={groups ?? []} />
        </div>
        <Separator className="my-6" />
        <div className="animate-slide-up animation-delay-200">
          <UserGroups groups={groups ?? []} isLoading={groupsLoading} />
        </div>
      </div>
    </section>
  );
}
