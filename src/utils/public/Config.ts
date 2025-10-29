import { Building } from "@/types/building";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";


export async function fetchPropertyById(id: string) {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getBuildingById/${id}`,
    { withCredentials: true }
  );
  console.log('fetchPropertyById response:', data);
  return data.data;
}
export async function fetchUpcomingProperties() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getUpcomingBuilding`,
    { withCredentials: true }

  );
  return data
}
export async function fetchOngoingProperties() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getOngoingBuilding`,
    { withCredentials: true }

  );
  return data
}
export async function fetchCompletedProperties() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getCompletedBuilding`,
    { withCredentials: true }

  );
  return data
}

export async function fetchOpenPlots() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openPlot/getAllOpenPlot`,
    { withCredentials: true }

  );
  return data

}

export const usePropertyById = (id: string) => {
  return useQuery<Building>({
    queryKey: ['propertyById', id],
    queryFn: () => fetchPropertyById(id),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: !!id,

  })
}

export const useUpcomingProperties = () => {
  return useQuery({
    queryKey: ['upcomingProperties'],
    queryFn: fetchUpcomingProperties,
    staleTime: Infinity,
    placeholderData: keepPreviousData,

  })
}

export const useOngoingProperties = () => {
  return useQuery({
    queryKey: ['ongoingProperties'],
    queryFn: fetchOngoingProperties,
    staleTime: Infinity,
    placeholderData: keepPreviousData,

  })
}
export const useCompletedProperties = () => {
  return useQuery({
    queryKey: ['completedProperties'],
    queryFn: fetchCompletedProperties,
    staleTime: Infinity,
    placeholderData: keepPreviousData,

  })
}

export const useOpenPlots = () => {
  return useQuery({
    queryKey: ['openPlots'],
    queryFn: fetchOpenPlots,
    staleTime: Infinity,
    placeholderData: keepPreviousData,

  })
}