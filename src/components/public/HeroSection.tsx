import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button"; // Assuming Shadcn UI Button
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"; // Icons for CTAs and navigation
import { Link } from "react-router-dom"; // For internal routing
import { motion, AnimatePresence, spring } from "framer-motion"; // For animations

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null); // Ref to store the timer ID

  const slides = [
    {
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Your Grand Dream Home Awaits",
      subtitle:
        "Step into a world of bespoke luxury and unparalleled comfort in our exclusive residential developments.",
      cta: "Explore Residences",
      link: "/public", // Added explicit link for CTA
    },
    {
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Strategic Plot Investments",
      subtitle:
        "Secure your future with meticulously planned and strategically located residential plots, primed for growth.",
      cta: "Discover Plots",
      link: "/public", // Example link for plots
    },
    {
      image:
        "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
      title: "Building Beyond Expectations",
      subtitle:
        "Our commitment to superior craftsmanship and architectural integrity ensures enduring quality in every structure.",
      cta: "View Our Expertise",
      link: "/public", // Example link for projects
    },
  ];

  // Framer Motion variants for content animation
  const contentVariants = {
    hidden: { opacity: 0, y: 80, scale: 0.95 }, // Start further down, slightly smaller
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: spring, // Use spring for a subtle bounce
        damping: 15,
        stiffness: 100,
        mass: 0.8,
        staggerChildren: 0.15, // Faster stagger
        when: "beforeChildren",
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: spring,
        damping: 15,
        stiffness: 100,
        mass: 0.8,
      },
    },
  };

  // Autoplay functionality
  useEffect(() => {
    const startTimer = () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
      autoSlideTimerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 7000); // Increased interval to 7 seconds for better readability
    };

    startTimer(); // Start timer on component mount

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current); // Clear on unmount
      }
    };
  }, [slides.length]);

  /* useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
 */
  // Handle slide change (manual or auto) and reset timer
  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
    // Re-start timer after a brief delay if a manual change
    autoSlideTimerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % slides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image Carousel */}
      <AnimatePresence initial={false}>
        {slides.map(
          (slide, index) =>
            index === currentSlide && (
              <motion.div
                initial={{ opacity: 0, scale: 1.05 }} // Start slightly zoomed in
                animate={{ opacity: 1, scale: 1 }} // Zoom out slightly to create subtle motion
                exit={{ opacity: 0, scale: 0.95 }} // Zoom in slightly on exit
                transition={{ duration: 1.5, ease: "easeInOut" }} // Longer, smoother transition
                className="absolute inset-0 z-0"
                key={index}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center" // Ensure image covers well
                />
                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
              </motion.div>
            )
        )}
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
        {/* AnimatePresence for content ensures old content fades out as new content fades in */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide} // Key change ensures animation on slide change
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="hidden" // Exit animation for content
            className="max-w-4xl mx-auto text-white text-center px-4 md:px-8" // Increased max-width and padding
          >
            <motion.h1
              variants={childVariants}
              className="text-5xl sm:text-6xl md:text-7xl font-md font-vidaloka leading-tight mb-5 tracking-tight drop-shadow-2xl" // Bolder, larger, tighter tracking, stronger shadow
            >
              {slides[currentSlide].title}
            </motion.h1>

            <motion.p
              variants={childVariants}
              className="text-lg sm:text-xl md:text-2xl mb-10 opacity-90 leading-relaxed max-w-2xl mx-auto" // Increased line height, slightly softer text
            >
              {slides[currentSlide].subtitle}
            </motion.p>

            <motion.div
              variants={childVariants}
              className="flex justify-center flex-wrap gap-4 md:gap-6" // More space between buttons
            >
              <Button
                size="lg"
                className="
                  bg-estate-gold text-estate-navy text-base md:text-lg font-semibold px-8 py-3 md:px-10 md:py-4 rounded-full
                  shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                  border-2 border-transparent hover:border-estate-gold focus:outline-none focus:ring-2 focus:ring-estate-gold focus:ring-offset-2
                "
                asChild
              >
                <Link to={slides[currentSlide].link}>
                  {slides[currentSlide].cta}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="
                  border-2 border-white text-white text-base md:text-lg font-semibold px-8 py-3 md:px-10 md:py-4 rounded-full
                  bg-transparent hover:bg-white hover:text-estate-navy shadow-lg hover:shadow-xl
                  transition-all duration-300 transform hover:-translate-y-1 hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
                "
                asChild
              >
                <Link to="/public/contact">Contact Us</Link>
              </Button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="Previous slide"
        className="
          absolute left-4 top-1/2 transform -translate-y-1/2 z-20
          bg-white/10 backdrop-blur-md text-white p-3 md:p-4 rounded-full
          hover:bg-white/20 transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
        "
      >
        <ChevronLeft className="h-7 w-7 md:h-8 md:w-8" /> {/* Larger icons */}
      </button>
      <button
        onClick={nextSlide}
        aria-label="Next slide"
        className="
          absolute right-4 top-1/2 transform -translate-y-1/2 z-20
          bg-white/10 backdrop-blur-md text-white p-3 md:p-4 rounded-full
          hover:bg-white/20 transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2
        "
      >
        <ChevronRight className="h-7 w-7 md:h-8 md:w-8" /> {/* Larger icons */}
      </button>

      {/* Slide Indicators (Dots) */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
        {" "}
        {/* Increased gap */}
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
            className={`
              w-3 h-3 md:w-4 md:h-4 rounded-full transition-all duration-300
              ${
                index === currentSlide
                  ? "bg-estate-gold scale-125"
                  : "bg-white/60 hover:bg-white"
              }
              focus:outline-none focus:ring-2 focus:ring-estate-gold focus:ring-offset-2
            `} // Highlight active dot with brand color and scale
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
