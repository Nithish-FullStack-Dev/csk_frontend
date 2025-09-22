import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, Home, Building, Flag } from "lucide-react";
import { Link } from "react-router-dom";
import { easeOut, motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import "../../shine.css";
import axios from "axios";

const FeaturedProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [carouselData, setCarouselData] = useState([]);
  const [galleryTitle, setGalleryTitle] = useState<string>("");
  const [galleryDes, setGalleryDes] = useState<string>("");

  const fetchProperties = async () => {
    if (loading) return;
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/cms/getAllCms`
      );
      setProperties(data.banners.slice(0, 3).reverse());
      setIsError(false);
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarouselData = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:3000/api/aboutSection/getAboutSec"
      );
      setCarouselData(data.gallery || []);
      setGalleryTitle(data.galleryTitle || "Featured Properties");
      setGalleryDes(
        data.galleryDes ||
          "Discover our handpicked selection of premium properties designed for modern living"
      );
    } catch (error) {
      console.error("Failed to fetch carousel data:", error);
      setCarouselData([]);
      setGalleryTitle("Featured Properties");
      setGalleryDes(
        "Discover our handpicked selection of premium properties designed for modern living"
      );
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchCarouselData();
  }, []);

  // Duplicate carousel data for infinite scroll effect
  const infiniteCarouselData = [...carouselData, ...carouselData];

  const [isHovered, setIsHovered] = useState(false);
  const carouselContainerRef = useRef(null);
  const carouselTrackRef = useRef(null);

  useEffect(() => {
    let animationFrameId;
    let start = null;
    const speed = 0.7; // Controls the scroll speed in pixels per frame

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (!isHovered && carouselTrackRef.current) {
        const currentTranslateX = parseFloat(
          carouselTrackRef.current.style.transform
            ?.replace("translateX(", "")
            .replace("px)", "") || "0"
        );
        const newTranslateX = currentTranslateX - speed;

        if (carouselContainerRef.current && carouselTrackRef.current) {
          const singleLoopWidth = carouselTrackRef.current.scrollWidth / 2;

          if (Math.abs(newTranslateX) >= singleLoopWidth) {
            carouselTrackRef.current.style.transform = `translateX(0px)`;
            start = timestamp;
          } else {
            carouselTrackRef.current.style.transform = `translateX(${newTranslateX}px)`;
          }
        }
      } else {
        start = null;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: easeOut,
      },
    },
  };

  return (
    <section className="py-5 bg-[#F9FAF1]">
      <motion.div
        className="container mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInUp}
      >
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-md mb-4 text-black-300">
            {galleryTitle}
          </h2>
          <p className="md:text-4xl text-3xl text-gray-600 max-w-3xl mx-auto font-md font-vidaloka">
            {galleryDes}
          </p>
        </div>

        {/* Carousel Section */}
        <div
          ref={carouselContainerRef}
          className="relative w-full overflow-hidden mb-7"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={carouselTrackRef}
            className="flex h-full gap-4"
            style={{
              transition: isHovered ? "none" : "transform linear 0s",
              willChange: "transform",
            }}
          >
            {infiniteCarouselData.length > 0 ? (
              infiniteCarouselData.map((item, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-[70vw] sm:w-[60vw] md:w-[50vw] lg:w-[40vw]"
                >
                  <div className="w-full">
                    {/* Image container with responsive aspect ratio */}
                    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg shadow-lg">
                      <img
                        src={item.image}
                        alt={item.title || `Project ${index + 1}`}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Text below the image aligned to the left */}
                    <div className="mt-2 ml-1">
                      <p className="text-left text-sm text-black font-vidaloka">
                        {item.title || `Project ${index + 1}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">
                  No carousel data available
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="text-center py-12 animate-pulse">
            <h1 className="text-lg text-gray-500">
              Please wait while we fetch properties...
            </h1>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <h1 className="text-lg text-red-500 font-semibold mb-4">
              Something went wrong while loading properties.
            </h1>
            <button
              onClick={fetchProperties}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-md font-medium transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading && (
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
              )}
              {loading ? "Retrying..." : "Retry"}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
            {properties.map((property) => (
              <motion.div
                key={property._id}
                className="group text-center space-y-4"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeInUp}
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                  <Link
                    to={`/public/project/${property._id}`}
                    className="block shine-container"
                  >
                    <img
                      src={property?.image}
                      alt={property.title}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <span className="shine-overlay"></span>
                  </Link>
                </div>
                <h3 className="text-lg font-semibold font-vidaloka text-gray-800">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600">{property.subtitle}</p>
                <Link
                  to={`/public/project/${property._id}`}
                  className="btn transparent-btn mt-2 inline-block"
                >
                  <div className="btn_m">
                    <div className="btn_c">
                      <div className="btn_t1">View Details</div>
                      <div className="btn_t2">View Details</div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Quick Links to Categories */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeInUp}
        >
          <Button variant="outline" size="lg" className="h-20 flex-col" asChild>
            <Link to="/public/completed-projects">
              <Building className="h-6 w-6 mb-2" />
              Completed Projects
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-20 flex-col" asChild>
            <Link to="/public/ongoing-projects">
              <Home className="h-6 w-6 mb-2" />
              Ongoing Projects
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-20 flex-col" asChild>
            <Link to="/public/upcoming-projects">
              <Building className="h-6 w-6 mb-2" />
              Upcoming Projects
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="h-20 flex-col" asChild>
            <Link to="/public/open-plots">
              <MapPin className="h-6 w-6 mb-2" />
              Open Plots
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default FeaturedProperties;
