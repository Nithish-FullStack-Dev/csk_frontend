import {
  Building,
  Users,
  Award,
  Clock,
  PlayCircle,
  Target,
  Eye,
  Gem,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { easeOut, motion, useAnimation } from "framer-motion";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useAbout } from "@/utils/public/AboutPageConfig.ts";
import StatCard from "./StatCard";
import Values from "./Values";

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
  const statIcons = [Building, Users, Award, Clock];

  const {
    data: aboutContent,
    isLoading,
    isError,
    refetch,
    isPending,
  } = useAbout();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) controls.start("visible");
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [controls]);

  const renderSkeletonText = (lines = 3) => (
    <Skeleton count={lines} className="mb-3" />
  );

  const renderSkeletonImage = () => (
    <Skeleton height={450} className="rounded-xl mb-4" />
  );

  const renderSkeletonStats = () => (
    <>
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} height={70} className="rounded-lg" />
        ))}
    </>
  );

  const renderSkeletonValues = () => (
    <>
      {Array(3)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="p-6 shadow-sm rounded-xl text-center">
            <Skeleton circle width={70} height={70} className="mx-auto mb-4" />
            <Skeleton width="60%" height={16} className="mx-auto mb-2" />
            <Skeleton width="80%" height={14} className="mx-auto" />
          </div>
        ))}
    </>
  );

  if (isError)
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-semibold mb-4">
          Failed to load About section.
        </p>
        <button
          onClick={() => refetch()}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          disabled={isLoading || isPending}
        >
          Retry
        </button>
      </div>
    );

  const youtubeVideoId = "c-goZSYW6qE";
  const youtubeThumbnailUrl = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;

  return (
    <section className="py-16 md:py-20 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-pattern-grid opacity-5 pointer-events-none"></div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Top Section  */}
        <motion.div
          ref={sectionRef}
          initial="hidden"
          animate={controls}
          variants={sectionVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 items-center"
        >
          {/* Left Content */}
          <motion.div variants={itemVariants}>
            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-md font-vidaloka text-gray-800 mb-6 leading-tight">
              {isLoading ? (
                <Skeleton width="60%" height={40} />
              ) : (
                aboutContent?.mainTitle || (
                  <>
                    <span className="text-purple-700">About</span> CSK Realtors:
                    Crafting Future Homes
                  </>
                )
              )}
            </h2>

            {/* Paragraph 1 */}
            <p className="text-lg text-gray-700 mb-6 md:leading-relaxed">
              {isLoading ? renderSkeletonText(3) : aboutContent?.paragraph1}
            </p>

            {/* Paragraph 2 */}
            <p className="text-lg text-gray-700 mb-8 md:leading-relaxed">
              {isLoading ? renderSkeletonText(2) : aboutContent?.paragraph2}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 mt-10">
              {isLoading
                ? renderSkeletonStats()
                : aboutContent?.stats?.map((stat, index) => {
                    const Icon = statIcons[index] || Building;
                    return (
                      <StatCard
                        key={index}
                        label={stat.label}
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

          {/* Right Image */}
          <motion.div variants={itemVariants}>
            {isLoading ? (
              renderSkeletonImage()
            ) : (
              <img
                src={aboutContent?.image}
                alt="About Section"
                className="w-full h-96 md:h-[500px] object-cover rounded-xl shadow-2xl"
              />
            )}
          </motion.div>
        </motion.div>

        {/*  Video Section  */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          variants={sectionVariants}
          className="mt-20 md:mt-24 text-center"
        >
          <h3 className="text-4xl font-md font-vidaloka text-gray-800 mb-10">
            See Our Vision in Action
          </h3>

          <div className="relative w-full max-w-full mx-auto rounded-xl overflow-hidden shadow-2xl aspect-video">
            {isLoading ? (
              <Skeleton height={450} />
            ) : !showVideo ? (
              <div
                className="relative w-full h-full bg-black rounded-xl cursor-pointer group"
                onClick={() => setShowVideo(true)}
              >
                <img
                  src={aboutContent?.thumbnail || youtubeThumbnailUrl}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-80"
                  alt="Video Thumbnail"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <PlayCircle className="w-20 h-20 text-white" />
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <iframe
                  src={
                    aboutContent?.videoUrl ||
                    `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
                  }
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

        {/*  Values Section  */}
        <section className="py-16   mt-16">
          <h2 className="text-4xl md:text-5xl font-md font-vidaloka text-center mb-16">
            Our Guiding Principles
          </h2>

          {isLoading ? (
            renderSkeletonValues()
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={sectionVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-10"
            >
              {aboutContent?.values?.map((value, idx) => {
                const icons = [Target, Eye, Gem];
                const Icon = icons[idx] || Target;
                return (
                  <Values
                    key={idx}
                    title={value.title}
                    description={value.description}
                    icon={
                      <div className="w-20 h-20 rounded-full bg-estate-navy flex items-center justify-center mx-auto mb-6 shadow-md">
                        <Icon className="h-9 w-9 text-estate-gold" />
                      </div>
                    }
                  />
                );
              })}
            </motion.div>
          )}
        </section>
      </div>
    </section>
  );
};

export default AboutSection;
