import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import {
  Eye,
  Edit,
  Trash2,
  Plus,
  Loader2,
  FileText,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import JobPostFormDialog from "./JobPostFormDialog";
import JobPostViewDialog from "./JobPostViewDialog";
import { DeleteConfirmDialog } from "@/components/properties/DeleteConfirmDialog";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getImageUrl } from "@/lib/image";
import { useRBAC } from "@/config/RBAC";

const fetchJobPosts = async () => {
  const res = await axios.get(
    `${import.meta.env.VITE_URL}/api/job-posts/getJobPosts`,
    { withCredentials: true },
  );
  return res.data;
};

const fetchApplications = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/job-applications/getApplicationsForJob`,
    { withCredentials: true },
  );
  return data?.data || [];
};

const JobPostsPage = () => {
  const queryClient = useQueryClient();
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const { userCanAddUser, userCanDeleteUser, userCanEditUser } = useRBAC({
    roleSubmodule: "Careers Management",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobPosts"],
    queryFn: fetchJobPosts,
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["jobApplications"],
    queryFn: fetchApplications,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/job-posts/deleteJobPost/${id}`,
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
      toast.success("Job post deleted successfully");
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    },
    onError: (error: any) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : error.message || "Failed to delete job post",
      );
      setDeleteDialogOpen(false);
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "applied":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "reviewed":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "shortlisted":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleCreate = () => {
    setSelectedJob(null);
    setIsFormOpen(true);
  };

  const handleEdit = (job: any) => {
    setSelectedJob(job);
    setIsFormOpen(true);
  };

  const handleView = (job: any) => {
    setSelectedJob(job);
    setIsViewOpen(true);
  };

  const triggerDelete = (id: string) => {
    setJobToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (jobToDelete) deleteMutation.mutate(jobToDelete);
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight font-vidaloka text-slate-900">
              Careers Management
            </h1>
            <p className="text-slate-500 text-sm">
              Manage your job listings and track incoming candidate
              applications.
            </p>
          </div>
          {userCanAddUser && (
            <Button
              onClick={handleCreate}
              className="w-full md:w-auto shadow-sm gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Listing
            </Button>
          )}
        </div>

        <Tabs defaultValue="job-post" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
            <TabsTrigger value="job-post">Active Listings</TabsTrigger>
            <TabsTrigger value="job-applications">Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="job-post" className="mt-0 outline-none">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Job Openings</CardTitle>
                <CardDescription>
                  A list of all roles currently available on your website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-slate-500 italic">
                      Fetching listings...
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-semibold">
                            Role Title
                          </TableHead>
                          <TableHead className="font-semibold">
                            Department
                          </TableHead>
                          <TableHead className="font-semibold">
                            Location
                          </TableHead>
                          <TableHead className="font-semibold">
                            Work Type
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            Posted On
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.data?.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="h-32 text-center text-slate-400"
                            >
                              No job posts created yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          data?.data?.map((job: any) => (
                            <TableRow
                              key={job._id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <TableCell className="font-medium text-slate-900">
                                {job.title}
                              </TableCell>
                              <TableCell>{job.department}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-normal capitalize font-sans"
                                >
                                  {job.jobType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    job.status === "published"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="capitalize"
                                >
                                  {job.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-500">
                                {format(
                                  new Date(job.createdAt),
                                  "MMM dd, yyyy",
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleView(job)}
                                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {userCanEditUser && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleEdit(job)}
                                      className="h-8 w-8 text-slate-400 hover:text-emerald-600"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {userCanDeleteUser && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => triggerDelete(job._id)}
                                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="job-applications" className="mt-0 outline-none">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Candidate Applications
                </CardTitle>
                <CardDescription>
                  Review resumes and contact information from applicants.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {applicationsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-slate-500 italic">
                      Loading applications...
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-slate-50/50">
                        <TableRow>
                          <TableHead className="font-semibold">
                            Candidate
                          </TableHead>
                          <TableHead className="font-semibold">
                            Communication
                          </TableHead>
                          <TableHead className="font-semibold">
                            Date Applied
                          </TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="text-right font-semibold">
                            Resume
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {applications.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="h-32 text-center text-slate-400"
                            >
                              No applications received yet.
                            </TableCell>
                          </TableRow>
                        ) : (
                          applications.map((app: any) => (
                            <TableRow
                              key={app._id}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-semibold text-slate-900">
                                    {app.name}
                                  </span>
                                  <span className="text-xs text-slate-500 truncate max-w-[180px]">
                                    {app.jobId?.title || "N/A"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Mail className="h-3 w-3" /> {app.email}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <Phone className="h-3 w-3" /> {app.phone}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <Calendar className="h-3 w-3" />
                                  {format(
                                    new Date(app.appliedAt),
                                    "MMM dd, yyyy",
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={`border ${getStatusColor(app.status)} shadow-none font-medium capitalize font-sans`}
                                >
                                  {app.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-2 border-slate-200 hover:bg-slate-100"
                                  onClick={() =>
                                    window.open(
                                      getImageUrl(app.resumeUrl),
                                      "_blank",
                                    )
                                  }
                                >
                                  <FileText className="h-3.5 w-3.5" /> View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <JobPostFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          job={selectedJob}
          onSuccess={() => {
            setIsFormOpen(false);
            queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
          }}
        />

        <JobPostViewDialog
          open={isViewOpen}
          onOpenChange={setIsViewOpen}
          job={selectedJob}
        />

        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
          title="Delete Job Post"
          description="Are you sure you want to remove this listing? This will permanently delete the post and cannot be undone."
        />
      </div>
    </MainLayout>
  );
};

export default JobPostsPage;
