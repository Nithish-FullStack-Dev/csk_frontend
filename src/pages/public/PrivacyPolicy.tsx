import PublicLayout from "@/components/layout/PublicLayout";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Database, FileText, Eye, Mail } from "lucide-react";

const policySections = [
  {
    icon: Database,
    title: "Information We Collect",
    content:
      "We may collect your name, phone number, email address, preferred property details, budget requirements, location preferences, and any information you voluntarily provide through enquiry forms, bookings, calls, emails, or customer support interactions.",
  },
  {
    icon: FileText,
    title: "How We Use Your Information",
    content:
      "Your information is used to respond to enquiries, arrange site visits, share project details, process bookings, improve customer support, communicate offers, maintain internal records, and comply with legal or regulatory obligations.",
  },
  {
    icon: Eye,
    title: "Information Sharing",
    content:
      "CSK Realtors does not sell personal information. Data may be shared only with authorized employees, channel partners, legal advisors, technology providers, banks, payment processors, or government authorities where required for legitimate business or legal purposes.",
  },
  {
    icon: Lock,
    title: "Data Protection & Security",
    content:
      "We implement reasonable administrative, technical, and operational safeguards to protect your data from unauthorized access, misuse, disclosure, alteration, or destruction. However, no online platform can guarantee absolute security.",
  },
  {
    icon: ShieldCheck,
    title: "Your Rights",
    content:
      "You may request correction, update, or deletion of personal information, subject to legal and contractual obligations. You may also opt out of marketing communications at any time.",
  },
  {
    icon: Mail,
    title: "Contact & Queries",
    content:
      "For any privacy-related requests, corrections, or concerns, please contact CSK Realtors through the official contact details published on our website.",
  },
];

const PrivacyPolicy = () => {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-24 md:py-32"
        style={{
          backgroundImage: 'url("/assets/images/private.jpg")',
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
            Privacy Policy
          </h1>

          <p className="max-w-3xl mx-auto text-base md:text-xl text-gray-200 leading-8">
            We respect your privacy and are committed to protecting the personal
            information you share with us. This page explains how CSK Realtors
            collects, uses, stores, and safeguards your data.
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
                <li>• We collect only relevant customer information.</li>
                <li>• We never sell your personal data.</li>
                <li>• Data is used for service and communication purposes.</li>
                <li>• Reasonable security measures are implemented.</li>
                <li>• You may request updates or corrections.</li>
              </ul>

              <div className="mt-8 pt-6 border-t text-sm text-gray-500">
                Effective Date: April 29, 2026
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-8 space-y-6">
            {policySections.map((item, index) => {
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

            {/* Additional Legal Text */}
            <div className="bg-gradient-to-r from-estate-gold/10 to-transparent rounded-3xl border border-estate-gold/20 p-8 mt-4">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Policy Updates
              </h3>

              <p className="text-gray-700 leading-8">
                CSK Realtors may revise this Privacy Policy periodically to
                reflect operational, legal, or regulatory updates. Revised
                versions will be published on this page. Continued use of our
                website or services after updates constitutes acceptance of the
                revised policy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default PrivacyPolicy;
