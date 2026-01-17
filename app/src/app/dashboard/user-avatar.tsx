"use client";
import { handleLogout } from "@/client/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { useMutation } from "@tanstack/react-query";
import { Loader2, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

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
        <Avatar className="cursor-pointer h-10 w-10 ring-2 ring-primary/30 hover:ring-primary/50 transition-all duration-300 rounded-full shadow-md hover:shadow-lg">
          {userLoading ? (
            <Skeleton className="w-10 h-10 rounded-full" />
          ) : user ? (
            <>
              <AvatarImage src={user?.picture.small ?? ""} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {user?.first_name?.charAt(0)}
                {user?.last_name?.charAt(0)}
              </AvatarFallback>
            </>
          ) : (
            <Skeleton className="w-10 h-10 rounded-full" />
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        {user && (
          <>
            <DropdownMenuLabel className="p-3 bg-muted/50 rounded-lg mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.picture.small ?? ""} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {user?.first_name} {user?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem 
          onClick={() => logout()} 
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 p-2.5 rounded-lg"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          <span className="font-medium">Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
