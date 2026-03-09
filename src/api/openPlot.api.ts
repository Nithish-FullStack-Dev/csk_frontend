// src/api/openPlot.api.ts

import { OpenPlotFormValues } from "@/types/OpenPlots";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_URL,
  withCredentials: true,
});

const getCsrfToken = async () => {
  const res = await api.get("/api/csrf-token");
  return res.data.csrfToken;
};

export const saveOpenPlot = async (
  data: OpenPlotFormValues,
  thumbnail: File,
  images: File[],
  brochure: File
) => {
  const csrfToken = await getCsrfToken();

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value as any);
    }
  });

  formData.append("thumbnailUrl", thumbnail);
  formData.append("brochureUrl", brochure);

  images.forEach((img) => {
    formData.append("images", img);
  });

  const res = await api.post(
    "/api/openPlot/saveOpenplot",
    formData,
    {
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );

  return res.data.data;
};

/* ========================================================= */
/* UPDATE OPEN PLOT */
/* ========================================================= */

export const updateOpenPlot = async (
  id: string,
  data: OpenPlotFormValues,
  thumbnail?: File,
  images?: File[],
  brochure?: File,
  removedImages?: string[]
) => {
  const csrfToken = await getCsrfToken();

  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value as any);
    }
  });

  if (thumbnail) {
    formData.append("thumbnailUrl", thumbnail);
  }

  if (brochure) {
    formData.append("brochureUrl", brochure);
  }

  images?.forEach((img) => {
    formData.append("images", img);
  });

  removedImages?.forEach((img) => {
    formData.append("removedImages", img);
  });

  const res = await api.put(
    `/api/openPlot/updateOpenplot/${id}`,
    formData,
    {
      headers: {
        "X-CSRF-Token": csrfToken,
      },
    }
  );

  return res.data.data;
};