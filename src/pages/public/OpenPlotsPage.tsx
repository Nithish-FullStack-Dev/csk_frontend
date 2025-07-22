import PublicLayout from "@/components/layout/PublicLayout";
import PropertyListingCard from "@/components/public/PropertyListingCard"; // Assuming this component is well-designed
import {
  MapPin,
  Ruler,
  TreePine,
  Shield,
  Car,
  Zap,
  CheckCircle2,
  IndianRupee,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Using Shadcn UI Card components
import { easeOut, motion } from "framer-motion";
import "../../shine.css";
import { Link, useNavigate } from "react-router-dom";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { ColourfulText } from "@/components/ui/colourful-text";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

const OpenPlotsPage = () => {
  const navigate = useNavigate();
  const [plotProjects, setPlotProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchOpenPlots = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        "http://localhost:3000/api/openPlot/getAllOpenPlot"
      );
      setPlotProjects(data.plots);
      setIsError(false);
    } catch (error) {
      console.error("Failed to fetch open plots:", error);
      toast.error("Failed to load open plots.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenPlots();
  }, []);
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
        "All plots are DTCP/RERA approved with clear and verified titles.",
    },
  ];

  const plotSizes = [
    {
      size: "1000-1200 sq ft",
      ideal: "Cozy Villas / Row Houses",
      price: "₹25-35 L",
    },
    {
      size: "1200-1800 sq ft",
      ideal: "Family Homes / Medium Villas",
      price: "₹35-55 L",
    },
    {
      size: "1800-2400 sq ft",
      ideal: "Spacious Villas / Duplexes",
      price: "₹55-75 L",
    },
    {
      size: "2400+ sq ft",
      ideal: "Luxury Estates / Custom Builds",
      price: "₹75 L+",
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

  useEffect(() => {
    // window.scrollTo(0, 0);
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
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
          <div className="absolute inset-0 bg-pattern-dots opacity-10 pointer-events-none"></div>{" "}
          {/* Subtle background pattern */}
          <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
            <motion.h1
              className="text-5xl md:text-6xl text-estate-gold font-md mb-6 font-vidaloka leading-tight drop-shadow-lg"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <ColourfulText text="Discover Your Perfect Plot" />
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl max-w-4xl mx-auto drop-shadow-md text-purple-100"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            >
              Build your dream home on premium, legally approved residential
              plots in prime locations.
            </motion.p>
          </div>
        </section>

        {/* Plot Sizes Guide */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka text-gray-800 mb-4">
                Choose Your Ideal Plot Size
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Understanding plot dimensions helps you envision your future
                home.
              </p>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {plotSizes.map((plot, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="text-center h-full flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-purple-400">
                    <CardHeader className="pb-4">
                      <Ruler className="h-10 w-10 mx-auto mb-3 text-purple-600" />
                      <CardTitle className="text-2xl font-bold text-gray-800">
                        {plot.size}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-gray-700 mb-3 text-base">
                        Ideal for{" "}
                        <span className="font-semibold">{plot.ideal}</span>
                      </p>
                      <div className="text-2xl font-extrabold text-blue-700 mt-4">
                        {plot.price}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Available Plots */}
        <section className="py-11 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-md font-vidaloka text-gray-800 mb-4">
                Our Premier Plot Projects
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Explore our curated selection of ready-to-build plots in
                Hyderabad, Bangalore, and Gurgaon.
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
                  onClick={fetchOpenPlots}
                  className="px-4 py-2 flex items-center justify-center gap-2 rounded bg-blue-600 hover:bg-blue-700 text-white transition"
                >
                  retry
                </button>
              </div>
            ) : (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 justify-center items-start"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                {plotProjects.map((plot) => (
                  <CardContainer key={plot.id} className="inter-var">
                    <CardBody className="bg-white dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] rounded-2xl w-[25rem] h-[30rem] p-6 group/card shadow-xl flex flex-col justify-between transition-all duration-300">
                      {/* Badge */}
                      <CardItem
                        translateZ={30}
                        className="absolute top-6 right-4 bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
                      >
                        Open Plots
                      </CardItem>
                      {/* Title */}
                      <CardItem
                        translateZ={30}
                        className="text-xl font-md font-vidaloka text-neutral-900 dark:text-white"
                      >
                        {plot.projectName}
                      </CardItem>

                      <CardItem translateZ={80} className="w-full mt-4">
                        <img
                          src={plot.thumbnailUrl}
                          alt={plot.title}
                          className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl transition-transform duration-300 ease-out"
                        />
                      </CardItem>

                      <div className="mt-4 space-y-1">
                        <CardItem
                          translateZ={20}
                          className="text-sm text-gray-600 dark:text-gray-300"
                        >
                          📍 {plot.location || "-"}
                        </CardItem>

                        <CardItem
                          translateZ={20}
                          className="text-sm text-gray-600 dark:text-gray-300"
                        >
                          Plot Type: {plot.plotType || "-"}
                        </CardItem>

                        <CardItem
                          translateZ={20}
                          className="text-base font-semibold text-blue-700 dark:text-blue-400"
                        >
                          ₹{plot.totalAmount.toLocaleString()}
                        </CardItem>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Link to={`/public/openPlot/${plot._id}`}>
                          <CardItem
                            translateZ={30}
                            as="button"
                            className="px-5 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-medium"
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

        {/* Amenities */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka text-gray-800 mb-4">
                Exceptional Community Amenities
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                We provide world-class infrastructure and facilities for a
                comfortable and secure living.
              </p>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
            >
              {amenities.map((amenity, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="text-center h-full flex flex-col p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-estate-gold">
                    <CardHeader className="pb-4">
                      <amenity.icon className="h-14 w-14 mx-auto mb-4 text-estate-gold animate-bounce-subtle" />{" "}
                      {/* Larger icon with subtle animation */}
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

        {/* Why Choose Our Plots */}
        <section className="py-20 bg-estate-navy text-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-md font-vidaloka mb-4 text-estate-gold">
                Why Invest with CSK Estate?
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Partner with us for a seamless and rewarding plot ownership
                experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
              >
                <ul className="space-y-6 text-lg">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 mr-4 text-estate-gold flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-estate-gold">
                        Approved & Clear Titles:
                      </strong>{" "}
                      All layouts are DTCP/RERA approved with transparent and
                      legally verified ownership.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 mr-4 text-estate-gold flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-estate-gold">
                        Ready Infrastructure:
                      </strong>{" "}
                      Enjoy ready-to-use roads, reliable electricity, and
                      efficient water supply.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 mr-4 text-estate-gold flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-estate-gold">
                        Flexible Payment Options:
                      </strong>{" "}
                      Tailored payment plans to suit your financial needs,
                      making ownership accessible.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 mr-4 text-estate-gold flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-estate-gold">
                        High Appreciation Potential:
                      </strong>{" "}
                      Invest in strategically chosen locations poised for
                      significant future growth.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 mr-4 text-estate-gold flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-estate-gold">
                        Home Loan Assistance:
                      </strong>{" "}
                      Comprehensive support and guidance for hassle-free home
                      loan processing.
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-6 w-6 mr-4 text-estate-gold flex-shrink-0 mt-1" />
                    <span>
                      <strong className="text-estate-gold">
                        Construction Support:
                      </strong>{" "}
                      Access to trusted construction partners and expert
                      architect recommendations.
                    </span>
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.3 }}
                className="block shine-container"
              >
                <img
                  src="https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" // Higher resolution image for a larger display
                  alt="Plot Development Overview"
                  className="rounded-xl shadow-2xl object-cover w-full h-80 md:h-96 transition-transform duration-500 group-hover:scale-105" // Added object-cover and specific height
                />
                <span className="shine-overlay"></span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Call to Action - Optional addition */}
        <section className="py-16 bg-purple-100 text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-md font-vidaloka text-gray-800 mb-6">
              Ready to Find Your Plot?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-3xl mx-auto">
              Contact us today to speak with our experts and discover plots that
              match your vision and investment goals.
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

export default OpenPlotsPage;
