import axios from "axios";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface ContactInfo {
  facebook: string;
  instagram: string;
  linkedin: string;
  twitter: string;
}

const PublicFooter = () => {
  const [contact, setContact] = useState<ContactInfo>({
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
  });

  const fetchContactInfo = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/contact/contactInfo`
      );
      setContact(data.socialMedia);
    } catch (error) {
      console.log("error while fetching contact", error);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-estate-navy text-white shadow-lg">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="flex flex-col items-start">
            <div className="mb-6 w-full max-w-[180px] sm:max-w-[100px] md:max-w-[150px] transform transition-transform duration-500 hover:scale-105 cursor-pointer">
              <img
                src="/assets/images/logo.png"
                alt="EstateCorp Logo"
                className="w-full h-auto object-contain"
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6 text-sm">
              Building dreams, creating communities. Your trusted partner in
              real estate development, committed to excellence and sustainable
              living.
            </p>
            <div className="flex space-x-5">
              <a
                href={contact?.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Facebook className="h-6 w-6 text-gray-400 hover:text-estate-gold transition-colors duration-300 cursor-pointer" />
              </a>

              <a
                href={contact?.twitter}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-6 w-6 text-gray-400 hover:text-estate-gold transition-colors duration-300 cursor-pointer" />
              </a>

              <a
                href={contact?.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Instagram className="h-6 w-6 text-gray-400 hover:text-estate-gold transition-colors duration-300 cursor-pointer" />
              </a>

              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Linkedin className="h-6 w-6 text-gray-400 hover:text-estate-gold transition-colors duration-300 cursor-pointer" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-md font-vidaloka mb-6 text-estate-gold border-b-2 border-estate-gold pb-2">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/public/about"
                  className="text-gray-300 hover:text-estate-gold transition-colors duration-300 flex items-center"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Building className="h-4 w-4 mr-2" /> About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/public/upcoming-projects"
                  className="text-gray-300 hover:text-estate-gold transition-colors duration-300 flex items-center"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <MapPin className="h-4 w-4 mr-2" /> Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/public/completed-projects"
                  className="text-gray-300 hover:text-estate-gold transition-colors duration-300 flex items-center"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Building className="h-4 w-4 mr-2" /> Completed Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/public/ongoing-projects"
                  className="text-gray-300 hover:text-estate-gold transition-colors duration-300 flex items-center"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Building className="h-4 w-4 mr-2" /> Ongoing Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/public/contact"
                  className="text-gray-300 hover:text-estate-gold transition-colors duration-300 flex items-center"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Phone className="h-4 w-4 mr-2" /> Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-md font-vidaloka mb-6 text-estate-gold border-b-2 border-estate-gold pb-2">
              Our Services
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-gray-300 flex items-center">
                  <Building className="h-4 w-4 mr-2" /> Residential Development
                </span>
              </li>
              <li>
                <span className="text-gray-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" /> Plot Sales
                </span>
              </li>
              <li>
                <span className="text-gray-300 flex items-center">
                  <Building className="h-4 w-4 mr-2" /> Construction Services
                </span>
              </li>
              <li>
                <span className="text-gray-300 flex items-center">
                  <Building className="h-4 w-4 mr-2" /> Property Management
                </span>
              </li>
              <li>
                <span className="text-gray-300 flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> Investment Consultation
                </span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-md font-vidaloka mb-6 text-estate-gold border-b-2 border-estate-gold pb-2">
              Get in Touch
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 flex-shrink-0 text-estate-gold" />
                <span className="text-gray-300 text-sm">
                  123 Grand Avenue, Metropolis City, State 12345, Country
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-estate-gold" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 flex-shrink-0 text-estate-gold" />
                <span className="text-gray-300 text-sm">
                  contact@estatecorp.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} EstateCorp. All rights reserved. |{" "}
            <Link
              to="/public/privacy-policy"
              className="hover:text-estate-gold transition-colors duration-300"
            >
              Privacy Policy
            </Link>{" "}
            |{" "}
            <Link
              to="/public/terms-of-service"
              className="hover:text-estate-gold transition-colors duration-300"
            >
              Terms of Service
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
