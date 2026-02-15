import { InnerPlotFormValues } from "@/types/InnerPlot";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
  withCredentials: true,
});

export const createInnerPlot = async (
  data: InnerPlotFormValues,
  thumbnail?: File,
  images?: File[],
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined) formData.append(k, String(v));
  });

  if (thumbnail) formData.append("thumbnailUrl", thumbnail);
  images?.forEach((img) => formData.append("images", img));

  const res = await api.post("/api/innerPlot/saveInnerPlot", formData);
  return res.data.data;
};

export const updateInnerPlot = async (
  id: string,
  data: InnerPlotFormValues,
  thumbnail?: File,
  images?: File[],
) => {
  const formData = new FormData();

  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined) formData.append(k, String(v));
  });

  if (thumbnail) formData.append("thumbnailUrl", thumbnail);
  images?.forEach((img) => formData.append("images", img));

  const res = await api.put(`/api/innerPlot/updateInnerPlot/${id}`, formData);

  return res.data.data;
};

export const getInnerPlots = async (openPlotId: string) => {
  const res = await api.get(`/api/innerPlot/by-openplot/${openPlotId}`);
  return res.data.data;
};

export const deleteInnerPlot = async (id: string) => {
  await api.delete(`/api/innerPlot/deleteInnerPlot/${id}`);
};

export const getAllInnerPlot = async (openPlotId: string) => {
  const res = await api.get(`/api/innerPlot/getAllInnerPlot/${openPlotId}`);
  return res.data.data;
};
