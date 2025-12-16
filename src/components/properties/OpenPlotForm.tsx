"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { format } from "date-fns";
import { CalendarIcon, UploadCloud, X, BadgeIndianRupee } from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

import { getCsrfToken, useAuth, User } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { OpenPlot } from "@/types/OpenPlots";
import {
  Customer,
  fetchAgents,
  fetchCustomers,
  useGetCustomers,
} from "@/utils/buildings/CustomerConfig";

/**
 * Zod schema: kept original validation but added brochureUrl as optional
 */
export const openPlotFormSchema = z.object({
  memNo: z.string().min(1, "Membership number is required"),
  projectName: z.string().min(1, "Project name is required"),
  plotNo: z.string().min(1, "Plot number is required"),
  facing: z.enum(
    [
      "North",
      "East",
      "West",
      "South",
      "North-East",
      "North-West",
      "South-East",
      "South-West",
    ],
    { message: "Plot facing direction is required" }
  ),
  extentSqYards: z.coerce
    .number()
    .min(1, "Extent in Sq. Yards is required and must be positive"),
  plotType: z.enum(
    ["Residential", "Commercial", "Agricultural", "Industrial"],
    { message: "Plot type is required" }
  ),
  googleMapsLink: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  approval: z.enum(
    ["DTCP", "HMDA", "Panchayat", "Municipality", "Unapproved", "Other"],
    { message: "Approval status is required" }
  ),
  isCornerPlot: z.boolean(),
  isGatedCommunity: z.boolean(),
  availabilityStatus: z.enum(
    ["Available", "Sold", "Reserved", "Blocked", "Under Dispute"],
    { message: "Availability status is required" }
  ),
  customerId: z.string().nullable().optional(),
  customerContact: z.string().optional().or(z.literal("")),
  agentId: z.string().nullable().optional(),
  registrationStatus: z.enum(
    [
      "Not Started",
      "In Progress",
      "Pending Documents",
      "Pending Payment",
      "Scheduled",
      "Completed",
      "Delayed",
      "Cancelled",
    ],
    { message: "Registration status is required" }
  ),
  emiScheme: z.boolean(),
  remarks: z.string().optional().or(z.literal("")),
  thumbnailUrl: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
  listedDate: z.date({
    required_error: "Listed date is required",
    invalid_type_error: "Listed date must be a valid date",
  }),
  availableFrom: z.date({
    required_error: "Available from date is required",
    invalid_type_error: "Available from date must be a valid date",
  }),
  // **Added** brochureUrl so the form values can carry the brochure URL
  brochureUrl: z.string().optional().or(z.literal("")),
});

export type OpenPlotFormValues = z.infer<typeof openPlotFormSchema>;

interface OpenPlotFormProps {
  openPlot?: OpenPlot;
  onSubmit: (data: OpenPlotFormValues) => void; // parent expects the saved object
  onCancel: () => void;
}

export function OpenPlotForm({
  openPlot,
  onSubmit,
  onCancel,
}: OpenPlotFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // files + previews
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(openPlot?.images || []);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    openPlot?.thumbnailUrl || ""
  );

  // brochure file + preview (BuildingDialog style)
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochurePreview, setBrochurePreview] = useState<string | null>(
    openPlot?.brochureUrl || null
  );
  // track whether user explicitly removed an existing brochure (so server gets cleared)
  const [brochureRemoved, setBrochureRemoved] = useState(false);

  // Keep track of created blob URLs so we can revoke them
  const [createdBlobUrls, setCreatedBlobUrls] = useState<string[]>([]);

  const isEditing = !!openPlot;

  const {
    data: agents,
    isLoading: loadingAgents,
    error: errorAgents,
  } = useQuery({ queryKey: ["agents"], queryFn: fetchAgents });

  const {
    data: customers,
    isLoading: loadingCustomers,
    error: errorCustomers,
  } = useGetCustomers(user);

  const defaultValues: Partial<OpenPlotFormValues> = openPlot
    ? {
        ...openPlot,
        extentSqYards: openPlot.extentSqYards,
        isCornerPlot: openPlot.isCornerPlot,
        isGatedCommunity: openPlot.isGatedCommunity,
        emiScheme: openPlot.emiScheme,
        listedDate: openPlot.listedDate
          ? new Date(openPlot.listedDate)
          : undefined,
        availableFrom: openPlot.availableFrom
          ? new Date(openPlot.availableFrom)
          : undefined,
        googleMapsLink: openPlot.googleMapsLink || "",
        customerId: openPlot.customerId?._id || null,
        customerContact: openPlot.customerContact || "",
        agentId: openPlot.agentId?._id || null,
        remarks: openPlot.remarks || "",
        thumbnailUrl: openPlot.thumbnailUrl || "",
        images: openPlot.images || [],
        brochureUrl: openPlot.brochureUrl || "",
      }
    : {
        memNo: "",
        projectName: "",
        plotNo: "",
        facing: "North",
        extentSqYards: 0,
        plotType: "Residential",
        googleMapsLink: "",
        approval: "Unapproved",
        isCornerPlot: false,
        isGatedCommunity: false,
        availabilityStatus: "Available",
        customerId: null,
        customerContact: "",
        agentId: null,
        registrationStatus: "Not Started",
        emiScheme: false,
        remarks: "",
        thumbnailUrl: "",
        images: [],
        listedDate: undefined,
        availableFrom: undefined,
        brochureUrl: "", // initialize brochureUrl
      };

  const form = useForm<OpenPlotFormValues>({
    resolver: zodResolver(openPlotFormSchema),
    defaultValues,
  });

  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    setCreatedBlobUrls((prev) => [...prev, previewUrl]);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);

      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);
      setCreatedBlobUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => {
      const url = prev[indexToRemove];
      if (url && url.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          setCreatedBlobUrls((prevBlobs) => prevBlobs.filter((b) => b !== url));
        }
      }
      return prev.filter((_, index) => index !== indexToRemove);
    });
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeThumbnail = () => {
    if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(thumbnailPreview);
      } catch (e) {
        setCreatedBlobUrls((prev) =>
          prev.filter((b) => b !== thumbnailPreview)
        );
      }
    }
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  // ---------- NEW: brochure handlers (mirrors building dialog style) ----------
  const handleBrochureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // require PDF (same as BuildingDialog). Adjust if you want images allowed too.
    if (file.type !== "application/pdf") {
      toast.error("Only PDF allowed for brochure");
      return;
    }

    setBrochureFile(file);

    const previewUrl = URL.createObjectURL(file);
    setBrochurePreview(previewUrl);
    setCreatedBlobUrls((prev) => [...prev, previewUrl]);
    setBrochureRemoved(false); // user replaced/added brochure, not removed
    toast.success("Brochure selected");
  };

  const removeBrochure = () => {
    // If current preview is a blob url -> revoke it
    if (brochurePreview && brochurePreview.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(brochurePreview);
      } catch (e) {
        setCreatedBlobUrls((prev) => prev.filter((b) => b !== brochurePreview));
      }
    }
    // Clear file + preview
    setBrochureFile(null);
    setBrochurePreview(null);

    // If editing and there was an existing brochure on the openPlot, mark it as removed
    if (openPlot?.brochureUrl) {
      setBrochureRemoved(true);
    } else {
      setBrochureRemoved(false);
    }
  };

  // cleanup on unmount: revoke all created blob URLs
  useEffect(() => {
    return () => {
      createdBlobUrls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.log("error occured while blob url", e);
        }
      });
    };
  }, [createdBlobUrls]);
  if (loadingAgents || loadingCustomers) return <div>Loading...</div>;
  if (errorAgents || errorCustomers) return <div>Error loading data</div>;

  // ---------- SUBMIT (keeps original flow but adds brochure upload & fixes onSubmit) ----------
  const handleSubmit = async (data: OpenPlotFormValues) => {
    if (!user || !["owner", "admin"].includes(user.role)) {
      toast.error("You don't have permission to perform this action.");
      return;
    }
    setLoading(true);
    try {
      const csrfToken = await getCsrfToken();

      // 1. Upload thumbnail (if a new file was selected). Otherwise keep existing URL.
      let finalThumbnailUrl = thumbnailPreview; // could be existing or blob url
      if (thumbnailFile) {
        const thumbForm = new FormData();
        thumbForm.append("file", thumbnailFile);
        const thumbRes = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          thumbForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        finalThumbnailUrl = thumbRes.data.url;
      }

      // 2. Prepare final image URLs (filter out blob: and upload new files)
      let finalImageUrls = imageUrls.filter((url) => !url.startsWith("blob:"));
      if (imageFiles.length > 0) {
        for (const photo of imageFiles) {
          const formData = new FormData();
          formData.append("file", photo);
          const res = await axios.post(
            `${import.meta.env.VITE_URL}/api/uploads/upload`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRF-Token": csrfToken,
              },
              withCredentials: true,
            }
          );
          if (res.data.url) finalImageUrls.push(res.data.url);
        }
      }

      // 3. BROCHURE: Upload brochure file if selected, otherwise handle removal or keep existing
      let finalBrochureUrl: string | null = openPlot?.brochureUrl || "";
      if (brochureFile) {
        const brochureForm = new FormData();
        brochureForm.append("file", brochureFile);
        const brochureRes = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          brochureForm,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        finalBrochureUrl = brochureRes.data.url;
      } else if (brochureRemoved) {
        // user explicitly removed brochure -> clear on server
        finalBrochureUrl = "";
      } else {
        // keep existing openPlot?.brochureUrl (already assigned)
        finalBrochureUrl = openPlot?.brochureUrl || "";
      }

      // 4. Prepare the payload for the main API call
      const payload = {
        ...data,
        thumbnailUrl: finalThumbnailUrl,
        images: finalImageUrls,
        brochureUrl: finalBrochureUrl,
        listedDate: data.listedDate?.toISOString(),
        availableFrom: data.availableFrom?.toISOString(),
        extentSqYards: Number(data.extentSqYards),
      };

      const config = {
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        withCredentials: true,
      };

      const response = isEditing
        ? await axios.put(
            `${import.meta.env.VITE_URL}/api/openPlot/updateOpenPlot/${
              openPlot?._id
            }`,
            payload,
            config
          )
        : await axios.post(
            `${import.meta.env.VITE_URL}/api/openPlot/saveOpenPlot`,
            payload,
            config
          );

      // Prefer common shapes: response.data.data (strapi style) or response.data
      const saved = response.data?.data ?? response.data;

      toast.success(
        isEditing
          ? "Open Plot updated successfully!"
          : "New Open Plot added successfully!"
      );

      // IMPORTANT: pass the saved object back to parent — it contains actual brochureUrl
      onSubmit(saved);

      onCancel();
    } catch (error) {
      console.error(
        "Error submitting Open Plot form:",
        error.response?.data || error.message
      );
      toast.error(
        `Failed to save Open Plot: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI (preserved your layout + added brochure UI) ----------
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Basic Plot Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter the essential details of the open plot.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Membership Number */}
            <FormField
              control={form.control}
              name="memNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Membership Number</FormLabel>
                  <FormControl>
                    <Input placeholder="MEMP001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Name */}
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Sunshine Meadows" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot Number */}
            <FormField
              control={form.control}
              name="plotNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Number</FormLabel>
                  <FormControl>
                    <Input placeholder="P-101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Plot Type */}
            <FormField
              control={form.control}
              name="plotType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select plot type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Agricultural">Agricultural</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Facing */}
            <FormField
              control={form.control}
              name="facing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plot Facing</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select facing direction" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="North-East">North-East</SelectItem>
                      <SelectItem value="North-West">North-West</SelectItem>
                      <SelectItem value="South-East">South-East</SelectItem>
                      <SelectItem value="South-West">South-West</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Extent Sq. Yards */}
            <FormField
              control={form.control}
              name="extentSqYards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extent (Sq. Yards)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="200"
                      {...field}
                      min="0"
                      onChange={(e) => {
                        const value = e.target.value;
                        const sanitizedValue = Math.max(
                          0,
                          parseFloat(value) || 0
                        );
                        field.onChange(sanitizedValue);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Approval */}
            <FormField
              control={form.control}
              name="approval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select approval type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DTCP">DTCP</SelectItem>
                      <SelectItem value="HMDA">HMDA</SelectItem>
                      <SelectItem value="Panchayat">Panchayat</SelectItem>
                      <SelectItem value="Municipality">Municipality</SelectItem>
                      <SelectItem value="Unapproved">Unapproved</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Corner Plot */}
            <FormField
              control={form.control}
              name="isCornerPlot"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Corner Plot</FormLabel>
                    <FormDescription>
                      Check if this is a corner plot.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Is Gated Community */}
            <FormField
              control={form.control}
              name="isGatedCommunity"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Gated Community</FormLabel>
                    <FormDescription>
                      Check if the plot is in a gated community.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium">Availability</h3>
            <p className="text-sm text-muted-foreground">
              Manage the plot's status.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Availability Status */}
            <FormField
              control={form.control}
              name="availabilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="Blocked">Blocked</SelectItem>
                      <SelectItem value="Under Dispute">
                        Under Dispute
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* EMI Scheme */}
            <FormField
              control={form.control}
              name="emiScheme"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>EMI Scheme Available</FormLabel>
                    <FormDescription>
                      Check if this plot is available under an EMI scheme.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Registration Status */}
            <FormField
              control={form.control}
              name="registrationStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select registration status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Pending Documents">
                        Pending Documents
                      </SelectItem>
                      <SelectItem value="Pending Payment">
                        Pending Payment
                      </SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Listed Date */}
            <FormField
              control={form.control}
              name="listedDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Listed Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Available From */}
            <FormField
              control={form.control}
              name="availableFrom"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Available From</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium">Customer & Agent Details</h3>
            <p className="text-sm text-muted-foreground">
              Optional details about the customer and agent.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      value={field.value || "none"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Selection</SelectItem>
                        {customers?.data?.map((customer: Customer) => (
                          <SelectItem key={customer._id} value={customer._id}>
                            {typeof customer.customerId === "object" &&
                              customer.customerId?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Contact */}
            <FormField
              control={form.control}
              name="customerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Contact</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 9876543210"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Agent Name */}
            <FormField
              control={form.control}
              name="agentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "none" ? undefined : value)
                      }
                      value={field.value || "none"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select agent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Selection</SelectItem>
                        {agents?.map((agent: User) => (
                          <SelectItem key={agent._id} value={agent._id}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium">Location & Images</h3>
            <p className="text-sm text-muted-foreground">
              Add Google Maps link and property images.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Google Maps Link */}
            <FormField
              control={form.control}
              name="googleMapsLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://maps.app.goo.gl/..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Thumbnail Upload */}
            <div className="space-y-4">
              <FormLabel>Main Plot Image (Thumbnail)</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Plot Thumbnail"
                      className="mx-auto mb-2 max-h-40 rounded"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 bg-white/80 rounded-full"
                      onClick={removeThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center h-40 cursor-pointer"
                    onClick={() =>
                      document.getElementById("thumbnailUpload")?.click()
                    }
                  >
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">
                      Click to upload main image
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      This will be displayed on plot cards.
                    </p>
                  </div>
                )}
                <Input
                  id="thumbnailUpload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                />
                <FormMessage>
                  {form.formState.errors.thumbnailUrl?.message}
                </FormMessage>
              </div>
            </div>

            {/* Additional Images Upload */}
            <div className="space-y-4">
              <FormLabel>Additional Plot Images</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <div
                  className="flex flex-col items-center justify-center h-20 cursor-pointer"
                  onClick={() =>
                    document.getElementById("additionalImagesUpload")?.click()
                  }
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
                  <p className="text-muted-foreground">
                    Click to add more images
                  </p>
                </div>
                <Input
                  id="additionalImagesUpload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
                {imageUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {imageUrls.map((url, index) => (
                      <div key={url + index} className="relative">
                        <img
                          src={url}
                          alt={`Plot Image ${index + 1}`}
                          className="h-24 w-full object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 bg-white/80 rounded-full h-6 w-6"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                <FormMessage>
                  {form.formState.errors.images?.message}
                </FormMessage>
              </div>
            </div>
          </div>

          {/* ---------- NEW: Brochure Upload Section (BuildingDialog style) ---------- */}
          <div className="pt-4">
            <h3 className="text-lg font-medium">Project Brochure</h3>
            <p className="text-sm text-muted-foreground">
              Upload a PDF brochure for this plot (optional).
            </p>
          </div>
          <Separator />
          <div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {brochurePreview ? (
                <div className="flex items-center justify-between">
                  <div>
                    <a
                      href={brochurePreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Brochure
                    </a>
                    <div className="text-sm text-muted-foreground mt-1">
                      {brochureFile
                        ? brochureFile.name
                        : openPlot?.brochureUrl
                        ? openPlot.brochureUrl.split("/").pop()
                        : ""}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeBrochure}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center h-28 cursor-pointer"
                  onClick={() =>
                    document.getElementById("brochureUpload")?.click()
                  }
                >
                  <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Click to upload project brochure (PDF)
                  </p>
                </div>
              )}

              <Input
                id="brochureUpload"
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleBrochureUpload}
              />
            </div>
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium">Additional Details</h3>
            <p className="text-sm text-muted-foreground">
              Any other relevant remarks.
            </p>
          </div>
          <Separator />
          {/* Remarks */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any special notes or considerations for this plot."
                    {...field}
                    value={field.value || ""}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEditing ? "Update Plot" : "Add Plot"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
