import {
  Building,
  Users,
  Award,
  Clock,
  Lightbulb,
  Handshake,
  Star,
  PlayCircle,
  Target,
  Eye,
  Gem,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { easeOut, motion, useAnimation } from "framer-motion";
import clsx from "clsx";
import axios from "axios";
import StatCard from "./StatCard.tsx";
import Values from "./Values.tsx";

interface AboutContent {
  _id: String;
  mainTitle: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
  stats: [];
  values: [];
}

interface Stats {
  label: string;
  value: number;
}

interface Values {
  title: string;
  description: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOut,
      when: "beforeChildren",
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

const AboutSection = () => {
  const controls = useAnimation();
  const sectionRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    _id: "",
    mainTitle: "",
    paragraph1: "",
    paragraph2: "",
    image: "",
    stats: [],
    values: [],
  });
  const statIcons = [Building, Users, Award, Clock];

  const [stats, setStats] = useState<Stats[]>([]);
  const [values, setValues] = useState<Values[]>([]);

  const statMeta = {
    "Projects Completed": { icon: Building, suffix: "+" },
    "Happy Families": { icon: Users, suffix: "+" },
    "Awards & Recognition": { icon: Award, suffix: "+" },
    "Years in Business": { icon: Clock, suffix: "+" },
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          controls.start("visible");
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [controls]);

  const fetchAboutDetails = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/aboutSection/getAboutSec`
      );
      setAboutContent(data);
      setStats(data.stats);
      setValues(data.values);
    } catch (error) {
      console.error("Failed to fetch about section:", error);
    }
  };

  useEffect(() => {
    fetchAboutDetails();
  }, []);

  const youtubeVideoId = "c-goZSYW6qE";
  const youtubeThumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;

  return (
    <section className="py-16 md:py-20 bg-gray-50 overflow-hidden relative">
      <div className="absolute inset-0 bg-pattern-grid opacity-5 pointer-events-none z-0"></div>
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <motion.div
          ref={sectionRef}
          initial="hidden"
          animate={controls}
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-4xl md:text-5xl font-md font-vidaloka text-gray-800 mb-6 leading-tight">
              <span className="text-purple-700">About</span> CSK Realtors:
              Crafting Future Homes
            </h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {aboutContent.paragraph1}
            </p>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {aboutContent.paragraph2}
            </p>
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 mt-10">
              {stats.map((stat, index) => {
                const Icon = statIcons[index] || Building; // fallback to Building if index out of range
                return (
                  <StatCard
                    key={index}
                    label={stat.label as string}
                    value={stat.value}
                    suffix="+"
                    icon={Icon}
                    index={index}
                    variants={itemVariants}
                  />
                );
              })}
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="relative group overflow-hidden rounded-xl shadow-2xl transform hover:scale-102 transition-transform duration-500"
          >
            <img
              src={aboutContent.image}
              alt="CSK Realtors - Building communities"
              className="w-full h-96 md:h-[500px] object-cover rounded-xl "
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xl font-semibold">
                "Your Vision, Our Expertise."
              </p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          variants={sectionVariants}
          className="mt-20 md:mt-24 text-center"
        >
          <h3 className="text-4xl font-md font-vidaloka text-gray-800 mb-10 leading-tight">
            See Our Vision in Action
          </h3>

          <div className="relative w-full max-w-full mx-auto rounded-xl overflow-hidden shadow-2xl aspect-video">
            {!showVideo ? (
              <div
                className="relative w-full h-full bg-black rounded-xl cursor-pointer group"
                onClick={() => setShowVideo(true)}
              >
                <img
                  src={youtubeThumbnailUrl}
                  alt="Video Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-500 group-hover:bg-black/60">
                  <PlayCircle className="w-20 h-20 text-white transform transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full"
              >
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full rounded-xl"
                ></iframe>
              </motion.div>
            )}
          </div>
        </motion.div>
        <section className="py-20 md:py-28 bg-white border-b border-gray-100">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-md font-vidaloka text-gray-800 text-center mb-16 leading-tight">
              Our Guiding Principles
            </h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              {values.map((value, idx) => {
                let icon = <></>;

                if (idx === 0)
                  icon = (
                    <div className="w-20 h-20 bg-[#C05621] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Target className="h-9 w-9 text-white" />
                    </div>
                  );
                else if (idx === 1)
                  icon = (
                    <div className="w-20 h-20 bg-[#6B46C1] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Eye className="h-9 w-9 text-white" />
                    </div>
                  );
                else if (idx === 2)
                  icon = (
                    <div className="w-20 h-20 bg-[#2C7A7B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                      <Gem className="h-9 w-9 text-white" />
                    </div>
                  );

                return (
                  <Values
                    key={idx}
                    title={value.title}
                    description={value.description}
                    icon={icon}
                  />
                );
              })}
            </motion.div>
          </div>
        </section>
      </div>
    </section>
  );
};

export default AboutSection;
