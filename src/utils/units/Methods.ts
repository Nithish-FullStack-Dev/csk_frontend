import { Property } from "@/types/property";
import axios from "axios";

export const createUnit = async (unitData: FormData) => {
    const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/api/unit/createUnit`,
        unitData,
        {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
        }
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
        }
    );
    return data.data as Property;
};

export const deleteUnit = async (unitId: string) => {
    const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/api/unit/deleteUnit/${unitId}`,
        { withCredentials: true }
    );
    return data.data;
};
// Add this to Methods.ts
export const fetchUnit = async (unitId: string) => {
    const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/unit/getUnit/${unitId}`,
        { withCredentials: true }
    );
    return data.data as Property;
};