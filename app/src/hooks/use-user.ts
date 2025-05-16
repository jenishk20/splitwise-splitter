import { useQuery } from "@tanstack/react-query";
import { getUser, getUserGroups } from "@/client";

export const useUser = () => {
	const {
		data: user,
		isLoading: userLoading,
		error: userError,
	} = useQuery({
		queryKey: ["user"],
		queryFn: getUser,
	});
	const {
		data: groups,
		isLoading: groupsLoading,
		error: groupsError,
	} = useQuery({
		queryKey: ["groups"],
		queryFn: getUserGroups,
		enabled: !!user,
	});

	return {
		user,
		groups,
		userLoading,
		groupsLoading,
		userError,
		groupsError,
	};
};
