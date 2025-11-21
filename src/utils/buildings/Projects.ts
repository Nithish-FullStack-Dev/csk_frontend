import { Building, FloorUnit } from "@/types/building";
import { OpenLand } from "@/types/OpenLand";
import { OpenPlot } from "@/types/OpenPlots";
import { Property } from "@/types/property";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import exp from "constants";

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
  return data?.plots || data?.data || [];
};

export const getAllOpenLand = async (): Promise<OpenLand[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/openLand/getAllOpenLand`,
    { withCredentials: true }
  );
  return data?.lands || [];
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

export const fetchLeadByOpenLandId = async (openLandId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getLeadsByOpenLandId/${openLandId}`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const fetchLeadByOpenPlotId = async (openPlotId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/leads/getLeadsByOpenPlotId/${openPlotId}`,
    { withCredentials: true }
  );
  return data?.data || [];
};

export const useProjects = () => {
  return useQuery<Building[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev || [],
  });
};

export const useOPenLand = () => {
  return useQuery<OpenLand[]>({
    queryKey: ["openLand"],
    queryFn: getAllOpenLand,
    staleTime: 600000,
    placeholderData: (prev) => prev || [],
  });
};

export const useOpenPlots = () => {
  return useQuery<OpenPlot[]>({
    queryKey: ["openPlots"],
    queryFn: getAllOpenPlots,
    staleTime: 600000,
    placeholderData: (prev) => prev || [],
  });
};

export const useLeadbyOpenLandId = (openLandId: string) => {
  return useQuery({
    queryKey: ["leadByOpenLandId", openLandId],
    queryFn: () => fetchLeadByOpenLandId(openLandId),
    enabled: !!openLandId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};

export const useLeadbyOpenPlotId = (openPlotId: string) => {
  return useQuery({
    queryKey: ["leadByOpenPlotId", openPlotId],
    queryFn: () => fetchLeadByOpenPlotId(openPlotId),
    enabled: !!openPlotId,
    placeholderData: (prev) => prev,
    staleTime: 5 * 60 * 1000,
  });
};

//! FLOORS AND UNITS FOR DROPDOWN
export const fetchFloorUnitsForDropDownByBuildingId = async (
  buildingId: string
) => {
  const { data } = await axios.get(
    `${
      import.meta.env.VITE_URL
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
    placeholderData: (prev) => prev || [],
  });
};

export const fetchUnitsForDropDownByBuildingId = async (
  buildingId: string,
  floorId: string
) => {
  const { data } = await axios.get(
    `${
      import.meta.env.VITE_URL
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
    placeholderData: (prev) => prev || [],
  });
};

export const fetchAvailableUnitsByFloorIdAndBuildingIdForDropDown = async (
  buildingId: string,
  floorId: string
) => {
  const { data } = await axios.get(
    `${
      import.meta.env.VITE_URL
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
    placeholderData: (prev) => prev || [],
  });
};

//! SITE INCHARGE
export const fetchSchedules = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user-schedule/schedules`,
    { withCredentials: true }
  );
  return data.data || [];
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

export const useSchedules = () => {
  return useQuery({
    queryKey: ["schedules"],
    queryFn: fetchSchedules,
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
};
