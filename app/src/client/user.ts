import axios from "axios";
import { BASE_API_URL } from "@/lib/consts";
import type { Group, User } from "@/lib/types";

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


export const handleFileUpload = async (file: File): Promise<void> => {
	const formData = new FormData();
	formData.append("invoice", file);

	const response = await axios.post(`${BASE_API_URL}/upload/parse-invoice`, formData, {
		withCredentials: true,
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	if (response.status !== 200) {
		throw new Error("Failed to upload expense");
	}
};
