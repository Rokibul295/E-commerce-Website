import axios from "axios";

axios.defaults.baseURL = "http://localhost:5001"; // Changed from 5000 to avoid macOS Control Center conflict

export const registerUser = async (data) => {
  const res = await axios.post("/api/auth/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axios.post("/api/auth/login", data);
  return res.data;
};
