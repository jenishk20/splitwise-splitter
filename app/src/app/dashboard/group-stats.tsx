import { Card, CardContent } from "@/components/ui/card";
import { CircleAlert, DollarSign, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { Group } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const getGroupStats = (groups: Group[]) => {
  const settledGroups = groups.filter((group) =>
    group.members.every((m) => Number(m.balance?.[0]?.amount ?? 0) === 0)
  );

  const unsettledGroups = groups.length - settledGroups.length;

  const totalOutstanding = groups.reduce((sum, group) => {
    return (
      sum +
      group.members.reduce((innerSum, m) => {
        const amount = Number.parseFloat(m.balance?.[0]?.amount ?? "0");
        return innerSum + (amount > 0 ? amount : 0);
      }, 0)
    );
  }, 0);

  return {
    settledGroups: settledGroups.length,
    unsettledGroups,
    totalOutstanding: Number(totalOutstanding.toFixed(2)),
  };
};

export const GroupStats = ({ groups }: { groups: Group[] }) => {
  const [groupStats, setGroupStats] = useState<{
    settledGroups: number;
    unsettledGroups: number;
    totalOutstanding: number;
  } | null>(null);

  useEffect(() => {
    if (groups) {
      const { settledGroups, unsettledGroups, totalOutstanding } =
        getGroupStats(groups);
      setGroupStats({
        settledGroups,
        unsettledGroups,
        totalOutstanding,
      });
    }
  }, [groups]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {groupStats ? (
        <>
          <GroupStatsCard
            stat={groups?.length ?? 0}
            header="Total Groups"
            subtitle="All your groups"
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
            trend={null}
          />
          <GroupStatsCard
            stat={groupStats?.settledGroups ?? 0}
            header="Settled"
            subtitle="All balanced"
            icon={<CheckCircle2 className="h-5 w-5" />}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-500"
            trend="positive"
          />
          <GroupStatsCard
            stat={groupStats?.unsettledGroups ?? 0}
            header="Unsettled"
            subtitle="Need attention"
            icon={<CircleAlert className="h-5 w-5" />}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-500"
            trend={groupStats?.unsettledGroups > 0 ? "negative" : "neutral"}
          />
          <GroupStatsCard
            stat={groupStats?.totalOutstanding ?? 0}
            header="Outstanding"
            subtitle="Total balance"
            icon={<DollarSign className="h-5 w-5" />}
            iconBg="bg-violet-500/10"
            iconColor="text-violet-500"
            isCurrency
            trend={null}
          />
        </>
      ) : (
        <>
          <LoadingGroupStatsCard />
          <LoadingGroupStatsCard />
          <LoadingGroupStatsCard />
          <LoadingGroupStatsCard />
        </>
      )}
    </div>
  );
};

const GroupStatsCard = ({
  stat,
  header,
  subtitle,
  icon,
  iconBg,
  iconColor,
  isCurrency = false,
  trend,
}: {
  stat: number;
  header: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isCurrency?: boolean;
  trend: "positive" | "negative" | "neutral" | null;
}) => {
  return (
    <Card className="hover-lift group overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card via-card to-secondary/30">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className={`inline-flex p-2.5 rounded-xl ${iconBg} ${iconColor}`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{header}</p>
              <p className="text-3xl font-bold tracking-tight number-counter mt-1">
                {isCurrency && "$"}
                {isCurrency ? stat.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : stat}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1">{subtitle}</p>
            </div>
          </div>
          {trend && (
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend === "positive"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : trend === "negative"
                  ? "bg-amber-500/10 text-amber-600"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 ${trend === "negative" ? "rotate-180" : ""}`}
              />
              {trend === "positive" ? "Good" : trend === "negative" ? "Alert" : "—"}
            </div>
          )}
        </div>
        
        {/* Decorative element */}
        <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </CardContent>
    </Card>
  );
};

const LoadingGroupStatsCard = () => {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <Skeleton className="w-11 h-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="w-20 h-4" />
            <Skeleton className="w-16 h-8" />
            <Skeleton className="w-24 h-3" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
