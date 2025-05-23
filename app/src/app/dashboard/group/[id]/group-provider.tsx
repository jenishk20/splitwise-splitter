"use client";
import { createContext, useContext, useState } from "react";

export type NavigationItem = "home" | "expenses" | "invoices";

type GroupContextType = {
	activeElement: NavigationItem;
	setActiveElement: (element: NavigationItem) => void;
};

const GroupContext = createContext<GroupContextType>({
	activeElement: "home",
	setActiveElement: () => {},
});

export const GroupProvider = ({ children }: { children: React.ReactNode }) => {
	const [activeElement, setActiveElement] = useState<
		"home" | "expenses" | "invoices"
	>("home");

	return (
		<GroupContext.Provider value={{ activeElement, setActiveElement }}>
			{children}
		</GroupContext.Provider>
	);
};

export const useGroup = () => {
	const context = useContext(GroupContext);
	if (!context) {
		throw new Error("useGroup must be used within a GroupProvider");
	}
	return context;
};
