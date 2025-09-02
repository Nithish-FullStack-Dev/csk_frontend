import PublicLayout from "@/components/layout/PublicLayout";
import PropertyListingCard from "@/components/public/PropertyListingCard";
import {
  Construction,
  Clock,
  TrendingUp,
  Shield,
  Hammer,
  House,
  Rocket,
  DollarSign,
  MapPin,
  Calendar,
} from "lucide-react"; // Added more icons for fun!
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { url } from "inspector";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Link } from "react-router-dom";
import axios from "axios";
import { Property } from "@/types/property";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const OngoingProjectsPage = () => {
  const [ongoingProjects, setOngoingProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchOngoingProperties = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/properties/ongoing-properties`
      );
      const ongoingProjectsFromDB: Property[] = data.map((item: any) => {
        const basic = item.basicInfo || {};
        const finance = item.financialDetails || {};
        const location = item.locationInfo || {};
        return {
          id: item._id,
          title: basic?.projectName,
          launchDate: "Coming Soon",
          price: finance.totalAmount.toString().slice(0, 2),
          location: location?.googleMapsLocation,
          image: location?.mainPropertyImage,
          category: basic?.propertyType,
          preBooking: basic.preBooking,
        };
      });
      setOngoingProjects(ongoingProjectsFromDB);
      setIsError(false);
    } catch (error) {
      console.error("Failed to ongoing properties:", error);
      setIsError(true);
      toast.error("Failed to load ongoing properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOngoingProperties();
    // window.scrollTo(0, 0);
  }, []);

  const projectProgress = [
    { name: "Sunrise Heights", progress: 75, expectedCompletion: "Dec 2024" },
    {
      name: "Tech Park Residency",
      progress: 60,
      expectedCompletion: "Jun 2025",
    },
    { name: "Royal Gardens", progress: 45, expectedCompletion: "Mar 2025" },
  ];

  // New, more vibrant colors for our design!
  const vibrantColors = {
    primary: "#6A5ACD", // SlateBlue
    secondary: "#FFD700", // Gold
    accent1: "#32CD32", // LimeGreen
    accent2: "#FFA500", // Orange
    backgroundLight: "#F0F8FF", // AliceBlue
    backgroundDark: "#191970", // MidnightBlue
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header - Super Hero Style! */}
        <section
          className="relative py-36  overflow-hidden text-center "
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cmVhbCUyMGVzdGF0ZXxlbnwwfHwwfHx8MA%3D%3D')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1
              className="text-5xl md:text-7xl font-md font-vidaloka mb-6 py-10 tracking-tight leading-tight text-white drop-shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              🚀 Awesome Ongoing Projects!
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-yellow-200 max-w-3xl mx-auto italic"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.3,
                type: "spring",
                stiffness: 100,
                damping: 10,
              }}
            >
              Grab your dream home while it's still being built and lock in{" "}
              <span className="font-bold underline">amazing deals</span>!
            </motion.p>
          </div>

          {/* Fun little decorative shapes! */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full animate-pulse-slow delay-500"></div>
        </section>

        {/* Progress Tracking - See it Grow! */}
        <section className="py-20 bg-white shadow-inner">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka mb-4 text-blue-700">
                Building Dreams: Live Progress! 🏗️
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Watch your future home come to life with our transparent
                progress tracker!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {projectProgress.map((project, index) => (
                <motion.div
                  key={index}
                  className="bg-purple-50 p-8 rounded-2xl shadow-lg border-2 border-purple-200 cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    rotate: 2,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: index * 0.15,
                    type: "spring",
                    stiffness: 120,
                  }}
                >
                  <h3 className="text-2xl font-md font-vidaloka mb-3 text-blue-800 text-center">
                    <Hammer className="inline-block mr-2 text-purple-600" />
                    {project.name}
                  </h3>
                  <div className="mb-5">
                    <div className="flex justify-between text-base font-semibold mb-2 text-gray-700">
                      <span>Progress!</span>
                      <span className="text-purple-600">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress
                      value={project.progress}
                      className="h-3 bg-purple-200"
                    />
                  </div>
                  <div className="text-base text-gray-600 font-medium text-center">
                    <Clock className="inline h-5 w-5 mr-1 text-purple-500" />
                    Ready by:{" "}
                    <span className="font-semibold text-purple-700">
                      {project.expectedCompletion}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid - Your New Home Awaits! */}
        <section className="py-20 bg-blue-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka mb-4 text-green-700">
                🏡 Our Awesome Houses for You!
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                These homes are being built just for you! Get in early and
                choose the best spot!
              </p>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <h1 className="text-lg text-gray-600 animate-pulse">
                  Please wait...
                </h1>
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <h1 className="text-lg text-red-500 mb-4">
                  Something went wrong...
                </h1>
                <button
                  onClick={fetchOngoingProperties}
                  className="px-4 py-2 flex items-center justify-center gap-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {ongoingProjects.map((project, index) => (
                  <CardContainer key={project.id} className="inter-var">
                    <CardBody className="bg-white dark:bg-black border border-gray-200 dark:border-white/[0.1] rounded-2xl w-[25rem] h-[35rem] p-6 group/card shadow-xl flex flex-col justify-between relative">
                      {/* Title */}
                      <CardItem
                        translateZ={30}
                        className="text-xl font-md font-vidaloka text-neutral-900 dark:text-white mb-2"
                      >
                        {project.title}
                      </CardItem>

                      {/* Image */}
                      <CardItem
                        translateZ={80}
                        className="w-full mt-1 rounded-xl overflow-hidden"
                      >
                        <img
                          src={project.image}
                          alt={project.title}
                          className="h-60 w-full object-cover rounded-xl transition-transform duration-500 ease-out group-hover/card:scale-105"
                        />
                      </CardItem>

                      {/* Location */}
                      <CardItem
                        translateZ={20}
                        className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-300"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </CardItem>

                      {/* Price */}
                      <CardItem
                        translateZ={30}
                        className="text-lg font-bold text-indigo-700 mt-1"
                      >
                        ₹{project.price} Lakhs onwards
                      </CardItem>

                      {/* Buttons */}
                      <div className="mt-1 space-y-2">
                        <Link to={`/public/project/${project.id}`}>
                          <CardItem
                            translateZ={40}
                            as="button"
                            className="w-full px-4 py-2 rounded-full text-sm font-medium text-estate-navy/90 border border-estate-navy/80 hover:bg-estate-navy/30 transition-colors"
                          >
                            View Details
                          </CardItem>
                        </Link>

                        <CardItem
                          translateZ={40}
                          as="button"
                          className="w-full px-4 py-2 rounded-full text-sm font-medium bg-estate-navy text-white hover:bg-estate-navy/90 transition-colors flex items-center justify-center"
                        >
                          Schedule Site Visit
                          <Calendar className="ml-2 h-4 w-4" />
                        </CardItem>
                      </div>
                    </CardBody>
                  </CardContainer>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Benefits of Buying Ongoing Projects - Smart Choices! */}
        <section className="py-20 bg-yellow-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka mb-4 text-orange-700">
                💡 Why Buy Now? Super Smart Reasons!
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Buying an ongoing project is like finding a secret treasure!
                Here's why:
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg border-2 border-yellow-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "#FFFACD",
                }}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <DollarSign className="h-14 w-14 mx-auto mb-4 text-green-600 animate-bounce-subtle" />
                <h3 className="text-2xl font-bold mb-2 text-green-800">
                  Save Money!
                </h3>
                <p className="text-gray-600 text-base">
                  Get amazing early bird prices and flexible payment plans!
                </p>
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg border-2 border-yellow-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "#FFFACD",
                }}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Construction className="h-14 w-14 mx-auto mb-4 text-blue-600 animate-spin-slow" />
                <h3 className="text-2xl font-bold mb-2 text-blue-800">
                  Your Way!
                </h3>
                <p className="text-gray-600 text-base">
                  Pick your favorite colors and designs inside!
                </p>
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg border-2 border-yellow-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "#FFFACD",
                }}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Clock className="h-14 w-14 mx-auto mb-4 text-purple-600 animate-pulse-fast" />
                <h3 className="text-2xl font-bold mb-2 text-purple-800">
                  Easy Payments!
                </h3>
                <p className="text-gray-600 text-base">
                  Pay over time, as the building gets finished!
                </p>
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-2xl shadow-lg border-2 border-yellow-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  backgroundColor: "#FFFACD",
                }}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Shield className="h-14 w-14 mx-auto mb-4 text-orange-600 animate-wiggle" />
                <h3 className="text-2xl font-bold mb-2 text-orange-800">
                  Super Safe!
                </h3>
                <p className="text-gray-600 text-base">
                  All projects are officially registered for your peace of mind!
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default OngoingProjectsPage;
