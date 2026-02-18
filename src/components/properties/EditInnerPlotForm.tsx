"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateInnerPlot } from "@/api/innerPlot.api";

/* shadcn */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { InnerPlotFormValues, innerPlotSchema } from "@/types/InnerPlot";

interface Props {
  innerPlot: any;
  onSuccess: () => void;
}

export function EditInnerPlotForm({ innerPlot, onSuccess }: Props) {
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(
    innerPlot.thumbnailUrl || "",
  );
  const queryClient = useQueryClient();

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(
    innerPlot.images || [],
  );

  const form = useForm<InnerPlotFormValues>({
    resolver: zodResolver(innerPlotSchema),
    defaultValues: {
      openPlotId: innerPlot.openPlotId,
      plotNo: innerPlot.plotNo,
      // wastageArea: innerPlot.wastageArea,
      area: innerPlot.area,
      facing: innerPlot.facing,
      // roadWidthFt: innerPlot.roadWidthFt,
      plotType: innerPlot.plotType,
      status: innerPlot.status,
      remarks: innerPlot.remarks,
    },
  });

  /* ---------- FILE HANDLERS ---------- */

  const onThumbnailChange = (file?: File) => {
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onImagesChange = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setImages(list);
    setImagePreviews(list.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    setImagePreviews((p) => p.filter((_, i) => i !== index));
    setImages((p) => p.filter((_, i) => i !== index));
  };

  /* ---------- MUTATION ---------- */

  const mutation = useMutation({
    mutationFn: (data: InnerPlotFormValues) =>
      updateInnerPlot(innerPlot._id, data, thumbnail ?? undefined, images),

    onSuccess: async () => {
      toast.success("Inner plot updated successfully");

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["inner-plots", innerPlot.openPlotId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["inner-plot", innerPlot._id],
        }),
      ]);

      onSuccess();
    },

    onError: (err: any) => {
      toast.error(err?.message || "Failed to update inner plot");
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input placeholder="Plot No" {...form.register("plotNo")} />

        <Input
          type="number"
          min={0}
          placeholder="Area"
          {...form.register("area", { valueAsNumber: true })}
        />

        {/* <Input placeholder="Wastage Area" {...form.register("wastageArea")} />

        <Input
          type="number"
          placeholder="Road Width (ft)"
          {...form.register("roadWidthFt", { valueAsNumber: true })}
        /> */}

        <Select
          value={form.watch("facing")}
          onValueChange={(v) => form.setValue("facing", v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Facing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="North">North</SelectItem>
            <SelectItem value="South">South</SelectItem>
            <SelectItem value="East">East</SelectItem>
            <SelectItem value="West">West</SelectItem>
            <SelectItem value="North-East">North-East</SelectItem>
            <SelectItem value="North-West">North-West</SelectItem>
            <SelectItem value="South-East">South-East</SelectItem>
            <SelectItem value="South-West">South-West</SelectItem>
            <SelectItem value="Not Applicable">Not Applicable</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={form.watch("plotType")}
          onValueChange={(v) => form.setValue("plotType", v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Plot Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Residential">Residential</SelectItem>
            <SelectItem value="Commercial">Commercial</SelectItem>
            <SelectItem value="Road">Road</SelectItem>
            <SelectItem value="OpenSpace">Open Space</SelectItem>
            <SelectItem value="WasteLand">Waste Land</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={form.watch("status")}
          onValueChange={(v) => form.setValue("status", v as any)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
            <SelectItem value="Blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Textarea placeholder="Remarks" {...form.register("remarks")} />

      {/* ---------- THUMBNAIL ---------- */}
      <div className="space-y-2">
        <Label>Thumbnail</Label>
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            className="h-28 w-40 object-cover rounded border"
          />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => onThumbnailChange(e.target.files?.[0])}
        />
      </div>

      {/* ---------- GALLERY ---------- */}
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

      <Button type="submit" disabled={mutation.isPending} className="w-full">
        {mutation.isPending ? "Updating..." : "Update Inner Plot"}
      </Button>
    </form>
  );
}
