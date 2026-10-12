import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface AboutContent {
  _id?: string;
  mainTitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  stats: Stats[];
  values: Values[];
  videoUrl: string;
  thumbnail: string;
  teamTitle: string;
  teamDes: string;
  team: TeamMember[];
}

export interface Stats {
  label: string;
  value: number;
}

export interface Values {
  title: string;
  description: string;
}

export const team: TeamMember[] = [
  {
    name: "R. Sai Kumar Reddy",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
    bio: "A visionary leader with over 20 years of experience in real estate development and strategic management.",
  },
  {
    name: "Divya Prakash Singh",
    role: "Chief Operating Officer",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80",
    bio: "Drives operational excellence and project delivery with a focus on efficiency and customer satisfaction.",
  },
  {
    name: "Sandeep Rao",
    role: "Head of Sales & Marketing",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    bio: "Leads market strategy and client engagement, bringing properties to life for discerning buyers.",
  },
  {
    name: "Priya Sharma",
    role: "Head of Customer Relations",
    image:
      "https://www.perfocal.com/blog/content/images/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg",
    bio: "Dedicated to ensuring a seamless and positive experience for every CSK client.",
  },
];

export const defaultAboutContent: AboutContent = {
  mainTitle: "About CSK Realtors: Crafting Future Homes",
  paragraph1:
    "At CSK Realtors, we help people find properties that match their needs and aspirations.",
  paragraph2:
    "Our team is committed to delivering reliable guidance and a smooth property-buying experience.",
  image:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  stats: [
    { label: "Projects Completed", value: 50 },
    { label: "Happy Clients", value: 100 },
    { label: "Years of Experience", value: 10 },
    { label: "Properties", value: 75 },
  ],
  values: [
    {
      title: "Trust",
      description: "We build lasting relationships through transparency.",
    },
    {
      title: "Quality",
      description: "We focus on quality in every property and service.",
    },
    {
      title: "Commitment",
      description: "We work to provide a positive customer experience.",
    },
  ],
  videoUrl: "",
  thumbnail: "",
  teamTitle: "Meet Our Visionary Leadership",
  teamDes:
    "Our leadership team is dedicated to shaping the future of real estate.",
  team,
};

const fetchTeam = async (): Promise<AboutContent> => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_URL}/api/aboutSection/getAboutSec`,
    );

    // Handle null, empty, or unexpected API responses.
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return defaultAboutContent;
    }

    return {
      ...defaultAboutContent,
      ...data,
      stats: Array.isArray(data.stats) ? data.stats : defaultAboutContent.stats,
      values: Array.isArray(data.values)
        ? data.values
        : defaultAboutContent.values,
      team: Array.isArray(data.team) ? data.team : team,
    };
  } catch (error) {
    // A 404 means no About content exists yet.
    // Use default content instead of failing the query.
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return defaultAboutContent;
    }

    // Also use fallback content for other API failures.
    console.error("Failed to fetch About content:", error);
    return defaultAboutContent;
  }
};

export const useAbout = () => {
  return useQuery<AboutContent>({
    queryKey: ["team"],
    queryFn: fetchTeam,
    retry: false,
  });
};
