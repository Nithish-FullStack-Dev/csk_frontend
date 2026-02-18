"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInnerPlot } from "@/api/innerPlot.api";
import { useState } from "react";
import { toast } from "sonner";

/* shadcn */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { InnerPlotFormValues, innerPlotSchema } from "@/types/InnerPlot";

interface Props {
  openPlotId: string;
  onSuccess: () => void;
}

export function InnerPlotForm({ openPlotId, onSuccess }: Props) {
  const queryClient = useQueryClient();

  const [thumb, setThumb] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InnerPlotFormValues>({
    resolver: zodResolver(innerPlotSchema),
    defaultValues: {
      openPlotId,
      plotType: "Residential",
      status: "Available",
    },
  });

  /* FILE HANDLERS */

  const onThumbChange = (file?: File) => {
    if (!file) return;
    setThumb(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const onImagesChange = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    setImages(list);
    setImagePreviews(list.map((f) => URL.createObjectURL(f)));
  };

  /* MUTATION */

  const mutation = useMutation({
    mutationFn: (data: InnerPlotFormValues) =>
      createInnerPlot(data, thumb ?? undefined, images),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["inner-plots", openPlotId],
      });

      onSuccess();
    },

    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create plot");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="space-y-6"
    >
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plot No */}
          <div className="space-y-1">
            <Input placeholder="Plot No" {...register("plotNo")} />
            {errors.plotNo && (
              <p className="text-red-500 text-sm">{errors.plotNo.message}</p>
            )}
          </div>

          {/* Area */}
          <div className="space-y-1">
            <Input
              type="number"
              min={0}
              placeholder="Area"
              {...register("area", { valueAsNumber: true })}
            />
            {errors.area && (
              <p className="text-red-500 text-sm">{errors.area.message}</p>
            )}
          </div>

          {/* Facing */}
          <div className="space-y-1">
            <Select onValueChange={(v) => setValue("facing", v as any)}>
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
            {errors.facing && (
              <p className="text-red-500 text-sm">{errors.facing.message}</p>
            )}
          </div>

          {/* Plot Type */}
          <div className="space-y-1">
            <Select onValueChange={(v) => setValue("plotType", v as any)}>
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
            {errors.plotType && (
              <p className="text-red-500 text-sm">{errors.plotType.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1">
            <Select onValueChange={(v) => setValue("status", v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-red-500 text-sm">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Remarks */}
        <Textarea placeholder="Remarks" {...register("remarks")} />

        {/* Thumbnail */}
        <div className="space-y-2">
          <Label>Thumbnail Image</Label>
          {thumbPreview && (
            <img
              src={thumbPreview}
              className="h-28 w-40 object-cover rounded border"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => onThumbChange(e.target.files?.[0])}
          />
        </div>

        {/* Gallery */}
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
              <img
                key={i}
                src={img}
                className="h-24 w-full object-cover rounded border"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-fit"
        >
          {mutation.isPending ? "Saving..." : "Save Inner Plot"}
        </Button>
      </Card>
    </form>
  );
}
