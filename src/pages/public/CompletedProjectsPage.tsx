import PublicLayout from "@/components/layout/PublicLayout";
import PropertyListingCard from "@/components/public/PropertyListingCard";
import {
  CheckCircle,
  Users,
  Calendar,
  Award,
  Home,
  Star,
  Trophy,
  Smile,
} from "lucide-react";
import { motion } from "framer-motion";

const CompletedProjectsPage = () => {
  const completedProjects = [
    {
      id: 1,
      title: "Green Valley Residences",
      location: "Sector 45, Gurgaon",
      type: "Completed",
      category: "Villa",
      price: "₹85 Lakhs onwards",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["3-4 BHK", "Swimming Pool", "Clubhouse", "24/7 Security"],
      description:
        "Luxury villa project with modern amenities and beautiful landscaping. Completed in 2023.",
    },
    {
      id: 4,
      title: "Metro Heights",
      location: "Whitefield, Bangalore",
      type: "Completed",
      category: "Apartment",
      price: "₹75 Lakhs onwards",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["2-3 BHK", "Metro Connectivity", "Shopping Complex", "School"],
      description:
        "Premium apartments with excellent metro connectivity. Handed over in 2022.",
    },
    {
      id: 5,
      title: "Coastal Breeze",
      location: "Bandra West, Mumbai",
      type: "Completed",
      category: "Villa",
      price: "₹2.5 Crores onwards",
      image:
        "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["4-5 BHK", "Sea View", "Private Pool", "Concierge"],
      description:
        "Luxury sea-facing villas with premium amenities. Completed in 2023.",
    },
  ];

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
        <section className="py-20 bg-white">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {completedProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6,
                    ease: "easeOut",
                  }}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
                  }}
                >
                  <PropertyListingCard property={project} />
                </motion.div>
              ))}
            </div>
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
