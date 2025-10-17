import { Building, FloorUnit } from "@/types/building";
import { OpenPlot } from "@/types/OpenPlots";
import { Property } from "@/types/property";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

//! BUILDINGS, FLOOR AND UNITS
export const getAllBuildings = async (): Promise<Building[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/building/getAllBuildings`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const getAllOpenPlots = async (): Promise<OpenPlot[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openPlot/getAllOpenPlot`,
    { withCredentials: true }
  );
  // Your backend returned { plots: [...] } earlier; fallback to data shapes
  return data?.plots || data?.data || [];
};

export const fetchUnits = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user-schedule/getUnitsNameForDropDown`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const fetchProjects = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user-schedule/getBuildingNameForDropDown`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const useProjects = () => {
  return useQuery<Building[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: [],
  });
};

export const fetchFloorUnitsForDropDownByBuildingId = async (
  buildingId: string
) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL
    }/api/floor/getAllFloorsByBuildingIdForDropDown/${buildingId}`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const useFloorUnits = (buildingId: string) => {
  return useQuery<FloorUnit[]>({
    queryKey: ["floorUnits", buildingId],
    queryFn: () => fetchFloorUnitsForDropDownByBuildingId(buildingId),
    staleTime: 2 * 60 * 1000,
    enabled: !!buildingId,
    placeholderData: [],
  });
};

export const fetchUnitsForDropDownByBuildingId = async (
  buildingId: string,
  floorId: string
) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL
    }/api/unit/getUnitsByFloorIdAndBuildingIdForDropDown/${buildingId}/${floorId}`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const useUnits = (buildingId: string, floorId: string) => {
  return useQuery<Property[]>({
    queryKey: ["units", buildingId, floorId],
    queryFn: () => fetchUnitsForDropDownByBuildingId(buildingId, floorId),
    staleTime: 2 * 60 * 1000,
    enabled: !!buildingId && !!floorId,
    placeholderData: [],
  });
};

export const fetchAvailableUnitsByFloorIdAndBuildingIdForDropDown = async (
  buildingId: string,
  floorId: string
) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL
    }/api/unit/getAvailableUnitsByFloorIdAndBuildingIdForDropDown/${buildingId}/${floorId}`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const useAvaliableUnits = (buildingId: string, floorId: string) => {
  return useQuery<Property[]>({
    queryKey: ["avaliableUnits", buildingId, floorId],
    queryFn: () =>
      fetchAvailableUnitsByFloorIdAndBuildingIdForDropDown(buildingId, floorId),
    staleTime: 2 * 60 * 1000,
    enabled: !!buildingId && !!floorId,
    placeholderData: [],
  });
};

//! SITE INCHARGE
export const fetchSchedules = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user-schedule/schedules`,
    { withCredentials: true }
  );
  return data.schedules || [];
};

export const fetchContractor = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/contractor`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const fetchInspections = async () => {
  const response = await axios.get(
    `${import.meta.env.VITE_URL}/api/site-inspection/inspections`,
    { withCredentials: true }
  );
  return response.data.inspections || [];
};
