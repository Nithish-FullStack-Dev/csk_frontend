import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface SiteInchargeUser {
  _id: string;
  name: string;
  email?: string;
}

const fetchSiteIncharges = async (): Promise<SiteInchargeUser[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/incharge/site-incharges`,
    { withCredentials: true }
  );
  return data.data || [];
};

export const useSiteIncharges = () => {
  return useQuery<SiteInchargeUser[]>({
    queryKey: ["site-incharges"],
    queryFn: fetchSiteIncharges,
    staleTime: 5 * 60 * 1000,
  });
};
