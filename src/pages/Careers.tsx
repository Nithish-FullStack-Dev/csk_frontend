import PublicLayout from "@/components/layout/PublicLayout";
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white py-16 px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Careers at Our Company</h1>
          <p className="max-w-2xl mx-auto text-lg">
            Join our growing real estate team and build a rewarding career. We
            value passion, innovation, and commitment.
          </p>
        </div>

        {/* Why Join Us */}
        <div className="max-w-6xl mx-auto py-12 px-6">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Why Join Us?
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold text-lg mb-2">
                Growth Opportunities
              </h3>
              <p className="text-sm text-gray-600">
                We provide continuous learning and career advancement
                opportunities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold text-lg mb-2">
                Dynamic Work Culture
              </h3>
              <p className="text-sm text-gray-600">
                Work in a collaborative and fast-paced real estate environment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold text-lg mb-2">
                Attractive Incentives
              </h3>
              <p className="text-sm text-gray-600">
                Competitive salary with performance-based incentives.
              </p>
            </div>
          </div>
        </div>

        {/* Job Listings */}
        <div className="bg-white py-12 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">
              Current Openings
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {jobOpenings.map((job) => (
                <div
                  key={job.id}
                  className="border rounded-2xl p-6 shadow hover:shadow-lg transition"
                >
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {job.location} • {job.type}
                  </p>
                  <p className="text-gray-600 mb-4 text-sm">
                    {job.description}
                  </p>
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {selectedJob && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                Apply for {selectedJob.title}
              </h3>

              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border p-2 rounded"
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 rounded"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  className="w-full border p-2 rounded"
                />
                <input type="file" className="w-full border p-2 rounded" />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Footer CTA */}
        <div className="bg-blue-900 text-white py-10 text-center">
          <h2 className="text-2xl font-semibold mb-2">
            Didn’t find a suitable role?
          </h2>
          <p className="mb-4">Send your resume to careers@yourcompany.com</p>
          <button className="bg-white text-blue-900 px-6 py-2 rounded-lg">
            Contact HR
          </button>
        </div>
      </div>
    </PublicLayout>
  );
}
