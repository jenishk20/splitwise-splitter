import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { Group } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const getGroupStats = (groups: Group[]) => {
	const settledGroups = groups.filter((group) =>
		group.members.every((m) => Number(m.balance?.[0]?.amount ?? 0) === 0),
	);

	const unsettledGroups = groups.length - settledGroups.length;

	const totalOutstanding = groups.reduce((sum, group) => {
		return (
			sum +
			group.members.reduce((innerSum, m) => {
				const amount = Number.parseFloat(m.balance?.[0]?.amount ?? 0);
				return innerSum + (amount > 0 ? amount : 0);
			}, 0)
		);
	}, 0);

	return {
		settledGroups,
		unsettledGroups,
		totalOutstanding: Number(totalOutstanding.toFixed(2)),
	};
};

export const GroupStats = ({ groups }: { groups: Group[] }) => {
	const [groupStats, setGroupStats] = useState<{
		settledGroups: Group[];
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
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			{groupStats ? (
				<>
					<GroupStatsCard
						stat={groups?.length ?? 0}
						header="Total Groups"
						icon={<Users />}
					/>
					<GroupStatsCard
						stat={groupStats?.unsettledGroups ?? 0}
						header="Unsettled Groups"
						icon={<CircleAlert />}
					/>
					<GroupStatsCard
						stat={groupStats?.totalOutstanding ?? 0}
						header="Total Outstanding"
						icon={<DollarSign />}
					/>
				</>
			) : (
				<>
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
	icon,
}: {
	stat: number;
	header: string;
	icon: React.ReactNode;
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex font-bold items-center gap-2">
					{header} {icon}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-5xl font-bold">{stat}</p>
			</CardContent>
		</Card>
	);
};

const LoadingGroupStatsCard = () => {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex font-bold items-center gap-2">
					<Skeleton className="w-4 h-4" />
					<Skeleton className="w-24 h-4" />
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Skeleton className="w-full h-24" />
			</CardContent>
		</Card>
	);
};
