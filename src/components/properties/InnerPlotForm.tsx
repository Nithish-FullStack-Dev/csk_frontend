"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutation } from "@tanstack/react-query";
import { createInnerPlot } from "@/api/innerPlot.api";
import { useState } from "react";

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
  const [thumb, setThumb] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string>("");

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const form = useForm<InnerPlotFormValues>({
    resolver: zodResolver(innerPlotSchema),
    defaultValues: {
      openPlotId,
      plotType: "Residential",
      status: "Available",
    },
  });

  /* ---------- FILE HANDLERS ---------- */

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

  /* ---------- MUTATION ---------- */

  const mutation = useMutation({
    mutationFn: (data: InnerPlotFormValues) =>
      createInnerPlot(data, thumb ?? undefined, images),
    onSuccess,
  });

  /* ---------- UI ---------- */

  return (
    <form
      onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
      className="space-y-6"
    >
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Plot No" {...form.register("plotNo")} />

          <Input
            type="number"
            placeholder="Area"
            {...form.register("area", { valueAsNumber: true })}
          />

          <Input placeholder="Wastage Area" {...form.register("wastageArea")} />

          <Input
            type="number"
            placeholder="Road Width (ft)"
            {...form.register("roadWidthFt", { valueAsNumber: true })}
          />

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
