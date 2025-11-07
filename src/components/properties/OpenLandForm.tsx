"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { UploadCloud, X } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { getCsrfToken, useAuth } from "@/contexts/AuthContext";

/** Schema aligned with your backend OpenLand model + your UI fields */
export const openLandFormSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  location: z.string().min(1, "Location is required"),

  landType: z.enum([
    "Agriculture",
    "Non-Agriculture",
    "Residential Land",
    "Commercial Land",
    "Industrial Land",
    "Farm Land",
    "Plotting Land",
    "Other",
  ]),

  // Optional fields your UI uses even if backend stores landSize string
  landArea: z.coerce.number().optional(),
  areaUnit: z.enum(["Sqft", "Sqyd", "Acre", "Hectare"]).optional(),

  landSize: z.string().optional(),
  availableDate: z.string().optional(), // send as string/ISO

  description: z.string().optional(),

  municipalPermission: z.boolean().default(false),
  reraApproved: z.boolean().default(false),
  reraNumber: z.string().optional(),

  googleMapsLocation: z.string().optional(), // iframe/embed or normal link

  facing: z.enum([
    "North",
    "East",
    "West",
    "South",
    "North-East",
    "North-West",
    "South-East",
    "South-West",
    "Not Applicable",
  ]),

  roadAccessWidth: z.string().optional(),
  fencingAvailable: z.boolean().default(false),
  waterFacility: z.boolean().default(false),
  electricity: z.boolean().default(false),

  thumbnailUrl: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).optional(),
  brochureUrl: z.string().optional().or(z.literal("")),
});

export type OpenLandFormValues = z.infer<typeof openLandFormSchema>;

interface OpenLandFormProps {
  /** Pass the existing land doc when editing (can be your backend land object) */
  openLand?: any;
  /** Parent receives the saved object returned by the API */
  onSubmit: (saved: any) => void;
  onCancel: () => void;
}

export default function OpenLandForm({
  openLand,
  onSubmit,
  onCancel,
}: OpenLandFormProps) {
  const { user } = useAuth();
  const isEditing = !!openLand;

  // --- RHF setup
  const form = useForm<OpenLandFormValues>({
    resolver: zodResolver(openLandFormSchema),
    defaultValues: openLand
      ? {
          // Prefer backend values if present
          projectName: openLand.projectName || "",
          location: openLand.location || "",
          landType: openLand.landType || "Other",
          // Optional UI helpers
          landArea: openLand.landArea ?? undefined,
          areaUnit: openLand.areaUnit || "Acre",
          landSize: openLand.landSize || "",
          availableDate: openLand.availableDate
            ? new Date(openLand.availableDate).toISOString().slice(0, 10)
            : "",
          description: openLand.description || "",
          municipalPermission: !!openLand.municipalPermission,
          reraApproved: !!openLand.reraApproved,
          reraNumber: openLand.reraNumber || "",
          googleMapsLocation: openLand.googleMapsLocation || "",
          facing: openLand.facing || "Not Applicable",
          roadAccessWidth: openLand.roadAccessWidth || "",
          fencingAvailable: !!openLand.fencingAvailable,
          waterFacility: !!openLand.waterFacility,
          electricity: !!openLand.electricity,
          thumbnailUrl: openLand.thumbnailUrl || "",
          images: openLand.images || [],
          brochureUrl: openLand.brochureUrl || "",
        }
      : {
          projectName: "",
          location: "",
          landType: "Other",
          landArea: undefined,
          areaUnit: "Acre",
          landSize: "",
          availableDate: "",
          description: "",
          municipalPermission: false,
          reraApproved: false,
          reraNumber: "",
          googleMapsLocation: "",
          facing: "Not Applicable",
          roadAccessWidth: "",
          fencingAvailable: false,
          waterFacility: false,
          electricity: false,
          thumbnailUrl: "",
          images: [],
          brochureUrl: "",
        },
  });

  // --- Local file+preview state (same pattern as OpenPlotForm)
  const [createdBlobUrls, setCreatedBlobUrls] = useState<string[]>([]);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    openLand?.thumbnailUrl || ""
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>(openLand?.images || []);

  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochurePreview, setBrochurePreview] = useState<string | null>(
    openLand?.brochureUrl || null
  );
  const [brochureRemoved, setBrochureRemoved] = useState(false);

  // Cleanup blobs on unmount
  useEffect(() => {
    return () => {
      createdBlobUrls.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, [createdBlobUrls]);

  // --- Upload handlers (same flow as OpenPlotForm)
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setThumbnailFile(f);
    const url = URL.createObjectURL(f);
    setThumbnailPreview(url);
    setCreatedBlobUrls((p) => [...p, url]);
  };

  const removeThumbnail = () => {
    if (thumbnailPreview?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(thumbnailPreview);
      } catch {}
    }
    setThumbnailFile(null);
    setThumbnailPreview("");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const arr = Array.from(files);
    setImageFiles((prev) => [...prev, ...arr]);
    const blobs = arr.map((f) => URL.createObjectURL(f));
    setImageUrls((prev) => [...prev, ...blobs]);
    setCreatedBlobUrls((p) => [...p, ...blobs]);
  };

  const removeImage = (idx: number) => {
    setImageUrls((prev) => {
      const next = [...prev];
      const u = next[idx];
      if (u?.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      }
      next.splice(idx, 1);
      return next;
    });
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleBrochureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are allowed for brochure");
      return;
    }
    setBrochureFile(f);
    const url = URL.createObjectURL(f);
    setBrochurePreview(url);
    setCreatedBlobUrls((p) => [...p, url]);
    setBrochureRemoved(false);
  };

  const removeBrochure = () => {
    if (brochurePreview?.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(brochurePreview);
      } catch {}
    }
    setBrochurePreview(null);
    setBrochureFile(null);
    if (openLand?.brochureUrl) setBrochureRemoved(true);
  };

  // --- Submit
  const [saving, setSaving] = useState(false);

  const onSubmitInternal = async (data: OpenLandFormValues) => {
    try {
      if (!user || !["owner", "admin"].includes(user.role)) {
        toast.error("You don't have permission to perform this action.");
        return;
      }

      setSaving(true);
      const csrfToken = await getCsrfToken();

      // 1) Thumbnail
      let finalThumbnailUrl = openLand?.thumbnailUrl || "";
      if (thumbnailFile) {
        const fd = new FormData();
        fd.append("file", thumbnailFile);
        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        finalThumbnailUrl = res.data.url; // full Cloudinary URL
      }

      // 2) Images
      let finalImages = imageUrls.filter((u) => !u.startsWith("blob:"));
      if (imageFiles.length) {
        for (const f of imageFiles) {
          const fd = new FormData();
          fd.append("file", f);
          const res = await axios.post(
            `${import.meta.env.VITE_URL}/api/uploads/upload`,
            fd,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRF-Token": csrfToken,
              },
              withCredentials: true,
            }
          );
          if (res.data.url) finalImages.push(res.data.url);
        }
      }

      // 3) Brochure
      let finalBrochureUrl = openLand?.brochureUrl || "";
      if (brochureFile) {
        const fd = new FormData();
        fd.append("file", brochureFile);
        const res = await axios.post(
          `${import.meta.env.VITE_URL}/api/uploads/upload`,
          fd,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "X-CSRF-Token": csrfToken,
            },
            withCredentials: true,
          }
        );
        finalBrochureUrl = res.data.url;
      } else if (brochureRemoved) {
        finalBrochureUrl = "";
      }

      // 4) Final payload (include both your helpers + backend's fields)
      const payload: any = {
        ...data,
        thumbnailUrl: finalThumbnailUrl,
        images: finalImages,
        brochureUrl: finalBrochureUrl,
      };

      // Optional: if you want to maintain a human-readable landSize in backend as well:
      if (data.landArea && data.areaUnit && !data.landSize) {
        payload.landSize = `${data.landArea} ${data.areaUnit}`;
      }

      const config = {
        headers: { "X-CSRF-Token": csrfToken },
        withCredentials: true,
      };

      const res = isEditing
        ? await axios.put(
            `${import.meta.env.VITE_URL}/api/openLand/updateOpenLand/${
              openLand._id
            }`,
            payload,
            config
          )
        : await axios.post(
            `${import.meta.env.VITE_URL}/api/openLand/saveOpenLand`,
            payload,
            config
          );

      // Your update response earlier had { success, message, land }
      const saved = res.data?.land ?? res.data;

      toast.success(
        isEditing
          ? "Open land updated successfully!"
          : "Open land created successfully!"
      );

      onSubmit(saved);
      onCancel();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save open land");
    } finally {
      setSaving(false);
    }
  };

  // --- UI
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmitInternal)}
        className="space-y-6"
      >
        <div>
          <h3 className="text-lg font-medium">
            {isEditing ? "Edit Open Land" : "Add Open Land"}
          </h3>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to {isEditing ? "update" : "add"} an
            openLand
          </p>
        </div>
        <Separator />

        {/* Basic details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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

        {/* Land type + size */}
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="landType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select land type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[
                      "Agriculture",
                      "Non-Agriculture",
                      "Residential Land",
                      "Commercial Land",
                      "Industrial Land",
                      "Farm Land",
                      "Plotting Land",
                      "Other",
                    ].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="landArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Area</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="areaUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Area Unit</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sqft">Sqft</SelectItem>
                    <SelectItem value="Sqyd">Sq-Yard</SelectItem>
                    <SelectItem value="Acre">Acre</SelectItem>
                    <SelectItem value="Hectare">Hectare</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {/* Available Date + Google Maps */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="availableDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="googleMapsLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Maps Link / Embed</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://maps.google.com/..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Facing + Road */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="facing"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Facing</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border rounded-md px-2 py-2 bg-background"
                  >
                    {[
                      "North",
                      "East",
                      "West",
                      "South",
                      "North-East",
                      "North-West",
                      "South-East",
                      "South-West",
                      "Not Applicable",
                    ].map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="roadAccessWidth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Road Access Width</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 30ft / 60ft" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Facilities */}
        <div className="grid sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="fencingAvailable"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel>Fencing Available</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="waterFacility"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel>Water Facility</FormLabel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="electricity"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel>Electricity</FormLabel>
              </FormItem>
            )}
          />
        </div>

        {/* Media Uploads */}
        <Separator />
        <h3 className="text-lg font-medium">Media Uploads</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Thumbnail */}
          <div>
            <FormLabel>Thumbnail Image</FormLabel>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {thumbnailPreview ? (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
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
                    Click to upload thumbnail
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
            </div>
          </div>

          {/* Gallery */}
          <div>
            <FormLabel>Gallery Images</FormLabel>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <div
                className="flex flex-col items-center justify-center h-20 cursor-pointer"
                onClick={() =>
                  document.getElementById("galleryUpload")?.click()
                }
              >
                <UploadCloud className="h-8 w-8 text-muted-foreground mb-1" />
                <p className="text-muted-foreground">
                  Click to add more images
                </p>
              </div>
              <Input
                id="galleryUpload"
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
                        alt={`Image ${index + 1}`}
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
            </div>
          </div>
        </div>

        {/* Brochure */}
        <div>
          <FormLabel>Project Brochure (PDF)</FormLabel>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            {brochurePreview ? (
              <div className="flex items-center justify-between">
                <div>
                  <a
                    href={brochurePreview}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Brochure
                  </a>
                  <div className="text-sm text-muted-foreground mt-1">
                    {brochureFile
                      ? brochureFile.name
                      : openLand?.brochureUrl
                      ? String(openLand.brochureUrl).split("/").pop()
                      : ""}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeBrochure}>
                  <X className="h-4 w-4" />
                </Button>
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
                  Click to upload brochure (PDF)
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

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Short description..."
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Legal */}
        <Separator />
        <h3 className="text-lg font-medium">Legal</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reraApproved"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel>RERA Approved</FormLabel>
              </FormItem>
            )}
          />
          {form.watch("reraApproved") && (
            <FormField
              control={form.control}
              name="reraNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RERA Number</FormLabel>
                  <FormControl>
                    <Input placeholder="RERA No" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control}
          name="municipalPermission"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FormLabel>Municipal Permission</FormLabel>
            </FormItem>
          )}
        />

        {/* Actions */}
        <Separator />
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : isEditing ? "Update Land" : "Add Land"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
