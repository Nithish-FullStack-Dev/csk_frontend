// OpenLandsPage.tsx
import PublicLayout from "@/components/layout/PublicLayout";
import {
  MapPin,
  Ruler,
  TreePine,
  Shield,
  Car,
  Zap,
  CheckCircle2,
  IndianRupee,
  HomeIcon,
  Building2,
  Factory,
  Leaf,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { easeOut, motion } from "framer-motion";
import "../../shine.css";
import { Link, useNavigate } from "react-router-dom";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ColourfulText } from "@/components/ui/colourful-text";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import CircleLoader from "@/components/CircleLoader";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useOpenLand } from "@/utils/public/Config";
import { OpenLand } from "@/types/OpenLand";

const OpenLandsPage = () => {
  const navigate = useNavigate();

  const {
    data: landProjects,
    isLoading: openLandsLoading,
    isError: openLandsError,
    error: openLandsErr,
    refetch,
  } = useOpenLand();
  const openLandList: OpenLand[] = Array.isArray(landProjects)
    ? landProjects
    : Array.isArray((landProjects as any)?.lands)
    ? (landProjects as any)?.lands
    : Array.isArray((landProjects as any)?.openlands)
    ? (landProjects as any)?.openlands
    : Array.isArray((landProjects as any)?.openLands)
    ? (landProjects as any)?.openLands
    : [];

  if (openLandsError) {
    toast.error(openLandsErr.message);
    console.log("OpenLands error:", openLandsErr);
  }
  const amenities = [
    {
      icon: TreePine,
      title: "Lush Green Spaces",
      description:
        "Expansive landscaped gardens and serene parks for relaxation.",
    },
    {
      icon: Shield,
      title: "Enhanced Security",
      description: "24/7 manned security, CCTV surveillance, and gated access.",
    },
    {
      icon: Car,
      title: "Well-Planned Roads",
      description:
        "Wide, black-topped roads with proper drainage and street lighting.",
    },
    {
      icon: Zap,
      title: "Ready Utility Connections",
      description:
        "Seamless access to electricity, water, and efficient sewage systems.",
    },
    {
      icon: MapPin,
      title: "Strategic Locations",
      description:
        "Plots situated in rapidly developing areas with excellent connectivity.",
    },
    {
      icon: Ruler,
      title: "Legally Approved",
      description:
        "Open lands are vetted with clear titles and standard approvals.",
    },
  ];
  const landTypes = [
    {
      icon: TreePine,
      title: "Agriculture Land",
      description: "Best for farming, plantations and long-term cultivation.",
    },
    {
      icon: Ruler,
      title: "Non-Agriculture Land",
      description:
        "Permitted for residential, commercial or mixed development.",
    },
    {
      icon: HomeIcon,
      title: "Residential Land",
      description: "Ideal for villas, homes, gated communities and townships.",
    },
    {
      icon: Building2,
      title: "Commercial Land",
      description: "Suitable for offices, shops, business complexes and trade.",
    },
    {
      icon: Factory,
      title: "Industrial Land",
      description: "Allocated for warehouses, factories and production units.",
    },
    {
      icon: Leaf,
      title: "Farm Land",
      description:
        "Perfect for weekend farming, resorts and farmhouse projects.",
    },
  ];
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.6, ease: easeOut } },
  };
  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-100">
        <section
          className="text-white py-24 md:py-32 relative overflow-hidden"
          style={{
            backgroundImage:
              'url("https://t3.ftcdn.net/jpg/07/75/62/70/360_F_775627009_gs1mFbknZqtkjaIXI44mPLp38NAurxLa.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-70 z-0" />
          <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none"></div>
          <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
            <motion.h1
              className="text-5xl md:text-6xl text-estate-gold font-md mb-6 font-vidaloka leading-tight drop-shadow-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Discover Open Lands
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow-md text-purple-100"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            >
              Browse available open lands across regions — detailed information,
              maps and media to help you pick the perfect land.
            </motion.p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-md font-vidaloka text-gray-800 mb-4">
                Open Land Types
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore different categories of open lands ideal for farming,
                living, business growth, and long-term investments.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {landTypes?.map((land, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="text-center h-full flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-estate-gold">
                    <CardHeader className="pb-4">
                      <land.icon className="h-14 w-14 mx-auto mb-4 text-estate-gold" />
                      <CardTitle className="text-xl font-md font-vidaloka text-gray-800">
                        {land?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 text-base">
                        {land?.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* -------------------- AVAILABLE OPEN LANDS (UPDATED LIKE PLOTS) -------------------- */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka text-gray-800 mb-4">
                Available Open Lands
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Select from our curated selection of open lands ready for
                investment and development.
              </p>
            </div>

            {openLandsLoading ? (
              <div className="text-center py-10">
                <h1 className="text-lg text-gray-600 animate-pulse">
                  Please wait...
                </h1>
              </div>
            ) : openLandsError ? (
              <div className="text-center py-10">
                <h1 className="text-lg text-red-500 mb-4">
                  Something went wrong...
                </h1>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 flex items-center justify-center gap-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  retry
                </button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-center items-start"
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {openLandList.length === 0 && (
                  <div className="col-span-full text-center text-gray-500">
                    No open lands available right now.
                  </div>
                )}

                {openLandList?.map((land: OpenLand) => (
                  <CardContainer key={land?._id} className="inter-var">
                    <CardBody
                      className="
                bg-white dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1]
                dark:bg-black dark:border-white/[0.2]
                rounded-2xl w-full sm:w-[22rem] md:w-[24rem] lg:w-[25rem]
                h-auto min-h-[26rem] md:min-h-[30rem]
                p-6 group/card shadow-xl flex flex-col justify-between relative transition-all duration-300
              "
                    >
                      {/* Badge */}
                      <CardItem
                        translateZ={30}
                        className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
                      >
                        Open Land
                      </CardItem>

                      {/* Image */}
                      <CardItem translateZ={80} className="w-full mt-3">
                        <img
                          src={land?.thumbnailUrl}
                          alt={land?.projectName}
                          className="h-44 sm:h-52 md:h-56 lg:h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl transition-transform duration-300 ease-out"
                        />
                      </CardItem>

                      {/* Title */}
                      <CardItem
                        translateZ={30}
                        className="text-lg mt-3 space-y-1 sm:text-xl font-md font-vidaloka text-neutral-900 dark:text-white"
                      >
                        {land?.projectName}
                      </CardItem>

                      {/* MAP SECTION */}
                      <CardItem className="mt-3 flex flex-col text-xs sm:text-sm text-gray-600 dark:text-gray-300 w-70">
                        {land?.googleMapsLocation ? (
                          <div className="w-full h-32 rounded-lg overflow-hidden">
                            <iframe
                              src={land.googleMapsLocation}
                              width="100%"
                              height="100%"
                              style={{ border: 0 }}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                        ) : (
                          <div className="w-full h-32 rounded-lg bg-gray-100 flex items-center justify-center">
                            <p className="text-gray-500 text-sm">
                              Location map not available
                            </p>
                          </div>
                        )}
                      </CardItem>

                      {/* Land Type */}
                      <CardItem
                        translateZ={20}
                        className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2"
                      >
                        Land Type: {land?.landType || "-"}
                      </CardItem>

                      {/* Button */}
                      <div className="mt-4 flex justify-end">
                        <Link
                          to={`/public/openLand/${land?._id}`}
                          className="w-full"
                        >
                          <CardItem
                            translateZ={30}
                            as="button"
                            className="w-full px-4 py-2 rounded-full bg-slate-600 dark:bg-white text-white dark:text-black text-xs sm:text-sm font-medium transition-colors hover:opacity-90"
                          >
                            View Details
                          </CardItem>
                        </Link>
                      </div>
                    </CardBody>
                  </CardContainer>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka text-gray-800 mb-4">
                Why Choose Our Lands
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We provide clear titles, ready utilities and prime locations.
              </p>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {amenities.map((amenity, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="text-center h-full flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-estate-gold">
                    <CardHeader className="pb-4">
                      <amenity.icon className="h-14 w-14 mx-auto mb-4 text-estate-gold" />
                      <CardTitle className="text-xl font-md font-vidaloka text-gray-800">
                        {amenity.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-600 text-base">
                        {amenity.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-16 bg-stone-50 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-md font-vidaloka text-estate-navy mb-6">
              Ready to Explore?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Contact us to schedule a site visit or request detailed land docs.
            </p>
            <motion.button
              className="bg-estate-gold text-estate-navy px-10 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/public/contact")}
            >
              Get in Touch Now
            </motion.button>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};
export default OpenLandsPage;
