import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Group } from "@/lib/types";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export const UserGroups = ({
	groups,
	isLoading,
}: {
	groups: Group[];
	isLoading: boolean;
}) => {
	return (
		<div>
			<h1 className="text-2xl font-bold text-primary">Your Groups</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
				{isLoading
					? Array.from({ length: 6 }).map((_, index) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
							<GroupCardSkeleton key={index} />
						))
					: groups.map((group) => <GroupCard key={group.id} group={group} />)}
			</div>
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

	return (
		<Card className="hover:shadow-md transition-shadow">
			<CardHeader>
				<CardTitle className="text-lg font-bold">{group.name}</CardTitle>
				<CardDescription>
					{group.members.length} member{group.members.length === 1 ? "" : "s"}
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Button className="cursor-pointer" asChild>
						<Link href={`/dashboard/group/${group.id}`}>
							<Plus className="h-4 w-4" /> Add Expense
						</Link>
					</Button>
					<Button
						variant="secondary"
						onClick={() => setShowDetails(!showDetails)}
						className="flex items-center cursor-pointer gap-2"
					>
						{showDetails ? (
							<>
								Hide Details <ChevronUp className="h-4 w-4" />
							</>
						) : (
							<>
								Show Details <ChevronDown className="h-4 w-4" />
							</>
						)}
					</Button>
				</div>
				{showDetails && (
					<div className="space-y-2 pt-2 border-t">
						<h4 className="font-medium">Member Balances</h4>
						<div className="space-y-1">
							{group.members.map((member) => {
								const { amount, currency } = getMemberBalance(member);
								return (
									<div
										key={member.id}
										className="flex justify-between items-center text-sm"
									>
										<span>{member.first_name}</span>
										<span
											className={
												amount > 0
													? "text-green-600"
													: amount < 0
														? "text-red-600"
														: "text-gray-600"
											}
										>
											{amount > 0
												? `+${amount.toFixed(2)} ${currency}`
												: `${amount.toFixed(2)} ${currency}`}
										</span>
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
		<Card>
			<CardHeader>
				<Skeleton className="h-6 w-1/2" />
				<CardDescription>
					<Skeleton className="h-4 w-1/3" />
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="flex gap-2">
					<Skeleton className="h-8 w-1/3" />
					<Skeleton className="h-8 w-1/3" />
				</div>
			</CardContent>
		</Card>
	);
};
