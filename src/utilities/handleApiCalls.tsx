import axios from "axios";

const API_URL = process.env.REACT_APP_URL;

export const handleGet = async (url: string, config = {}) => {
  try {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const finalConfig = { ...config, headers };
    const response = await axios.get(`${API_URL}${url}`, finalConfig);
    return response.data;
  } catch (error) {
    console.error("Error with GET request:", error);
    throw error;
  }
};

// Handle POST request
export const handlePost = async (url: any, data?: any, config = {}) => {
  try {
    const response = await axios.post(`${API_URL}${url}`, data, config);
    return response.data;
  } catch (error) {
    console.error("Error with POST request:", error);
    throw error;
  }
};

// Handle PUT request
export const handlePut = async (url: any, data: any, config = {}) => {
  try {
    const response = await axios.put(`${API_URL}${url}`, data, config);
    return response.data;
  } catch (error) {
    console.error("Error with PUT request:", error);
    throw error;
  }
};

// Handle DELETE request
export const handleDelete = async (url: any, config = {}) => {
  try {
    const response = await axios.delete(`${API_URL}${url}`, config);
    return response.data;
  } catch (error) {
    console.error("Error with DELETE request:", error);
    throw error;
  }
};
