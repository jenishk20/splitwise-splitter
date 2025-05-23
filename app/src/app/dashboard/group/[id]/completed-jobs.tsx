"use client";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getCompletedJobs } from "@/client";
import type { InvoiceJob } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { InvoiceModal } from "./invoice-modal";

export const CompletedJobs = ({ groupId }: { groupId: number }) => {
	const {
		data: completedJobs = [],
		isLoading,
		error,
	} = useQuery<InvoiceJob[]>({
		queryKey: ["completedJobs", groupId],
		queryFn: () => getCompletedJobs(groupId),
		refetchInterval: 1000,
	});

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Done":
				return "default";
			case "Error":
				return "destructive";
			default:
				return "secondary";
		}
	};

	return (
		<ScrollArea className="w-full h-[700px] mb-2">
			<h1 className="text-2xl font-bold">
				Uploaded Invoices ({completedJobs?.length || 0})
			</h1>
			<div className="grid mt-3 grid-cols-1 gap-4">
				{isLoading ? (
					Array.from({ length: 5 }).map((_, idx) => (
						<JobCardSkeleton
							key={`skeleton-${
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								idx
							}`}
						/>
					))
				) : error ? (
					<div className="flex items-center gap-2 text-destructive">
						<AlertCircle className="h-4 w-4" />
						<p>Failed to load invoices</p>
					</div>
				) : completedJobs?.length === 0 ? (
					<div className="text-muted-foreground text-center py-8">
						No invoices uploaded yet
					</div>
				) : (
					completedJobs.map((job: InvoiceJob, idx: number) => (
						<Card key={job.jobId}>
							<CardHeader className="flex items-center justify-between">
								<div className="space-y-4">
									<div className="flex items-center gap-2">
										<CardTitle>{`Invoice ${completedJobs.length - idx}`}</CardTitle>
										<Badge variant={getStatusColor(job.status)}>
											{job.status}
										</Badge>
									</div>
									<CardDescription>
										{format(new Date(job.createdAt), "MMM d, yyyy h:mm a")}
									</CardDescription>
								</div>
								<InvoiceModal
									job={job}
									disabled={job.status !== "Done"}
									number={completedJobs.length - idx}
								/>
							</CardHeader>
						</Card>
					))
				)}
			</div>
		</ScrollArea>
	);
};

const JobCardSkeleton = () => {
	return (
		<Card>
			<CardHeader className="flex items-center justify-between">
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<CardTitle>
							<Skeleton className="w-22 h-4" />
						</CardTitle>
						<Skeleton className="w-10 h-4" />
					</div>
					<CardDescription>
						<Skeleton className="w-32 h-4" />
					</CardDescription>
				</div>
				<Skeleton className="w-15 h-10" />
			</CardHeader>
		</Card>
	);
};
