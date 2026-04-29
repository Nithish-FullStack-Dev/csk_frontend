import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import {
  FileCheck,
  Shield,
  AlertTriangle,
  Scale,
  Ban,
  Mail,
} from "lucide-react";

const termsSections = [
  {
    icon: FileCheck,
    title: "Acceptance of Terms",
    content:
      "By accessing or using the CSK Realtors website, enquiry forms, project pages, or services, you agree to comply with these Terms of Service and all applicable laws and regulations. If you do not agree, please discontinue use of the website.",
  },
  {
    icon: Shield,
    title: "Use of Website",
    content:
      "You agree to use this website only for lawful purposes, including property enquiries, project information, bookings, and legitimate communication with CSK Realtors. Unauthorized use, misuse, scraping, spamming, or fraudulent activity is strictly prohibited.",
  },
  {
    icon: AlertTriangle,
    title: "Project Information Disclaimer",
    content:
      "All project details, brochures, floor plans, prices, approvals, amenities, timelines, and availability shown on this website are indicative and subject to revision without prior notice. Final terms shall be governed by official agreements and applicable approvals.",
  },
  {
    icon: Scale,
    title: "Intellectual Property",
    content:
      "All website content including logos, branding, text, designs, layouts, brochures, images, videos, and marketing materials are the property of CSK Realtors or its licensors. Unauthorized copying, reproduction, or commercial use is prohibited.",
  },
  {
    icon: Ban,
    title: "Limitation of Liability",
    content:
      "CSK Realtors shall not be liable for any direct, indirect, incidental, or consequential loss arising from use of this website, temporary downtime, technical errors, third-party links, reliance on indicative information, or inability to access services.",
  },
  {
    icon: Mail,
    title: "Contact & Support",
    content:
      "For any questions relating to these Terms of Service, bookings, documentation, or official clarifications, please contact CSK Realtors through the official contact channels listed on the website.",
  },
];

const TermsOfService = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{
          backgroundImage: 'url("/assets/images/terms.jpg")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white"
        >
          <p className="uppercase tracking-[4px] text-sm text-estate-gold mb-4">
            CSK Realtors
          </p>

          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6 font-['Vidaloka']">
            Terms of Service
          </h1>

          <p className="max-w-3xl mx-auto text-base md:text-xl text-gray-200 leading-8">
            These Terms of Service govern your access to and use of the CSK
            Realtors website, digital platforms, enquiries, and related
            services. Please review them carefully before using our website.
          </p>
        </motion.div>
      </section>

      {/* Main Section */}
      <section className="bg-slate-50 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid lg:grid-cols-12 gap-10">
          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-5">
                Quick Summary
              </h3>

              <ul className="space-y-4 text-gray-600 leading-7 text-sm md:text-base">
                <li>• Use the website only for lawful purposes.</li>
                <li>• Project details may change without notice.</li>
                <li>• Website content is legally protected.</li>
                <li>• Unauthorized misuse is prohibited.</li>
                <li>• Official agreements override website content.</li>
              </ul>

              <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                Effective Date: April 29, 2026
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 space-y-6">
            {termsSections.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-3xl shadow-md border border-gray-100 p-7 md:p-8 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-estate-gold/10 flex items-center justify-center shrink-0">
                      <Icon className="h-6 w-6 text-estate-gold" />
                    </div>

                    <div>
                      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
                        {item.title}
                      </h2>

                      <p className="text-gray-600 leading-8">{item.content}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Additional Section */}
            <div className="bg-gradient-to-r from-estate-gold/10 to-transparent rounded-3xl border border-estate-gold/20 p-8 mt-4">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Modifications to Terms
              </h3>

              <p className="text-gray-700 leading-8">
                CSK Realtors reserves the right to update or revise these Terms
                of Service at any time to reflect business, operational, or
                legal changes. Updated versions will be published on this page.
                Continued use of the website after updates constitutes your
                acceptance of the revised terms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default TermsOfService;
