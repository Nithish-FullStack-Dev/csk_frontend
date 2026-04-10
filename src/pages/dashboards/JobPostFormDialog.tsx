import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import RichTextEditor from "@/components/common/editor/Editor";
import { toast } from "sonner";

const formSchema = z.object({
  title: z.string().min(1),
  overview: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  department: z.string().min(1),
  jobType: z.string().min(1),
  workMode: z.string().min(1),
  minExperience: z.coerce.number().min(0),
  maxExperience: z.coerce.number().min(0),
  minSalary: z.coerce.number().min(0),
  maxSalary: z.coerce.number().min(0),
  responsibilities: z.string().optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
});

const JobPostFormDialog = ({ open, onOpenChange, job, onSuccess }: any) => {
  const queryClient = useQueryClient();
  const isEdit = !!job;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      overview: "",
      description: "",
      location: "",
      department: "",
      jobType: "",
      workMode: "",
      minExperience: 0,
      maxExperience: 0,
      minSalary: 0,
      maxSalary: 0,
      responsibilities: "",
      requirements: "",
      benefits: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (job) {
        form.reset({
          title: job.title || "",
          overview: job.overview || "",
          description: job.description || "",
          location: job.location || "",
          department: job.department || "",
          jobType: job.jobType || "",
          workMode: job.workMode || "",
          minExperience: job.experience?.min || 0,
          maxExperience: job.experience?.max || 0,
          minSalary: job.salaryRange?.min || 0,
          maxSalary: job.salaryRange?.max || 0,
          responsibilities: job.responsibilities || "",
          requirements: job.requirements || "",
          benefits: job.benefits || "",
        });
      }
    } else {
      form.reset({
        title: "",
        overview: "",
        description: "",
        location: "",
        department: "",
        jobType: "",
        workMode: "",
        minExperience: 0,
        maxExperience: 0,
        minSalary: 0,
        maxSalary: 0,
        responsibilities: "",
        requirements: "",
        benefits: "",
      });
    }
  }, [job, open]);

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        title: values.title,
        overview: values.overview,
        description: values.description,
        location: values.location,
        department: values.department,
        jobType: values.jobType,
        workMode: values.workMode,
        experience: {
          min: values.minExperience,
          max: values.maxExperience,
        },
        salaryRange: {
          min: values.minSalary,
          max: values.maxSalary,
        },
        responsibilities: values.responsibilities,
        requirements: values.requirements,
        benefits: values.benefits,
      };

      if (isEdit) {
        const res = await axios.put(
          `${import.meta.env.VITE_URL}/api/job-posts/updateJobPost/${job._id}`,
          payload,
          { withCredentials: true },
        );
        return res.data;
      } else {
        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/job-posts/createjobPost`,
          payload,
          { withCredentials: true },
        );
        return res.data;
      }
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["jobPosts"] });
      toast.success(
        data?.message ||
          `Job post ${isEdit ? "updated" : "created"} successfully`,
      );
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message
          : error.message ||
              `Failed to ${isEdit ? "update" : "create"} job post`,
      );
      onOpenChange(false);
    },
  });

  const onSubmit = (values: any) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {isEdit ? "Edit Job Post" : "Create New Job Post"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 px-6 py-4 ">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 px-5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Engineering">
                            Engineering
                          </SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                          <SelectItem value="HR">HR</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Operations">Operations</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Job Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="workMode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Mode</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Work Mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="On-site">On-site</SelectItem>
                          <SelectItem value="Remote">Remote</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Experience (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Experience (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="minSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Salary</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Salary</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="overview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Overview</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsibilities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsibilities (One per line)</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements (One per line)</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Benefits (One per line)</FormLabel>
                    <FormControl>
                      <RichTextEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pb-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending
                    ? "Saving..."
                    : isEdit
                      ? "Update Job"
                      : "Create Job"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostFormDialog;
