import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { InvoiceItem, InvoiceJob } from "@/lib/types";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUser } from "@/hooks/use-user";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

export const InvoiceModal = ({
	job,
	disabled,
	number,
}: {
	job: InvoiceJob;
	disabled: boolean;
	number: number;
}) => {
	const [parsedResult, setParsedResult] = useState<InvoiceItem[]>([]);
	const { groups } = useUser();
	const group = groups?.find((group) => group.id === Number(job.groupId));
	const members = group?.members;

	useEffect(() => {
		if (job?.parsedResult) {
			setParsedResult(JSON.parse(String(job?.parsedResult)));
		}
	}, [job?.parsedResult]);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button disabled={disabled}>View</Button>
			</DialogTrigger>
			<DialogContent className="min-w-[90vw] min-h-[90vh]">
				<DialogHeader>
					<DialogTitle>Invoice {number}</DialogTitle>
				</DialogHeader>
				<ScrollArea className="h-[70vh]">
					<Table>
						<TableHeader>
							<TableRow className="text-center text-base font-bold">
								<TableHead>Item</TableHead>
								<TableHead>Quantity</TableHead>
								<TableHead>Price</TableHead>
								{members?.map((member) => (
									<TableHead className="text-center" key={member.id}>
										<div className="flex items-center gap-2">
											<Avatar className="w-6 h-6">
												<AvatarImage src={member.picture.small} />
											</Avatar>
											{member.first_name}
										</div>
									</TableHead>
								))}
							</TableRow>
						</TableHeader>
						<TableBody>
							{parsedResult?.map((item: InvoiceItem, idx) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
								<TableRow key={item.item + idx}>
									<TableCell>{item.item}</TableCell>
									<TableCell>{item.quantity}</TableCell>
									<TableCell>{item.price}</TableCell>
									{members?.map((member) => (
										<TableCell key={member.id} className="text-center">
											<Checkbox />
										</TableCell>
									))}
								</TableRow>
							))}
						</TableBody>
					</Table>
				</ScrollArea>
				<DialogFooter>
					<Button>Save Invoice</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
