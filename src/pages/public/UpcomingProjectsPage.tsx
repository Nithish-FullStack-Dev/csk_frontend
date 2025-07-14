import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Star, Bell, Gift, Users } from "lucide-react";
import EnquiryForm from "@/components/public/EnquiryForm";
import { motion } from "framer-motion";
import "../../shine.css";

const UpcomingProjectsPage = () => {
  const upcomingProjects = [
    {
      id: 8,
      title: "Infinity Towers",
      location: "Sector 150, Noida",
      launchDate: "March 2024",
      category: "Apartment",
      expectedPrice: "₹45 Lakhs onwards",
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["1-3 BHK", "Rooftop Pool", "Sky Lounge", "Smart Homes"],
      description:
        "Ultra-modern apartments with smart home technology and premium amenities.",
      preBooking: true,
    },
    {
      id: 9,
      title: "Emerald Greens",
      location: "Sarjapur Road, Bangalore",
      launchDate: "June 2024",
      category: "Villa",
      expectedPrice: "₹95 Lakhs onwards",
      image:
        "https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["3-4 BHK", "Golf Course", "Private Pool", "Helipad"],
      description:
        "Luxury villas adjacent to golf course with world-class amenities.",
      preBooking: true,
    },
    {
      id: 10,
      title: "Coastal Paradise",
      location: "ECR, Chennai",
      launchDate: "September 2024",
      category: "Apartment",
      expectedPrice: "₹65 Lakhs onwards",
      image:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      features: ["2-3 BHK", "Beach Access", "Infinity Pool", "Spa"],
      description:
        "Beachfront apartments with direct beach access and resort-style amenities.",
      preBooking: false,
    },
  ];

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
              Upcoming Real Estate Projects
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
              <h2 className="text-3xl font-md font-vidaloka text-red-600 mb-2">
                Coming Soon!
              </h2>
              <p className="text-gray-600">
                Discover our upcoming developments
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingProjects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden hover:shadow-xl transition-all rounded-xl"
                >
                  <div className="relative shine-effect">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-52 object-cover brightness-75"
                    />
                    <Badge className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 z-10">
                      Coming Soon
                    </Badge>
                    {project.preBooking && (
                      <Badge className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 z-10">
                        Pre-Booking Open
                      </Badge>
                    )}
                    <div className="absolute bottom-4 left-4 z-10 text-white">
                      <h3 className="text-lg font-semibold">{project.title}</h3>
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 mr-1 text-gray-300" />
                        {project.location}
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm text-gray-600">
                        Launch: {project.launchDate}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="mb-3">
                      {project.features.slice(0, 2).map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-block bg-gray-100 text-xs px-2 py-1 rounded-full mr-2 text-gray-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="text-lg font-bold text-indigo-700 mb-3">
                      {project.expectedPrice}
                    </div>
                    {project.preBooking ? (
                      <Button className="w-full bg-green-600 hover:bg-green-700 rounded-full">
                        Register Interest
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full text-blue-600 hover:bg-blue-100 rounded-full"
                      >
                        Get Notified
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Enquiry Form */}
        <section className="py-20 bg-gray-100">
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
