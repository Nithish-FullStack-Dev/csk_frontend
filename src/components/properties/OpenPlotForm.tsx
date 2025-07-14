import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getCsrfToken, useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  UploadCloud,
  Image as ImageIcon,
  BadgeIndianRupee,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { OpenPlot } from "@/types/OpenPlots";

// Form schema validation
export const openPlotFormSchema = z.object({
  memNo: z.string().min(1, "Membership number is required"),
  projectName: z.string().min(1, "Project name is required"),
  plotNo: z.string().min(1, "Plot number is required"),
  facing: z.enum([
    "North",
    "East",
    "West",
    "South",
    "North-East",
    "North-West",
    "South-East",
    "South-West",
  ]),
  extentSqYards: z.coerce.number().min(1, "Extent must be at least 1 sq. yard"),
  plotType: z.enum(["Residential", "Commercial", "Agricultural", "Industrial"]),
  pricePerSqYard: z.coerce.number().min(1, "Price per sq. yard is required"),
  totalAmount: z.coerce.number().min(0, "Total amount must be positive"),
  bookingAmount: z.coerce.number().min(0, "Booking amount must be positive"),
  amountReceived: z.coerce.number().min(0, "Amount received must be positive"),
  balanceAmount: z.coerce.number().min(0, "Balance amount must be positive"),
  googleMapsLink: z.string().url("Must be a valid URL").optional(),
  approval: z.enum([
    "DTCP",
    "HMDA",
    "Panchayat",
    "Municipality",
    "Unapproved",
    "Other",
  ]),
  isCornerPlot: z.boolean().default(false),
  isGatedCommunity: z.boolean().default(false),
  availabilityStatus: z.enum([
    "Available",
    "Sold",
    "Reserved",
    "Blocked",
    "Under Dispute",
  ]),
  customerName: z.string().optional(),
  customerContact: z.string().optional(),
  agentName: z.string().optional(),
  registrationStatus: z.enum([
    "Not Started",
    "In Progress",
    "Pending Documents",
    "Pending Payment",
    "Scheduled",
    "Completed",
    "Delayed",
    "Cancelled",
  ]),
  emiScheme: z.boolean().default(false),
  remarks: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  images: z.array(z.string()).optional(),
  listedDate: z.date({
    required_error: "Listed date is required",
  }),
  availableFrom: z.date({
    required_error: "Availability date is required",
  }),
});

export type OpenPlotFormValues = z.infer<typeof openPlotFormSchema>;

interface OpenPlotFormProps {
  openPlot?: OpenPlot;
  onSubmit: (data: OpenPlotFormValues) => void;
  onCancel: () => void;
}

export function OpenPlotForm({
  openPlot,
  onSubmit,
  onCancel,
}: OpenPlotFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(openPlot?.images || []);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    openPlot?.thumbnailUrl || ""
  );

  const isEditing = !!openPlot;
  // Convert the property data to form values if editing
  const defaultValues: Partial<OpenPlotFormValues> = openPlot
    ? {
        ...openPlot,
        listedDate: openPlot.listedDate
          ? new Date(openPlot.listedDate)
          : undefined,
        availableFrom: openPlot.availableFrom
          ? new Date(openPlot.availableFrom)
          : undefined,
        images: openPlot.images || [],
      }
    : {
        plotType: "Residential",
        facing: "East",
        extentSqYards: 0,
        pricePerSqYard: 0,
        totalAmount: 0,
        bookingAmount: 0,
        amountReceived: 0,
        balanceAmount: 0,
        isCornerPlot: false,
        isGatedCommunity: false,
        availabilityStatus: "Available",
        registrationStatus: "Not Started",
        emiScheme: false,
        listedDate: new Date(),
        availableFrom: new Date(),
        images: [],
      };

  const form = useForm<OpenPlotFormValues>({
    resolver: zodResolver(openPlotFormSchema),
    defaultValues,
  });

  // Watch form values for validation and calculations
  const totalAmount = form.watch("totalAmount");
  const amountReceived = form.watch("amountReceived");
  const plotType = form.watch("plotType");

  // Update balance amount when total or received amount changes
  const recalculateBalance = () => {
    if (totalAmount && amountReceived) {
      const balance = totalAmount - amountReceived;
      form.setValue("balanceAmount", balance >= 0 ? balance : 0);
    }
  };

  // Handle file uploads for multiple property images
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);

      // Create preview URLs for the images
      const newUrls = newFiles.map((file) => URL.createObjectURL(file));
      setImageUrls((prev) => [...prev, ...newUrls]);

      // Update form value
      form.setValue("images", [
        ...(form.getValues("images") || []),
        ...newUrls,
      ]);
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
      form.setValue("thumbnailUrl", previewUrl);
    }
  };

  // Remove an image
  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));

    const currentImages = form.getValues("images") || [];
    form.setValue(
      "images",
      currentImages.filter((_, index) => index !== indexToRemove)
    );
  };

  // Remove thumbnail
  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    form.setValue("thumbnailUrl", "");
  };

  // Call on mount and when values change
  React.useEffect(() => {
    recalculateBalance();
  }, [totalAmount, amountReceived]);

  const handleSubmit = async (data: OpenPlotFormValues) => {
    console.log("first2");
    if (!user || !["owner", "admin"].includes(user.role)) {
      toast.error("You don't have permission to perform this action");
      return;
    }

    try {
      setLoading(true);

      // CSRF Token fetch
      const csrfToken = await getCsrfToken();

      // Construct payload
      const payload = {
        memNo: data.memNo,
        projectName: data.projectName,
        plotNo: data.plotNo,
        facing: data.facing,
        extentSqYards: data.extentSqYards,
        plotType: data.plotType,
        pricePerSqYard: data.pricePerSqYard,
        totalAmount: data.totalAmount,
        bookingAmount: data.bookingAmount,
        amountReceived: data.amountReceived,
        balanceAmount: data.balanceAmount,
        googleMapsLink: data.googleMapsLink,

        approval: data.approval,

        isCornerPlot: data.isCornerPlot,
        isGatedCommunity: data.isGatedCommunity,

        availabilityStatus: data.availabilityStatus,

        customerName: data.customerName,
        customerContact: data.customerContact,
        agentName: data.agentName,

        registrationStatus: data.registrationStatus,

        emiScheme: data.emiScheme,
        remarks: data.remarks,

        thumbnailUrl: thumbnailPreview, // from state or external handler
        images: imageUrls, // from uploader/preview handler

        listedDate:
          data.listedDate?.toISOString?.() || new Date().toISOString(),
        availableFrom:
          data.availableFrom?.toISOString?.() || new Date().toISOString(),
      };

      const config = {
        headers: {
          "X-CSRF-Token": csrfToken,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      // Determine endpoint (same for create/update if backend handles both)
      const endpoint = "http://localhost:3000/api/openPlot/saveOpenPlot";

      // Make request
      const response = await axios.post(endpoint, payload, config);

      // Success handling
      if (response.status === 200 || response.status === 201) {
        onSubmit(data);
        toast.success("Plot saved successfully");
      } else {
        toast.error("Unexpected response from server");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Something went wrong while saving the property"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium font-sans">Basic Information</h3>
            <p className="text-sm text-muted-foreground font-sans">
              Enter the basic details of the open plots
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
                    <Input placeholder="MEM001" {...field} />
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
                    <Input placeholder="Green Valley Villas" {...field} />
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
                    <Input placeholder="A-123" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Type */}
            <FormField
              control={form.control}
              name="plotType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
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

            {/* Villa Facing - Only show for Villa and Apartment types */}
            {(plotType === "Residential" || plotType === "Commercial") && (
              <FormField
                control={form.control}
                name="facing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facing Direction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select direction" />
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
            )}

            {/* Extent */}
            <FormField
              control={form.control}
              name="extentSqYards"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Extent (sq. ft)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1200" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium">Customer Information</h3>
            <p className="text-sm text-muted-foreground">
              Enter customer and status details
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Status */}
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
                        <SelectValue placeholder="Select status" />
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

            {/* Customer Status */}
            <FormField
              control={form.control}
              name="availabilityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avaliable Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
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

            {/* Contact Number */}
            <FormField
              control={form.control}
              name="customerContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+91 98765 43210"
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
              name="agentName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Robert Wilson"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium">Financial Details</h3>
            <p className="text-sm text-muted-foreground">
              Enter payment and financial information
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Amount */}
            <FormField
              control={form.control}
              name="totalAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Total Amount (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="5000000"
                        {...field}
                        className="pl-10"
                        onChange={(e) => {
                          field.onChange(e);
                          recalculateBalance();
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Amount Received */}
            <FormField
              control={form.control}
              name="amountReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Received (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="2500000"
                        {...field}
                        className="pl-10"
                        onChange={(e) => {
                          field.onChange(e);
                          recalculateBalance();
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Balance Amount */}
            <FormField
              control={form.control}
              name="balanceAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Balance Amount (₹)</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BadgeIndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="2500000"
                        {...field}
                        className="pl-10"
                        readOnly
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gated Community */}
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
                      This plot is part of a gated community.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Corner Plot */}
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
                      Indicates if the plot is on a corner location.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* EMI Scheme */}
            <FormField
              control={form.control}
              name="emiScheme"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 font-sans">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>EMI Scheme</FormLabel>
                    <FormDescription>
                      Property is available under EMI scheme
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4">
            <h3 className="text-lg font-medium font-sans">
              Property Images & Location
            </h3>
            <p className="text-sm text-muted-foreground font-sans">
              Upload images and location details for the property
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            {/* Thumbnail Upload */}
            <div className="space-y-4 font-sans">
              <FormLabel>Main Property Image</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center font-sans">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img
                      src={thumbnailPreview}
                      alt="Property Thumbnail"
                      className="mx-auto mb-2 max-h-40 rounded font-sans"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 bg-white/80 rounded-full font-sans"
                      onClick={removeThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="flex flex-col items-center justify-center h-40 cursor-pointer font-sans"
                    onClick={() =>
                      document.getElementById("thumbnailUpload")?.click()
                    }
                  >
                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-2 font-sans" />
                    <p className="text-muted-foreground font-sans">
                      Click to upload main image
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-sans">
                      The main image will be displayed on property cards
                    </p>
                  </div>
                )}
                <Input
                  id="thumbnailUpload"
                  type="file"
                  className="hidden font-sans"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                />
              </div>
            </div>

            {/* Google Maps Location */}
            <FormField
              control={form.control}
              name="googleMapsLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://maps.google.com/?q=..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the Google Maps URL or coordinates for this property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Additional Images Upload */}
          <div className="space-y-4">
            <FormLabel>Additional Property Images</FormLabel>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 font-sans">
              <div className="flex flex-wrap gap-4 mb-4 font-sans">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative w-32 h-32 font-sans">
                    <img
                      src={url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover rounded font-sans"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 bg-white/80 rounded-full font-sans"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4 font-sans" />
                    </Button>
                  </div>
                ))}

                <div
                  className="w-32 h-32 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded cursor-pointer font-sans"
                  onClick={() =>
                    document.getElementById("imagesUpload")?.click()
                  }
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground text-center font-sans">
                    Add Images
                  </p>
                </div>

                <Input
                  id="imagesUpload"
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <FormField
            control={form.control}
            name="remarks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Remarks</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Additional notes about the property"
                    className="resize-none font-sans"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4 font-sans">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Open Plot"
              : "Add Open Plot"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
