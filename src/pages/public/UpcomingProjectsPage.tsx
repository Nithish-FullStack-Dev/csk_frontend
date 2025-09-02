import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Bell, Gift, Users } from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";
import { motion } from "framer-motion";
import "../../shine.css";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ColourfulText } from "@/components/ui/colourful-text";
import axios from "axios";
import { useEffect, useState } from "react";
import { Property } from "@/types/property";
import { toast } from "sonner";

const UpcomingProjectsPage = () => {
  const [upcomingProjects, setUpcomingProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchUpcomingProperties = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/properties/upcoming-properties`
      );
      const upcomingProjectsFromDB: Property[] = data.map((item: any) => {
        const basic = item.basicInfo || {};
        const finance = item.financialDetails || {};
        const location = item.locationInfo || {};
        return {
          id: item._id,
          title: basic?.projectName || "Untitled Project",
          launchDate: "coming soon",
          price: finance?.totalAmount?.toString()?.slice(0, 2) || "00",
          location: location?.googleMapsLocation || "Not specified",
          image:
            location?.mainPropertyImage ||
            "https://via.placeholder.com/400x300?text=No+Image",
          category: basic?.propertyType || "Unknown",
          preBooking:
            typeof basic?.preBooking === "boolean" ? basic.preBooking : false,
        };
      });
      setUpcomingProjects(upcomingProjectsFromDB);
      setIsError(false);
    } catch (error) {
      console.error("Failed to upcoming properties:", error);
      setIsError(true);
      toast.error("Failed to load upcoming properties.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingProperties();
    // window.scrollTo(0, 0);
  }, []);

  const benefits = [
    {
      icon: Star,
      title: "Early Bird Pricing",
      description: "Get the lowest prices with exclusive pre-launch offers",
    },
    {
      icon: Gift,
      title: "Special Offers",
      description: "Additional benefits like free upgrades and waived fees",
    },
    {
      icon: Users,
      title: "Priority Selection",
      description: "First choice of units, floors, and premium locations",
    },
    {
      icon: Bell,
      title: "VIP Treatment",
      description: "Exclusive updates and priority customer service",
    },
  ];

  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero Header with Overlay */}
        <section
          className="relative text-white overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
          <div className="container mx-auto px-4  py-32 text-center relative z-10">
            <motion.h1
              className="text-4xl sm:text-5xl font-vidaloka  mt-20 font-md text-white mb-4"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              Our Upcoming Projects
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-white max-w-2xl mx-auto"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              Be the first to invest in our premium developments before the
              public launch.
            </motion.p>
          </div>

          {/* Exclusive Offer with Shine */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="shine-effect relative py-16 text-white text-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1549740436-aac7e9766571?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 z-0" />
            <div className="container mx-auto px-4 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-md font-vidaloka text-yellow-400 mb-4">
                ✨ Exclusive Pre-Launch Offers! ✨
              </h2>
              <p className="text-lg sm:text-xl font-medium text-white">
                Register now and{" "}
                <span className="underline font-semibold text-lime-300">
                  save up to ₹5 Lakhs
                </span>{" "}
                on select properties.
              </p>
            </div>
          </motion.section>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-md font-vidaloka text-blue-700 mb-2">
                Early Bird Benefits
              </h2>
              <p className="text-gray-600">
                Why register for upcoming projects?
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, i) => (
                <Card
                  key={i}
                  className="text-center hover:shadow-lg transition-all"
                >
                  <CardContent className="p-6">
                    <benefit.icon className="h-10 w-10 mx-auto mb-4 text-indigo-500" />
                    <h3 className="text-lg font-semibold mb-2 text-green-600">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Projects */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-md font-vidaloka  mb-2">
                <ColourfulText text="Coming Soon!" />
              </h2>
              <p className="text-gray-600">
                Discover our upcoming developments
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
                  onClick={fetchUpcomingProperties}
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
                {upcomingProjects.map((project) => (
                  <CardContainer key={project.id} className="inter-var">
                    <CardBody className="bg-white dark:bg-black border border-gray-200 dark:border-white/[0.1] rounded-2xl w-[25rem] h-[35rem] p-6 group/card shadow-xl flex flex-col justify-between relative">
                      {/* Pre-Booking Badge */}
                      {project.preBooking ? (
                        <CardItem
                          translateZ={30}
                          className="absolute top-4 right-4 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10"
                        >
                          Pre-Booking Open
                        </CardItem>
                      ) : (
                        <CardItem
                          translateZ={30}
                          className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm z-10"
                        >
                          Coming Soon
                        </CardItem>
                      )}

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

                      {/* Launch Date */}
                      <CardItem
                        translateZ={20}
                        className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-300"
                      >
                        <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                        Launch: {project.launchDate}
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
                      <div className="mt-4">
                        <CardItem
                          translateZ={40}
                          as="button"
                          className={`w-full px-4 py-2 rounded-full text-sm font-medium ${
                            project.preBooking
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "text-blue-600 border border-blue-600 hover:bg-blue-100"
                          }`}
                        >
                          {project.preBooking
                            ? "Register Interest"
                            : "Get Notified"}
                        </CardItem>
                      </div>
                    </CardBody>
                  </CardContainer>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Enquiry Form */}
        <section className="py-10 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-md font-vidaloka text-orange-600 mb-2">
                Register Your Interest!
              </h2>
              <p className="text-gray-600">
                Be the first to know about our new launches and get exclusive
                benefits.
              </p>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default UpcomingProjectsPage;
