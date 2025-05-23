import { BASE_API_URL } from "@/lib/consts";
import type { InvoiceJob } from "@/lib/types";
import axios from "axios";

export const getCompletedJobs = async (groupId: number) => {
	const response = await axios.get<InvoiceJob[]>(
		`${BASE_API_URL}/jobs?groupId=${groupId}`,
		{
			withCredentials: true,
		},
	);
	return response.data;
};

export const getJob = async (jobId: string) => {
	const response = await axios.get<InvoiceJob>(
		`${BASE_API_URL}/jobs/${jobId}`,
		{
			withCredentials: true,
		},
	);
	return response.data;
};
