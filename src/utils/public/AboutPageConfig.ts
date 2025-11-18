import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface AboutContent {
  _id: String;
  mainTitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  stats: [];
  values: [];
  videoUrl: string;
  thumbnail: string;
}

export interface Stats {
  label: string;
  value: number;
}

export interface Values {
  title: string;
  description: string;
}

export const team = [
  {
    name: "R. Sai Kumar Reddy",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    bio: "A visionary leader with over 20 years of transformative experience in real estate development and strategic management.",
  },
  {
    name: "Divya Prakash Singh",
    role: "Chief Operating Officer",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    bio: "Drives operational excellence and project delivery with a focus on efficiency and customer satisfaction.",
  },
  {
    name: "Sandeep Rao",
    role: "Head of Sales & Marketing",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    bio: "Leads market strategy and client engagement, bringing properties to life for discerning buyers.",
  },
  {
    name: "Priya Sharma",
    role: "Head of Customer Relations",
    image:
      "https://www.perfocal.com/blog/content/images/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg",
    bio: "Dedicated to ensuring a seamless and positive experience for every CSK client, from inquiry to handover.",
  },
];

const fetchTeam = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/aboutSection/getAboutSec`
  );
  return data || team;
};

export const useAbout = () => {
  return useQuery({
    queryKey: ["team"],
    queryFn: fetchTeam,
  });
};
