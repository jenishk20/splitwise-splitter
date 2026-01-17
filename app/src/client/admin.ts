import axios from "axios";
import { BASE_API_URL } from "@/lib/consts";


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

