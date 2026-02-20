import { Property } from "@/types/property";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const createUnit = async (unitData: FormData) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_URL}/api/unit/createUnit`,
    unitData,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data as Property;
};
export const updateUnit = async (unitId: string, unitData: FormData) => {
  const { data } = await axios.patch(
    `${import.meta.env.VITE_URL}/api/unit/updateUnit/${unitId}`,
    unitData,
    {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return data.data as Property;
};

export const deleteUnit = async (unitId: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_URL}/api/unit/deleteUnit/${unitId}`,
    { withCredentials: true },
  );
  return data;
};
// Add this to Methods.ts
export const fetchUnit = async (unitId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/unit/getUnit/${unitId}`,
    { withCredentials: true },
  );
  return data.data as Property;
};

export const fetchCustomerPurchasedUnits = async (customerId: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/unit/getCustomersByUnit/${customerId}`,
    { withCredentials: true },
  );
  return data.data;
};

export const useCustomerPurchasedUnits = (customerId: string) => {
  return useQuery({
    queryKey: ["customerPurchasedUnits", customerId],
    queryFn: () => fetchCustomerPurchasedUnits(customerId),
    staleTime: 0, // 5 minutes
    placeholderData: (prev) => prev,
    enabled: !!customerId,
  });
};

export const fetchRolePermissions = async (roleName: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/role/getRole/${roleName}`,
    { withCredentials: true },
  );
  return data || null;
};
