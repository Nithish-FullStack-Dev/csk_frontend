import { Building, FloorUnit } from "@/types/building";
import { OpenLand } from "@/types/OpenLand";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export async function fetchPropertyById(id: string) {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getBuildingById/${id}`,
    { withCredentials: true }
  );
  console.log("fetchPropertyById response:", data);
  return data.data;
}

export async function fetchUpcomingProperties() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getUpcomingBuilding`,
    { withCredentials: true }
  );
  return data;
}
export async function fetchOngoingProperties() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getOngoingBuilding`,
    { withCredentials: true }
  );
  return data;
}
export async function fetchCompletedProperties() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getCompletedBuilding`,
    { withCredentials: true }
  );
  return data;
}

export async function fetchOpenPlots() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openPlot/getAllOpenPlot`,
    { withCredentials: true }
  );
  return data;
}
export async function fetchOpenLand() {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openLand/getAllOpenLand`,
    { withCredentials: true }
  );
  return data;
}

export const getBuildingById = async (buildingId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getBuildingById/${buildingId}`,
    { withCredentials: true }
  );
  return data.data as Building;
};

export const getFloorsByBuildingId = async (buildingId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/floor/getAllFloorsByBuildingId/${buildingId}`,
    { withCredentials: true }
  );
  return data.data as FloorUnit[];
};

export const createFloor = async (payload: FormData) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/floor/createFloor`,
    payload,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const updateFloor = async (floorId: string, payload: FormData) => {
  console.log("floorId", floorId);
  const { data } = await axios.patch(
    `${import.meta.env.VITE_URL}/api/floor/updateFloorById/${floorId}`,
    payload,
    {
      withCredentials: true,
    }
  );
  return data;
};

export const deleteFloor = async (floorId: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_URL}/api/floor/deleteFloorById/${floorId}`,
    { withCredentials: true }
  );
  return data;
};
export const usePropertyById = (id: string) => {
  return useQuery<Building>({
    queryKey: ["propertyById", id],
    queryFn: () => fetchPropertyById(id),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: !!id,
  });
};
export const fetchOpenLandById = async (id: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openLand/getOpenLandById/${id}`,
    { withCredentials: true }
  );

  // your API returns: { success: true, land: {...} }
  return data.land;
};

export const useOpenLandById = (id: string) => {
  return useQuery<OpenLand>({
    queryKey: ["openLandById", id],
    queryFn: () => fetchOpenLandById(id),
    staleTime: Infinity,
    placeholderData: keepPreviousData,
    enabled: !!id,
  });
};


export const useUpcomingProperties = () => {
  return useQuery({
    queryKey: ["upcomingProperties"],
    queryFn: fetchUpcomingProperties,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
};

export const useOngoingProperties = () => {
  return useQuery({
    queryKey: ["ongoingProperties"],
    queryFn: fetchOngoingProperties,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
};
export const useCompletedProperties = () => {
  return useQuery({
    queryKey: ["completedProperties"],
    queryFn: fetchCompletedProperties,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
};

export const useOpenPlots = () => {
  return useQuery({
    queryKey: ["openPlots"],
    queryFn: fetchOpenPlots,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
};
export const useOpenLand = () => {
  return useQuery({
    queryKey: ["openLand"],
    queryFn: fetchOpenLand,
    staleTime: Infinity,
    placeholderData: keepPreviousData,
  });
};