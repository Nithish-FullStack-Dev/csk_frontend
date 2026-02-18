"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { saveOpenPlot, updateOpenPlot } from "@/api/openPlot.api";
import { useState } from "react";
import { toast } from "sonner";
import { OpenPlotFormValues, openPlotSchema } from "@/types/OpenPlots";

/* shadcn */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface Props {
  openPlot?: any;
  onSuccess: () => void;
}

export function OpenPlotForm({ openPlot, onSuccess }: Props) {
  const isEdit = !!openPlot;

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    openPlot?.thumbnailUrl || "",
  );

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    openPlot?.images || [],
  );

  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureName, setBrochureName] = useState<string>(
    openPlot?.brochureUrl ? "Existing brochure uploaded" : "",
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OpenPlotFormValues>({
    resolver: zodResolver(openPlotSchema),
    defaultValues: openPlot ?? {
      projectName: "",
      openPlotNo: "",
      surveyNo: "",
      approvalAuthority: undefined,
      location: "",
      totalArea: 0,
      areaUnit: "SqFt",
      facing: undefined,
      roadWidthFt: undefined,
      titleStatus: "Clear",
      status: "Available",
      reraNo: "",
      documentNo: "",
      googleMapsLocation: "",
      boundaries: "",
      remarks: "",
    },
  });

  /* FILE HANDLERS */

  const onThumbnailChange = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Thumbnail must be under 5MB");
      return;
    }
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onImagesChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    if (imagePreviews.length + newFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setImageFiles((p) => [...p, ...newFiles]);
    setImagePreviews((p) => [
      ...p,
      ...newFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (index: number) => {
    setImagePreviews((p) => p.filter((_, i) => i !== index));
    setImageFiles((p) => p.filter((_, i) => i !== index));
  };

  const onBrochureChange = (file?: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Brochure must be PDF");
      return;
    }
    setBrochureFile(file);
    setBrochureName(file.name);
  };

  /* MUTATION */

  const mutation = useMutation({
    mutationFn: (data: OpenPlotFormValues) => {
      if (!thumbnailFile && !isEdit) {
        toast.error("Thumbnail image is required");
        return Promise.reject();
      }

      if (!brochureFile && !isEdit) {
        toast.error("Brochure file is required");
        return Promise.reject();
      }

      return isEdit
        ? updateOpenPlot(
            openPlot._id,
            data,
            thumbnailFile ?? undefined,
            imageFiles,
            brochureFile ?? undefined,
          )
        : saveOpenPlot(data, thumbnailFile!, imageFiles, brochureFile!);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Open plot updated" : "Open plot created");
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Something went wrong");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="space-y-6"
    >
      <Card className="p-6 space-y-6">
        {/* BASIC INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Project Name</Label>
            <Input {...register("projectName")} />
            <p className="text-red-500 text-sm">
              {errors.projectName?.message}
            </p>
          </div>
          <div>
            <Label>Location</Label>
            <Input {...register("location")} />
          </div>
          <div>
            <Label>Open Plot No</Label>
            <Input {...register("openPlotNo")} />
            <p className="text-red-500 text-sm">{errors.openPlotNo?.message}</p>
          </div>

          <div>
            <Label>Survey No</Label>
            <Input {...register("surveyNo")} />
          </div>

          <div>
            <Label>Total Area</Label>
            <Input
              type="number"
              min={0}
              {...register("totalArea", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label>Area Unit</Label>
            <Select
              value={watch("areaUnit")}
              onValueChange={(v) => setValue("areaUnit", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Area Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SqFt">SqFt</SelectItem>
                <SelectItem value="SqYd">SqYd</SelectItem>
                <SelectItem value="Acre">Acre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Facing</Label>
            <Select
              value={watch("facing")}
              onValueChange={(v) => setValue("facing", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Facing" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Road Width (ft)</Label>
            <Input
              type="number"
              min={0}
              {...register("roadWidthFt", { valueAsNumber: true })}
            />
          </div>

          <div>
            <Label>Approval Authority</Label>
            <Select
              value={watch("approvalAuthority")}
              onValueChange={(v) => setValue("approvalAuthority", v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select authority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DTCP">DTCP</SelectItem>
                <SelectItem value="HMDA">HMDA</SelectItem>
                <SelectItem value="RERA">RERA</SelectItem>
                <SelectItem value="PANCHAYAT">PANCHAYAT</SelectItem>
                <SelectItem value="OTHER">OTHER</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>RERA No</Label>
            <Input {...register("reraNo")} />
          </div>

          <div>
            <Label>Document No</Label>
            <Input {...register("documentNo")} />
          </div>

          <div className="md:col-span-2">
            <Label>Google Maps Location</Label>
            <Input {...register("googleMapsLocation")} />
          </div>
        </div>

        <div>
          <Label>Boundaries</Label>
          <Textarea {...register("boundaries")} />
        </div>

        <div>
          <Label>Remarks</Label>
          <Textarea {...register("remarks")} />
        </div>

        {/* THUMBNAIL */}
        <div className="space-y-2">
          <Label>Main Image *</Label>
          {thumbnailPreview && (
            <img
              src={thumbnailPreview}
              className="h-32 w-48 object-cover rounded border"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onThumbnailChange(e.target.files?.[0])}
          />
        </div>

        {/* BROCHURE */}
        <div className="space-y-2">
          <Label>Brochure (PDF)</Label>
          {brochureName && (
            <p className="text-sm text-muted-foreground">{brochureName}</p>
          )}
          <Input
            type="file"
            accept=".pdf"
            onChange={(e) => onBrochureChange(e.target.files?.[0])}
          />
        </div>

        {/* GALLERY */}
        <div className="space-y-2">
          <Label>Gallery Images</Label>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => onImagesChange(e.target.files)}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {imagePreviews.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  className="h-24 w-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-background border rounded px-1 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending
            ? "Saving..."
            : isEdit
              ? "Update Open Plot"
              : "Create Open Plot"}
        </Button>
      </Card>
    </form>
  );
}
