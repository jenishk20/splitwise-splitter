import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Group } from "@/lib/types";
import {
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Minus,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const UserGroups = ({
  groups,
  isLoading,
}: {
  groups: Group[];
  isLoading: boolean;
}) => {
  // Sort groups: unsettled (active) first, then settled
  const sortedGroups = [...groups].sort((a: Group, b: Group) => {
    const aSettled = a.members.every(
      (m) => Number(m.balance?.[0]?.amount ?? 0) === 0
    );
    const bSettled = b.members.every(
      (m) => Number(m.balance?.[0]?.amount ?? 0) === 0
    );
    // Unsettled (false=0) comes before settled (true=1)
    return Number(aSettled) - Number(bSettled);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 rounded-full bg-primary" />
          <h2 className="text-xl font-semibold text-foreground/80">
            Your Groups
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {groups.length} group{groups.length !== 1 ? "s" : ""} total
        </div>
      </div>

      {!isLoading && groups.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              Groups from your Splitwise account will appear here once you have
              some.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loading
                <GroupCardSkeleton key={index} />
              ))
            : sortedGroups.map((group, index) => (
                <div
                  key={group.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <GroupCard group={group} />
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

const GroupCard = ({ group }: { group: Group }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getMemberBalance = (member: Group["members"][0]) => {
    const balance = member.balance[0];
    if (!balance) return { amount: 0, currency: "USD" };
    return {
      amount: Number.parseFloat(balance.amount),
      currency: balance.currency_code,
    };
  };

  // Calculate group status
  const isSettled = group.members.every(
    (m) => Number(m.balance?.[0]?.amount ?? 0) === 0
  );

  // Get first letter of group name for avatar fallback
  const groupInitials = group.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  // Generate a consistent color based on group id
  const hue = (group.id * 137) % 360;
  const gradientStyle = {
    background: `linear-gradient(135deg, hsl(${hue}, 70%, 50%), hsl(${
      (hue + 40) % 360
    }, 70%, 60%))`,
  };

  return (
    <Card className="hover-lift group overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl">
      {/* Top accent bar */}
      <div className="h-1 w-full" style={gradientStyle} />

      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 rounded-xl shadow-md ring-2 ring-white/50 dark:ring-black/20">
            {group.avatar?.medium ? (
              <AvatarImage
                src={group.avatar.medium}
                alt={group.name}
                className="object-cover"
              />
            ) : null}
            <AvatarFallback
              className="rounded-xl text-white font-bold text-lg"
              style={gradientStyle}
            >
              {groupInitials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-lg font-bold truncate">
                  {group.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {group.members.length} member
                    {group.members.length !== 1 ? "s" : ""}
                  </span>
                </CardDescription>
              </div>

              {/* Status badge */}
              <div
                className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                  isSettled
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {isSettled ? (
                  <>
                    <Wallet className="h-3 w-3" />
                    Settled
                  </>
                ) : (
                  <>
                    <Wallet className="h-3 w-3" />
                    Active
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button className="flex-1 cursor-pointer gap-2 group/btn" asChild>
            <Link href={`/dashboard/group/${group.id}`}>
              <span>View Expenses</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center cursor-pointer gap-2 px-3"
          >
            {showDetails ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-border/50 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-muted-foreground">
                Member Balances
              </h4>
            </div>
            <div className="space-y-2">
              {group.members.map((member) => {
                const { amount, currency } = getMemberBalance(member);
                return (
                  <div
                    key={member.id}
                    className="flex justify-between items-center text-sm p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.picture?.small} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {member.first_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{member.first_name}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1 font-semibold ${
                        amount > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : amount < 0
                          ? "text-red-500 dark:text-red-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {amount > 0 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : amount < 0 ? (
                        <TrendingDown className="h-3.5 w-3.5" />
                      ) : (
                        <Minus className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {amount > 0
                          ? `+${amount.toFixed(2)}`
                          : amount.toFixed(2)}{" "}
                        {currency}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GroupCardSkeleton = () => {
  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <div className="h-1 w-full bg-muted" />
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </CardContent>
    </Card>
  );
};
