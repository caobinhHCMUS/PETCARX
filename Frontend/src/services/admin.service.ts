import axios from "axios";

const API_URL = "http://localhost:5000/api/admin";

export const getRevenueByType = async (startDate?: string, endDate?: string) => {
  try {
    const response = await axios.get(`${API_URL}/revenue-by-type`, {
      params: {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching revenue data:", error);
    throw error;
  }
};