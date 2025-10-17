import { User } from "@/contexts/AuthContext";
import { Customer, Property } from "@/types/property";
import axios from "axios";

export const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/customer/getAllCustomers`,
    {
      withCredentials: true,
    }
  );
  return data.data || [];
};

const fetchProperties = async (): Promise<Property[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/properties/available`,
    {
      withCredentials: true,
    }
  );
  return data.data || []; // Now expects data.data to be Property[]
};

export const fetchAgents = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllAgents`,
    {
      withCredentials: true,
    }
  );
  return data || [];
};

export const fetchAllCustomer_purchased = async (): Promise<User[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/user/getAllcustomer_purchased`,
    {
      withCredentials: true,
    }
  );
  return data || [];
};
