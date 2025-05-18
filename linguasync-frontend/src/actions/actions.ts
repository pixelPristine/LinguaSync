import { axiosInstance } from "@/utils/axios";
import axios from "axios";

// Sample Code with axios

// export const login = async (email: string, password: string) => {
//   try {
//     const response = await axiosInstance.post(`/api/auth/login`, {
//       email,
//       password,
//     });
//     return response.data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       throw error.response?.data || new Error("Failed to Login");
//     }
//     throw error;
//   }
// };

export const uploadVideo = async (videoFile: File, languageCode: string) => {
  const formData = new FormData();
  formData.append("video", videoFile); // 'video' is the field name your API expects
  formData.append("language", languageCode); // Add the selected language

  try {
    const response = await axiosInstance.post(`/api/upload/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw error.response?.data || new Error("Failed to upload video");
    }
    throw error;
  }
};
