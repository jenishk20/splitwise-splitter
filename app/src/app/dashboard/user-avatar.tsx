"use client";
import { handleLogout } from "@/client/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export const UserAvatar = () => {
	const { user, userLoading, userError } = useUser();
	const router = useRouter();

	const { mutate: logout, isPending } = useMutation({
		mutationFn: handleLogout,
		onSuccess: () => {
			router.push("/");
		},
		onError: () => {
			toast.error("Error logging out");
		},
	});

	useEffect(() => {
		if (userError) {
			toast.error("Error fetching user");
			router.push("/");
		}
	}, [userError, router]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className="cursor-pointer">
					{userLoading ? (
						<Skeleton className="w-10 h-10 rounded-full" />
					) : user ? (
						<>
							<AvatarImage src={user?.picture.small ?? ""} />
							<AvatarFallback>
								{user?.first_name?.charAt(0)}
								{user?.last_name?.charAt(0)}
							</AvatarFallback>
						</>
					) : (
						<Skeleton className="w-10 h-10 rounded-full" />
					)}
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={() => logout()}>
					{isPending ? (
						<Loader2 className="w-4 h-4 animate-spin" />
					) : (
						<LogOut />
					)}
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
