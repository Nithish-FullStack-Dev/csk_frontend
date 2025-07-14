import PublicLayout from "@/components/layout/PublicLayout";
import AboutSection from "@/components/public/AboutSection";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target,
  Eye,
  Gem,
  Users,
  Lightbulb,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import { easeOut, motion } from "framer-motion";
import clsx from "clsx";
import { AnimatedTestimonials } from "@/components/ui/AnimatedTestimonials";
import { useEffect } from "react";
import { Link } from "react-router-dom";

const PublicAboutPage = () => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: easeOut,
      },
    },
  };

  const team = [
    {
      name: "R. Sai Kumar Reddy",
      role: "Founder & CEO",
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      bio: "A visionary leader with over 20 years of transformative experience in real estate development and strategic management.",
    },
    {
      name: "Divya Prakash Singh",
      role: "Chief Operating Officer",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      bio: "Drives operational excellence and project delivery with a focus on efficiency and customer satisfaction.",
    },
    {
      name: "Sandeep Rao",
      role: "Head of Sales & Marketing",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
      bio: "Leads market strategy and client engagement, bringing properties to life for discerning buyers.",
    },
    {
      name: "Priya Sharma",
      role: "Head of Customer Relations",
      image:
        "https://www.perfocal.com/blog/content/images/2021/01/Perfocal_17-11-2019_TYWFAQ_100_standard-3.jpg",
      bio: "Dedicated to ensuring a seamless and positive experience for every CSK client, from inquiry to handover.",
    },
  ];

  /*  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
 */
  const testimonials = team.map((member) => ({
    name: member.name,
    designation: member.role,
    quote: member.bio,
    src: member.image,
  }));

  const TestimonialsSection = () => (
    <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
  );

  return (
    <PublicLayout>
      <div className="min-h-screen">
        <section
          className="relative overflow-hidden text-white py-28 md:py-36"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1592595896551-12b371d546d5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHJlYWwlMjBlc3RhdGV8ZW58MHx8MHx8fDA%3D')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
          <div className="absolute inset-0 z-0 opacity-10">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
            >
              <pattern
                id="pattern-zigzag"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 0 5 L 5 0 L 10 5 L 5 10 Z"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="0.5"
                  fill="none"
                />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern-zigzag)" />
            </svg>
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                variants={itemVariants}
                className="text-5xl md:text-7xl font-md font-vidaloka mb-6 leading-tight tracking-tight drop-shadow-lg"
              >
                Discover Our Story
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90 leading-relaxed"
              >
                At CSK Realtors, we're not just building structures; we're
                crafting futures and cultivating communities with passion and
                precision.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <AboutSection />

        <section className="py-11 md:py-12 bg-yellow-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-md font-vidaloka text-gray-800 mb-4 leading-tight">
                Meet Our Visionary Leadership
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Guided by experience and innovation, our leadership team is
                dedicated to shaping the future of real estate.
              </p>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <TestimonialsSection />
            </motion.div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-gradient-to-br from-[#101F3C] to-[#2A4D6F] text-white relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-10">
            <svg
              className="w-full h-full"
              fill="none"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid slice"
            >
              <pattern
                id="pattern-dots"
                x="0"
                y="0"
                width="10"
                height="10"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#pattern-dots)" />
            </svg>
          </div>
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: easeOut }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-4xl md:text-5xl font-md font-vidaloka mb-6 text-estate-gold leading-tight drop-shadow-lg"
            >
              Ready to Begin Your Real Estate Journey?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: easeOut }}
              viewport={{ once: true, amount: 0.5 }}
              className="text-xl md:text-2xl max-w-4xl mx-auto mb-10 opacity-90"
            >
              Connect with our experts today and discover properties that align
              with your vision and investment goals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: easeOut }}
              viewport={{ once: true, amount: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-5"
            >
              <Link
                to="/public/contact"
                className="bg-estate-gold hover:bg-[#D4A300] text-[#101F3C] px-10 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Contact Our Team
              </Link>
              <Link
                to="/public/upcoming-projects"
                className="border-2 border-white text-white hover:bg-white hover:text-[#101F3C] px-10 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Explore Properties
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default PublicAboutPage;
