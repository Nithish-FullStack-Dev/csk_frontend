// src\api\openPlot.api.ts
import { OpenPlotFormValues } from "@/types/OpenPlots";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
  withCredentials: true,
});

export const saveOpenPlot = async (
  data: OpenPlotFormValues,
  thumbnail: File,
  images: File[],
  brochure: File, // 🔥 added
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  formData.append("thumbnailUrl", thumbnail);

  // 🔥 brochure append
  formData.append("brochureUrl", brochure);

  images.forEach((img) => formData.append("images", img));

  const res = await api.post("/api/openPlot/saveOpenplot", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};

export const updateOpenPlot = async (
  id: string,
  data: OpenPlotFormValues,
  thumbnail?: File,
  images?: File[],
  brochure?: File, // 🔥 added
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (thumbnail) formData.append("thumbnailUrl", thumbnail);

  // 🔥 brochure append
  if (brochure) formData.append("brochureUrl", brochure);

  images?.forEach((img) => formData.append("images", img));

  const res = await api.put(`/api/openPlot/updateOpenplot/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data.data;
};
