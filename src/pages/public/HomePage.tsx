import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Building, MapPin, ArrowRight, Phone, Mail, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import HeroSection from "@/components/public/HeroSection";
import AboutSection from "@/components/public/AboutSection";
import FeaturedProperties from "@/components/public/FeaturedProperties";
import ModernEnquiryForm from "./EnquiryForm";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <PublicLayout>
      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* About Us Section */}
        <AboutSection />

        {/* Featured Properties */}
        <FeaturedProperties />

        {/* Call to Action Section */}
        <section className="py-16 bg-estate-navy text-white transition-colors duration-300">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl text-estate-gold font-vidaloka mb-4 transition-colors duration-300 hover:text-white">
              Ready to Find Your Dream Property?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Get in touch with our expert team for personalized assistance
            </p>

            <div className="flex justify-center gap-4 sm:flex-row flex-col sm:w-full w-[80%] mx-auto">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="transition-colors duration-300 hover:bg-estate-gold hover:text-estate-navy"
              >
                <Link to="/public/upcoming-projects">
                  View Upcoming Properties
                </Link>
              </Button>

              {/* Outline button with gold hover accent */}
              <Button
                size="lg"
                variant="outline"
                className="text-estate-navy  border-white transition-colors duration-300 hover:bg-estate-gold hover:border-estate-gold hover:text-estate-navy"
                onClick={() => navigate("/public/contact")}
              >
                <Phone className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Enquiry Form */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="md:max-w-[80%] mx-w-[90%] mx-auto">
              <div className="text-center mb-5">
                <h2 className="text-3xl font-md font-vidaloka mb-4">
                  Quick Enquiry
                </h2>
                <p className="text-gray-600">
                  Leave your details and we'll get back to you within 24 hours
                </p>
              </div>
              <ModernEnquiryForm />
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default HomePage;
