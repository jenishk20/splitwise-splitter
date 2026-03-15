import axios from "axios";
import { BASE_API_URL } from "@/lib/consts";

export interface PublicStats {
  totalUsers: number;
  totalReceipts: number;
  totalExpenses: number;
  settledExpenses: number;
  totalAmountSplit: number;
}

export const getPublicStats = async (): Promise<PublicStats> => {
  const response = await axios.get(`${BASE_API_URL}/admin/public-stats`);
  return response.data;
};

export const getAdminStats = async (): Promise<any> => {
    const response = await axios.get(`${BASE_API_URL}/admin/stats`, {
        withCredentials: true,
    });
    return response.data;
};

export const getAdminUsers = async (): Promise<any> => {
    const response = await axios.get(`${BASE_API_URL}/admin/users`, {
        withCredentials: true,
    });
    return response.data;
};

export const getAdminBugs = async (): Promise<any> => {
    const response = await axios.get(`${BASE_API_URL}/admin/bugs`, {
        withCredentials: true,
    }); 
    return response.data;
};

