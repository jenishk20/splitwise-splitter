"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { UserAvatar } from "./user-avatar";
import { GroupStats } from "./group-stats";
import { UserGroups } from "./user-groups";
import { ReportBugButton } from "@/components/report-bug-button";
import { Button } from "@/components/ui/button";
import { LineChart, Sparkles, TrendingUp } from "lucide-react";
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
    <section className="w-full min-h-screen pb-16">
      {/* Decorative background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-20 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-primary/5 rounded-full blur-2xl" />
      </div>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        <div className="relative px-4 sm:px-6 md:px-8 max-w-screen-lg mx-auto">
          <div className="pt-12 pb-10">
            <div className="flex items-start justify-between animate-fade-in">
              {user ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 animate-float">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        Dashboard
                      </span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                      Welcome back,{" "}
                      <span className="text-gradient">{user?.first_name}</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-md">
                      Track your expenses, manage groups, and keep your finances in perfect balance.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <TrendingUp className="h-4 w-4" />
                        <span>{groups?.length ?? 0} Active Groups</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {user?.isAdmin && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 hover-lift border-primary/20 hover:border-primary/40 hover:bg-primary/5" 
                        asChild
                      >
                        <Link href="/dashboard/admin">
                          <LineChart className="h-4 w-4" />
                          <span className="hidden sm:inline">Admin Dashboard</span>
                        </Link>
                      </Button>
                    )}
                    <ReportBugButton />
                    <div className="ring-4 ring-primary/20 rounded-full hover-lift">
                      <UserAvatar />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <Skeleton className="w-32 h-6" />
                  <Skeleton className="w-80 h-12" />
                  <Skeleton className="w-64 h-6" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 max-w-screen-lg mx-auto">
        <div className="space-y-10">
          {/* Stats Section */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-8 rounded-full bg-primary" />
              <h2 className="text-xl font-semibold text-foreground/80">Overview</h2>
            </div>
            <GroupStats groups={groups ?? []} />
          </div>

          {/* Groups Section */}
          <div className="animate-slide-up animation-delay-200">
            <UserGroups groups={groups ?? []} isLoading={groupsLoading} />
          </div>
        </div>
      </div>
    </section>
  );
}
