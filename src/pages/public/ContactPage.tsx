import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  LucideIcon,
  Globe,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { easeOut, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import axios from "axios";

// --- NEW: Define a sophisticated Color Palette ---
const palette = {
  primary: "#0A2463", // Deep Navy Blue for primary elements, strong and trustworthy
  secondary: "#0E6BA8", // A slightly lighter, vibrant blue for accents
  accentGreen: "#3AB795", // A sophisticated green for success/highlight
  textDark: "#333333", // Dark gray for main text
  textLight: "#F8F8F8", // Off-white for text on dark backgrounds
  backgroundLight: "#F9FBFD", // Very light off-white background
  backgroundMid: "#EDF2F7", // A soft light gray for sections
  borderLight: "#DDE6ED", // Light gray for borders and separators
  heroOverlay: "rgba(0, 0, 0, 0.65)", // Darker overlay for hero readability
  hoverShadow: "rgba(14, 107, 168, 0.2)", // Subtle shadow color for interactive elements
};

export interface ContactInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
}

interface QuickContact {
  label: string;
  phone: string;
  icon: LucideIcon;
}

interface ContactDetails {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const [contact, setContact] = useState<ContactInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    workingHours: "",
  });

  const [details, setDetails] = useState<ContactDetails>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const fetchContactInfo = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/contact/contactInfo`
      );
      setContact(data);
    } catch (error) {
      console.log("error while fetching contact", error);
    }
  };

  useEffect(() => {
    fetchContactInfo();
    // window.scrollTo(0, 0);
  }, []);

  const offices: ContactInfo[] = [
    {
      name: "Head Office",
      address: contact.address,
      phone: contact.phone,
      email: contact.email,
      workingHours: contact.workingHours,
    },
  ];

  const quickContacts: QuickContact[] = [
    { label: "Sales Enquiry", phone: "+91 98765 43210", icon: Phone },
    {
      label: "Customer Support",
      phone: "+91 98765 43211",
      icon: MessageCircle,
    },
    { label: "Site Visit Booking", phone: "+91 98765 43212", icon: MapPin },
    { label: "Investment Guidance", phone: "+91 98765 43213", icon: Globe },
  ];

  // --- Framer Motion Variants for Scroll-Reveal ---
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: easeOut,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeOut },
    },
  };

  // --- useInView Hooks for sections ---
  const [contactInfoRef, contactInfoInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });
  const [mapRef, mapInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [faqRef, faqInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [contactFormRef, contactFormInView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);
    setDetails((preVal) => ({ ...preVal, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("details", details);
    setDetails({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <PublicLayout>
      <div
        className="min-h-screen"
        style={{ backgroundColor: palette.backgroundLight }}
      >
        {/* --- Hero Section --- */}
        <section
          className="relative text-white py-24 md:py-32 overflow-hidden"
          style={{
            backgroundImage:
              'url("https://t3.ftcdn.net/jpg/05/30/96/04/360_F_530960431_c8fPd3HansYvrSJ4fJxZqp9OhjQmYoll.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="absolute inset-0 z-0"
            style={{ backgroundColor: palette.heroOverlay }}
          />
          <motion.div
            className="relative z-10 container mx-auto px-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl md:text-5xl text-estate-gold sm:text-2xl font-md mb-6 font-['Vidaloka'] leading-tight">
              Let's Connect. Your Vision, Our Expertise.
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto font-light opacity-90 leading-relaxed">
              We're here to provide expert assistance, guidance, and
              personalized solutions for all your property needs.
            </p>
          </motion.div>
        </section>

        {/* --- Contact Information (Office & Quick Contacts) Section --- */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: palette.backgroundMid }}
        >
          <motion.div
            ref={contactInfoRef}
            className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10"
            variants={sectionVariants}
            initial="hidden"
            animate={contactInfoInView ? "visible" : "hidden"}
          >
            {/* Head Office Details */}
            <div className="lg:col-span-1">
              <h2
                className="text-3xl md:text-4xl font-md mb-8 font-['Vidaloka']"
                style={{ color: palette.primary }}
              >
                Our Office
              </h2>
              {offices.map((office, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 8px 16px ${palette.hoverShadow}`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    className="border rounded-xl h-full flex flex-col"
                    style={{
                      borderColor: palette.borderLight,
                      backgroundColor: palette.backgroundLight,
                    }}
                  >
                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3
                          className="text-2xl font-extrabold mb-4 font-['Vidaloka']"
                          style={{ color: palette.primary }}
                        >
                          {office.name}
                        </h3>
                        <div
                          className="space-y-3 text-base"
                          style={{ color: palette.textDark }}
                        >
                          <div className="flex items-start">
                            <MapPin
                              className="w-6 h-6 mt-0.5 mr-3"
                              style={{ color: palette.secondary }}
                            />
                            <span>{office.address}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone
                              className="w-6 h-6 mr-3"
                              style={{ color: palette.secondary }}
                            />
                            <a
                              href={`tel:${office.phone}`}
                              className="hover:underline"
                              style={{ color: palette.primary }}
                            >
                              {office.phone}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <Mail
                              className="w-6 h-6 mr-3"
                              style={{ color: palette.secondary }}
                            />
                            <a
                              href={`mailto:${office.email}`}
                              className="hover:underline"
                              style={{ color: palette.primary }}
                            >
                              {office.email}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <Clock
                              className="w-6 h-6 mr-3"
                              style={{ color: palette.secondary }}
                            />
                            <span>{office.workingHours}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Contact Cards */}
            <div className="lg:col-span-1">
              <h2
                className="text-3xl md:text-4xl font-md mb-8 font-['Vidaloka']"
                style={{ color: palette.primary }}
              >
                Quick Connect
              </h2>
              <div className="space-y-6">
                {quickContacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 8px 16px ${palette.hoverShadow}`,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Card
                      className="border rounded-xl cursor-pointer"
                      style={{
                        borderColor: palette.borderLight,
                        backgroundColor: palette.backgroundLight,
                      }}
                    >
                      <CardContent className="p-6 flex items-center space-x-5">
                        <div
                          className="rounded-full p-3 flex items-center justify-center"
                          style={{
                            backgroundColor: palette.secondary,
                            color: palette.textLight,
                          }}
                        >
                          <contact.icon className="h-7 w-7" />
                        </div>
                        <div>
                          <h3
                            className="font-semibold text-xl"
                            style={{ color: palette.primary }}
                          >
                            {contact.label}
                          </h3>
                          <a
                            href={`tel:${contact.phone}`}
                            className="text-lg hover:underline"
                            style={{ color: palette.secondary }}
                          >
                            {contact.phone}
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* --- Map Section --- */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: palette.backgroundLight }}
        >
          <motion.div
            ref={mapRef}
            className="container mx-auto px-4"
            variants={sectionVariants}
            initial="hidden"
            animate={mapInView ? "visible" : "hidden"}
          >
            <div className="text-center mb-12">
              <h2
                className="text-4xl md:text-5xl font-md font-['Vidaloka'] mb-4"
                style={{ color: palette.primary }}
              >
                Find Us on the Map
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
                Easily locate our offices and plan your visit.
              </p>
            </div>
            <motion.div
              className="w-full max-w-5xl mx-auto h-[450px] rounded-2xl overflow-hidden shadow-xl border"
              style={{ borderColor: palette.borderLight }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={mapInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* IMPORTANT: Replace with actual Google Maps embed or equivalent */}
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d28064.269020139593!2d77.02477192771046!3d28.44840267611705!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1s123%20Business%20District%2C%20Corporate%20Tower%2C%2015th%20Floor%2C%20Gurgaon%2C%20Haryana%20122001!5e0!3m2!1sen!2sin!4v1750069137119!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Office Locations Map"
              ></iframe>
            </motion.div>
          </motion.div>
        </section>

        {/* --- Generic Contact Form Section --- */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: palette.backgroundMid }}
        >
          <motion.div
            ref={contactFormRef}
            className="container mx-auto px-4 max-w-3xl"
            variants={sectionVariants}
            initial="hidden"
            animate={contactFormInView ? "visible" : "hidden"}
          >
            <div className="text-center mb-12">
              <h2
                className="text-4xl md:text-5xl font-md font-['Vidaloka'] mb-4"
                style={{ color: palette.primary }}
              >
                Get in Touch
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
                Have a question or need assistance? Fill out the form below, and
                we'll get back to you shortly.
              </p>
            </div>
            <motion.div
              variants={itemVariants}
              className="bg-white p-8 md:p-10 rounded-xl shadow-lg border"
              style={{ borderColor: palette.borderLight }}
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium"
                    style={{ color: palette.textDark }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    style={{
                      borderColor: palette.borderLight,
                      backgroundColor: palette.backgroundLight,
                      color: palette.textDark,
                    }}
                    placeholder="John Doe"
                    onChange={handleChange}
                    value={details.name}
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium"
                    style={{ color: palette.textDark }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    style={{
                      borderColor: palette.borderLight,
                      backgroundColor: palette.backgroundLight,
                      color: palette.textDark,
                    }}
                    placeholder="john.doe@example.com"
                    onChange={handleChange}
                    value={details.email}
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium"
                    style={{ color: palette.textDark }}
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    style={{
                      borderColor: palette.borderLight,
                      backgroundColor: palette.backgroundLight,
                      color: palette.textDark,
                    }}
                    placeholder="Regarding a property inquiry..."
                    onChange={handleChange}
                    value={details.subject}
                  />
                </div>
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium"
                    style={{ color: palette.textDark }}
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="mt-1 block w-full px-4 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    style={{
                      borderColor: palette.borderLight,
                      backgroundColor: palette.backgroundLight,
                      color: palette.textDark,
                    }}
                    placeholder="Type your message here..."
                    onChange={handleChange}
                    value={details.message}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-md text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105"
                  style={{
                    backgroundColor: palette.primary,
                    color: palette.textLight,
                    boxShadow: `0 4px 12px ${palette.hoverShadow}`,
                  }}
                >
                  Send Message
                </button>
              </form>
            </motion.div>
          </motion.div>
        </section>

        {/* --- FAQ Section --- */}
        <section
          className="py-16 md:py-24"
          style={{ backgroundColor: palette.backgroundLight }}
        >
          <motion.div
            ref={faqRef}
            className="container mx-auto px-4"
            variants={sectionVariants}
            initial="hidden"
            animate={faqInView ? "visible" : "hidden"}
          >
            <div className="text-center mb-12">
              <h2
                className="text-4xl md:text-5xl font-md mb-4 font-['Vidaloka']"
                style={{ color: palette.primary }}
              >
                Frequently Asked Questions
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto font-light">
                Quick answers to common queries about our services and
                properties.
              </p>
            </div>
            <motion.div
              className="max-w-3xl mx-auto space-y-6"
              variants={sectionVariants}
              initial="hidden"
              animate={faqInView ? "visible" : "hidden"}
            >
              {[
                {
                  question: "What are your office hours?",
                  answer:
                    "Our offices are open Monday to Friday from 9:00 AM to 7:00 PM, and Saturday from 9:00 AM to 5:00 PM. Sunday visits are by appointment only to ensure we can provide dedicated attention.",
                },
                {
                  question: "How can I schedule a site visit?",
                  answer:
                    "You can easily schedule a site visit by calling our dedicated site visit booking number, filling out the enquiry form directly on this page, or visiting any of our office locations. We're happy to arrange complimentary transportation for your convenience.",
                },
                {
                  question: "Do you provide home loan assistance?",
                  answer:
                    "Absolutely! We have strong partnerships with leading banks and financial institutions to streamline your home loan process. Our experienced team will assist you with documentation, application submission, and securing competitive interest rates tailored to your needs.",
                },
                {
                  question: "What types of properties do you specialize in?",
                  answer:
                    "We specialize in a diverse portfolio of premium residential and commercial properties, including luxury apartments, independent villas, plotted developments, and high-yield commercial spaces across key metropolitan areas.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    boxShadow: `0 4px 10px ${palette.hoverShadow}`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Card
                    className="border rounded-xl"
                    style={{
                      borderColor: palette.borderLight,
                      backgroundColor: palette.backgroundLight,
                    }}
                  >
                    <CardContent className="p-6">
                      <details className="group">
                        <summary
                          className="font-semibold cursor-pointer text-xl"
                          style={{ color: palette.primary }}
                        >
                          {item.question}
                          <span className="ml-auto transition-transform group-open:rotate-90">
                            <MessageCircle
                              className="inline-block h-6 w-6 ml-2"
                              style={{ color: palette.secondary }}
                            />
                          </span>
                        </summary>
                        <p
                          className="mt-3 text-base leading-relaxed"
                          style={{ color: palette.textDark }}
                        >
                          {item.answer}
                        </p>
                      </details>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>
      </div>
    </PublicLayout>
  );
};

export default ContactPage;
