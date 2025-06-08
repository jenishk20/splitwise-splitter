import axios from "axios";
import { BASE_API_URL } from "@/lib/consts";
import type { Group, User, BugReport } from "@/lib/types";

interface BugReportFormData {
	type: string;
	description: string;
	reporterName: string;
	reporterEmail: string;
}

export const getUser = async (): Promise<User | null> => {
	const response = await axios.get(`${BASE_API_URL}/login/me`, {
		withCredentials: true,
	});
	return response.data?.user;
};

export const getUserGroups = async (): Promise<Group[]> => {
	const response = await axios.get(`${BASE_API_URL}/groups/fetchUserGroups`, {
		withCredentials: true,
	});
	return response.data?.groups;
};

export const handleLogout = async () => {
	try {
		await axios.post(
			`${BASE_API_URL}/login/logout`,
			{},
			{
				withCredentials: true,
			},
		);
	} catch (err) {
		console.error("Logout failed:", err);
	}
};

export const handleFileUpload = async (
	file: File,
	groupId: number,
): Promise<void> => {
	const formData = new FormData();
	formData.append("invoice", file);
	formData.append("groupId", groupId.toString());

	const response = await axios.post(
		`${BASE_API_URL}/upload/parse-invoice`,
		formData,
		{
			withCredentials: true,
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);

	if (response.status !== 200) {
		throw new Error("Failed to upload expense");
	}
};

export const getGroupJobs = async (groupId: string): Promise<any[]> => {
	try{
		const response = await axios.get(`${BASE_API_URL}/jobs/get-jobs/${groupId}`, {
			withCredentials: true,
		});
		return response.data?.jobs || [];
	}
	catch (error) {
		console.error("Error fetching group jobs:", error);
		throw new Error("Failed to fetch group jobs");
	}
};

export const submitExpenseToGroup = async (
	group: Group,
	items: any[],
	description: string,
	jobId : string
): Promise<string> => {

	try{
		const response = await axios.post(
			`${BASE_API_URL}/expenses/submit-expense`,
			{
				group,
				items,
				description,
				jobId,
			},
			{
				withCredentials: true,
			}
		);
		return response.data;
	}
	catch (error) {
		console.error("Error submitting expense:", error);
		throw new Error("Failed to submit expense");
	}
};

export const getPendingExpenses = async (groupId : string) : Promise<any[]> => {
	try {
		const response = await axios.get(`${BASE_API_URL}/expenses/get-expenses/${groupId}`, {
			withCredentials: true,
		});
		return response.data || [];
	} catch (error) {
		console.error("Error fetching pending expenses:", error);
		throw new Error("Failed to fetch pending expenses");
	}
}


export const deleteExpense = async (expenseId: string): Promise<void> => {
	try {
		const response = await axios.post(`${BASE_API_URL}/expenses/delete/${expenseId}`, {},{
			withCredentials: true,
		});
	
	} catch (error) {
		console.error("Error deleting expense:", error);
		throw new Error("Failed to delete expense");
	}
}

export const updateExpensePreferences = async (
	expenseId: string,
	items: any[]
): Promise<void> => {
	try {
		await axios.post(
			`${BASE_API_URL}/expenses/update-preferences/${expenseId}`,
			{ items },
			{ withCredentials: true }
		);
	} catch (error) {
		console.error("Error updating preferences:", error);
		throw new Error("Failed to update preferences");
	}
};

export const finalizeExpenseOnSplitwise = async (expenseId: string): Promise<void> => {
	try {
		const response = await axios.post(
			`${BASE_API_URL}/expenses/finalize/${expenseId}`,
			{},
			{ withCredentials: true }
		);
	} catch (error: any) {
		console.error("Error finalizing expense:", error);
		throw new Error(error.response?.data?.message || "Finalize failed");
	}
};

export const reportBug = async (formData: BugReportFormData): Promise<void> => {
	try {
		const bugReport: BugReport = {
			...formData,
			id: crypto.randomUUID(),
			status: "open",
			createdAt: new Date().toISOString(),
			title: formData.description.slice(0, 100), // Use first 100 chars of description as title
		};

		await axios.post(`${BASE_API_URL}/bug-reports`, bugReport, { withCredentials: true });
	} catch (error) {
		console.error("Error reporting bug:", error);
		throw new Error("Failed to report bug");
	}
};