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
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Loader2,
  MapPin,
  Briefcase,
  Clock,
  IndianRupee,
  ChevronRight,
} from "lucide-react";
import RenderRichText from "@/components/common/editor/Render";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const fetchJobs = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/job-posts/getJobPosts`,
    { withCredentials: true },
  );
  return res.data;
};

export default function Careers() {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    resume: null as File | null,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicJobPosts"],
    queryFn: fetchJobs,
  });

  const applyMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/job-applications/applyJob`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return res.data;
    },

    onSuccess: (data: any) => {
      toast.success(data.message || "Application submitted successfully!");
      setIsApplyOpen(false);

      setForm({
        name: "",
        email: "",
        phone: "",
        resume: null,
      });
    },

    onError: (error: any) => {
      console.error(error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : error?.message || "Failed to submit application. Please try again.",
      );
    },
  });

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("jobId", selectedJob?._id);
    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("phone", form.phone);

    if (form.resume) {
      formData.append("resume", form.resume);
    }

    applyMutation.mutate(formData);
  };

  const jobOpenings = data?.data || [];

  const getExpiryText = (expiresAt: string) => {
    if (!expiresAt) return "No expiry";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiresAt);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires Today";
    return `Expires in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
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
        <div className="bg-white py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-semibold text-center mb-10 text-estate-navy">
              Current Openings
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-estate-navy" />
              </div>
            ) : isError ? (
              <div className="text-center py-10 text-red-500">
                Failed to load jobs.
              </div>
            ) : jobOpenings.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No open positions at the moment.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {jobOpenings.map((job: any) => (
                  <div
                    key={job._id}
                    className="group border rounded-2xl p-6 shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-estate-navy">
                          {job.title}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="bg-estate-gold/10 text-estate-gold border-none"
                        >
                          {job.jobType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" /> {job.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mb-3">
                        <span
                          className={`px-2 py-1 rounded-full font-medium ${
                            getExpiryText(job.expiresAt) === "Expired"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {getExpiryText(job.expiresAt)}
                        </span>
                      </div>
                      <div className="text-gray-600 mb-6 text-sm line-clamp-2">
                        <RenderRichText html={job.overview} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsDetailsOpen(true);
                        }}
                        variant="outline"
                        className="flex-1"
                      >
                        View Details
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedJob(job);
                          setIsApplyOpen(true);
                        }}
                        className="flex-1 bg-estate-navy hover:bg-[#142a52]"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* VIEW DETAILS DIALOG */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 border-b bg-gray-50/50">
              <div className="flex flex-col gap-2">
                <DialogTitle className="text-2xl font-bold text-estate-navy">
                  {selectedJob?.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {selectedJob?.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> {selectedJob?.workMode}
                  </span>
                  <span className="flex items-center gap-1 text-estate-gold font-semibold">
                    <IndianRupee className="h-4 w-4" />{" "}
                    {selectedJob?.salaryRange?.min} -{" "}
                    {selectedJob?.salaryRange?.max}
                  </span>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 p-6">
              <div className="space-y-8">
                <section>
                  <h4 className="text-lg font-semibold text-estate-navy mb-3">
                    Role Overview
                  </h4>
                  <div className="text-gray-600 leading-relaxed">
                    <RenderRichText html={selectedJob?.overview || ""} />
                  </div>
                </section>

                <section>
                  <h4 className="text-lg font-semibold text-estate-navy mb-3">
                    Detailed Description
                  </h4>
                  <div className="text-gray-600 leading-relaxed">
                    <RenderRichText html={selectedJob?.description || ""} />
                  </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                  {selectedJob?.responsibilities && (
                    <section>
                      <h4 className="text-lg font-semibold text-estate-navy mb-3">
                        Key Responsibilities
                      </h4>
                      <div className="text-gray-600 leading-relaxed">
                        <RenderRichText
                          html={selectedJob?.responsibilities || ""}
                        />
                      </div>
                    </section>
                  )}

                  {selectedJob?.requirements && (
                    <section>
                      <h4 className="text-lg font-semibold text-estate-navy mb-3">
                        Requirements
                      </h4>
                      <div className="text-gray-600 leading-relaxed">
                        <RenderRichText
                          html={selectedJob?.requirements || ""}
                        />
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsDetailsOpen(false);
                  setIsApplyOpen(true);
                }}
                className="bg-estate-navy"
              >
                Apply for this Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* APPLY MODAL */}
        <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-estate-navy">
                Apply for {selectedJob?.title}
              </DialogTitle>
              <DialogDescription>
                Attach your resume and fill in your contact details.
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleApplySubmit}>
              <Input
                type="text"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <Input
                type="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <Input
                type="tel"
                placeholder="Phone Number"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resume (PDF)
                </label>
                <Input
                  type="file"
                  accept=".pdf"
                  required
                  className="cursor-pointer"
                  onChange={(e) =>
                    setForm({ ...form, resume: e.target.files?.[0] || null })
                  }
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsApplyOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-estate-navy">
                  Submit Application
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* FOOTER CTA */}
        <div className="text-white py-12 text-center">
          <h2 className="text-2xl font-semibold mb-2 text-estate-navy">
            Didn’t find a suitable role?
          </h2>
          <p className="mb-4 text-black">
            Send your resume to cskrealtorslimited@yahoo.co.in
          </p>
          {/* <button className="bg-estate-navy text-white px-6 py-2 rounded-lg">
            Contact HR
          </button> */}
        </div>
      </div>
    </PublicLayout>
  );
}
