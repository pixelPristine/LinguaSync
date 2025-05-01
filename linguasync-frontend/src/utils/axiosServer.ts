import axios from "axios";

const axiosServer = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

export default axiosServer;
