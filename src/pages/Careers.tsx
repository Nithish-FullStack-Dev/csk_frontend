import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";

const jobOpenings = [
  {
    id: 1,
    title: "Sales Executive",
    location: "Hyderabad",
    type: "Full-time",
    description:
      "Drive property sales, manage client relationships, and achieve monthly targets.",
  },
  {
    id: 2,
    title: "Site Engineer",
    location: "Bangalore",
    type: "Full-time",
    description:
      "Oversee construction activities, ensure quality standards, and coordinate with contractors.",
  },
  {
    id: 3,
    title: "Marketing Manager",
    location: "Remote",
    type: "Full-time",
    description:
      "Plan and execute marketing campaigns, lead generation, and brand building.",
  },
];

export default function Careers() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here (e.g., send data to backend)
    alert("Application submitted!");
    setSelectedJob(null);
    setDialogOpen(false);
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* HERO SECTION */}
        <div
          className="relative h-[420px] flex items-center justify-center text-center text-white"
          style={{
            backgroundImage: "url('/assets/images/career.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 px-6">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Build Your Career With Us
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-200">
              Join our premium real estate team and grow with a company that
              values excellence, trust, and innovation.
            </p>
          </div>
        </div>

        {/* WHY JOIN */}
        <div className="max-w-6xl mx-auto py-14 px-6">
          <h2 className="text-3xl font-semibold text-center mb-10 text-estate-navy">
            Why Join Us
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Growth Opportunities",
                desc: "Structured career paths with continuous learning.",
              },
              {
                title: "Elite Work Culture",
                desc: "Professional, fast-paced, and collaborative environment.",
              },
              {
                title: "High Incentives",
                desc: "Performance-driven rewards and recognition.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl shadow hover:shadow-lg border-t-4 border-estate-gold"
              >
                <h3 className="font-semibold text-lg mb-2 text-estate-navy">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* JOB LISTINGS */}
        <div className="bg-white py-14 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-10 text-estate-navy">
              Current Openings
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {jobOpenings.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-2xl p-6 shadow hover:shadow-xl transition bg-gray-50"
                >
                  <h3 className="text-xl font-semibold mb-2 text-estate-navy">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {job.location} • {job.type}
                  </p>
                  <p className="text-gray-600 mb-4 text-sm">
                    {job.description}
                  </p>

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setDialogOpen(true);
                    }}
                    className="bg-estate-navy text-white px-5 py-2 rounded-lg hover:bg-[#142a52] transition"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* APPLY MODAL */}
        {selectedJob && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold mb-4 text-estate-navy">
                    Apply for {selectedJob.title}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600">
                    Please fill out the form below to apply for this position.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input
                      type="text"
                      placeholder="Full Name"
                      className="w-full border p-2 rounded"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      className="w-full border p-2 rounded"
                    />
                    <Input
                      type="tel"
                      placeholder="Phone"
                      className="w-full border p-2 rounded"
                    />
                    <Input type="file" className="w-full border p-2 rounded" />

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setSelectedJob(null)}
                        className="px-4 py-2 border rounded"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        type="submit"
                        className="px-4 py-2 rounded hover:opacity-90"
                      >
                        Submit
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* FOOTER CTA */}
        <div className="text-white py-12 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-estate-navy">
            Didn’t find a suitable role?
          </h2>
          <p className="mb-4 text-black">
            Send your resume to careers@yourcompany.com
          </p>
          <button className="bg-estate-navy text-white px-6 py-2 rounded-lg">
            Contact HR
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
