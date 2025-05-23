import { GroupProvider } from "./group-provider";

export default function GroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <GroupProvider>{children}</GroupProvider>;
}
