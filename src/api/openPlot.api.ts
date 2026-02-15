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
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });

  formData.append("thumbnailUrl", thumbnail);
  images.forEach((img) => formData.append("images", img));

  const res = await api.post("/api/openPlot/saveOpenplot", formData);
  return res.data.data;
};

export const updateOpenPlot = async (
  id: string,
  data: OpenPlotFormValues,
  thumbnail?: File,
  images?: File[],
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      formData.append(key, String(value));
    }
  });

  if (thumbnail) formData.append("thumbnailUrl", thumbnail);
  images?.forEach((img) => formData.append("images", img));

  const res = await api.put(`/api/openPlot/updateOpenplot/${id}`, formData);
  return res.data.data;
};
