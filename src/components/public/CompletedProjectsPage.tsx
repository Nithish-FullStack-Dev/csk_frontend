import PublicLayout from "@/components/layout/PublicLayout";
import {
  CheckCircle,
  Users,
  Calendar,
  Award,
  Home,
  Star,
  Trophy,
  Smile,
  MapPin,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { Property } from "@/types/property";
import { useEffect, useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const CompletedProjectsPage = () => {
  const [completedProjects, setCompletedProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchCompletedProperties = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:3000/api/properties/completed-properties"
      );
      const completedProjectsFromDB: Property[] = data.map((item: any) => {
        const basic = item.basicInfo || {};
        const finance = item.financialDetails || {};
        const location = item.locationInfo || {};
        return {
          id: item._id,
          title: basic?.projectName || "Untitled Project",
          price: finance?.totalAmount?.toString()?.slice(0, 2) || "00",
          location: location?.googleMapsLocation || "Not specified",
          image:
            location?.mainPropertyImage ||
            "https://via.placeholder.com/400x300?text=No+Image",
          category: basic?.propertyType || "Unknown",
        };
      });
      setCompletedProjects(completedProjectsFromDB);
      setIsError(false);
    } catch (error) {
      console.error("Failed to completed properties:", error);
      toast.error("Failed to load Completed properties.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedProperties();
    // window.scrollTo(0, 0);
  }, []);

  const stats = [
    {
      icon: CheckCircle,
      label: "Projects Completed",
      value: "25+",
      color: "text-green-600",
    },
    {
      icon: Users,
      label: "Happy Families",
      value: "500+",
      color: "text-blue-600",
    },
    {
      icon: Calendar,
      label: "Years of Delivery",
      value: "8+",
      color: "text-indigo-600",
    },
    {
      icon: Award,
      label: "Quality Awards",
      value: "15+",
      color: "text-yellow-600",
    },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-white">
        {/* Header - Background Image */}
        <section
          className="relative py-48 text-white overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-md font-vidaloka mb-6 tracking-tight leading-tight drop-shadow-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Home className="inline-block mr-4 h-12 w-12" />
              Our Completed Projects
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-green-100 max-w-3xl mx-auto opacity-90"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            >
              See the <strong>excellence</strong> and{" "}
              <strong>craftsmanship</strong> in every home we've successfully
              delivered.
            </motion.p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-800">
                <Trophy className="inline-block mr-3 h-10 w-10 text-yellow-500" />
                Our Proven Track Record
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Numbers that reflect our dedication to <strong>quality</strong>{" "}
                and <strong>customer satisfaction</strong>.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-200 text-center cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                  }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  <stat.icon
                    className={`h-14 w-14 mx-auto mb-4 ${stat.color} transition-transform duration-300 hover:scale-110`}
                  />
                  <div className="text-4xl font-extrabold mb-2 text-slate-800">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 text-base font-semibold">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-20 bg-[#F9FAF1]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-800">
                <Star className="inline-block mr-3 h-10 w-10 text-blue-500" />
                Homes Ready for You
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Browse through our portfolio of{" "}
                <strong>ready-to-move-in</strong> properties.
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
                  onClick={fetchCompletedProperties}
                  disabled={loading}
                  className={`px-4 py-2 flex items-center justify-center gap-2 rounded transition ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {completedProjects.map((project) => (
                  <CardContainer key={project.id} className="inter-var">
                    <CardBody className="bg-white dark:bg-black border border-gray-200 dark:border-white/[0.1] rounded-2xl w-[25rem] h-[35rem] p-6 group/card shadow-xl flex flex-col justify-between relative">
                      {/* Title */}
                      <CardItem
                        translateZ={30}
                        className="text-xl font-bold text-neutral-900 dark:text-white mb-2"
                      >
                        {project.title}
                      </CardItem>

                      {/* Image */}
                      <CardItem
                        translateZ={80}
                        className="w-full mt-4 rounded-xl overflow-hidden"
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
                        className="mt-3 flex items-center text-sm text-gray-600 dark:text-gray-300"
                      >
                        <MapPin className="h-4 w-4 mr-1" />
                        {project.location}
                      </CardItem>

                      {/* Description */}
                      <CardItem
                        translateZ={20}
                        className="text-sm text-gray-600 mt-2 line-clamp-2"
                      >
                        Category: {project.category}
                      </CardItem>

                      {/* Price */}
                      <CardItem
                        translateZ={30}
                        className="text-lg font-bold text-indigo-700 mt-3"
                      >
                        ₹{project.price} Lakhs onwards
                      </CardItem>

                      {/* Button */}
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

        {/* Why Choose Completed Projects */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-slate-800">
                <Smile className="inline-block mr-3 h-10 w-10 text-purple-500" />
                Why Choose a Completed Home?
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Enjoy <strong>peace of mind</strong> and{" "}
                <strong>immediate comfort</strong> with our finished projects.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 transition-transform duration-300 hover:rotate-3" />
                <h3 className="text-2xl font-semibold mb-2 text-slate-800">
                  Ready to Move In
                </h3>
                <p className="text-gray-600 text-base">
                  No waiting! Get your keys and start living in your new home
                  today.
                </p>
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Award className="h-16 w-16 mx-auto mb-4 text-blue-500 transition-transform duration-300 hover:scale-110" />
                <h3 className="text-2xl font-semibold mb-2 text-slate-800">
                  Quality You Can See
                </h3>
                <p className="text-gray-600 text-base">
                  Inspect the actual property and finishes before making your
                  decision.
                </p>
              </motion.div>
              <motion.div
                className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center cursor-pointer"
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                }}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Users className="h-16 w-16 mx-auto mb-4 text-purple-500 transition-transform duration-300 hover:-translate-y-1" />
                <h3 className="text-2xl font-semibold mb-2 text-slate-800">
                  Thriving Community
                </h3>
                <p className="text-gray-600 text-base">
                  Join an established neighborhood with existing amenities and
                  friendly faces.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default CompletedProjectsPage;
