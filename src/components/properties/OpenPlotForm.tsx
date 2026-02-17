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

  /* 🔥 NEW — brochure state */
  const [brochureFile, setBrochureFile] = useState<File | null>(null);
  const [brochureName, setBrochureName] = useState<string>(
    openPlot?.brochureUrl ? "Existing brochure uploaded" : "",
  );
  const [brochurePreview, setBrochurePreview] = useState<string | null>(
    openPlot?.brochureUrl || null,
  );
  const form = useForm<OpenPlotFormValues>({
    resolver: zodResolver(openPlotSchema),
    defaultValues: openPlot ?? {
      projectName: "",
      openPlotNo: "",
      location: "",
      totalArea: 0,
      areaUnit: "SqFt",
      titleStatus: "Clear",
      status: "Available",
    },
  });

  /* ---------- FILE HANDLERS ---------- */

  const onThumbnailChange = (file?: File) => {
    if (!file) return;
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const onImagesChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
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

  /* 🔥 NEW — brochure handler */
  const onBrochureChange = (file?: File) => {
    if (!file) return;
    setBrochureFile(file);
    setBrochureName(file.name);
  };

  /* ---------- MUTATION ---------- */

  const mutation = useMutation({
    mutationFn: (data: OpenPlotFormValues) => {
      if (!thumbnailFile && !isEdit) {
        throw new Error("Thumbnail image is required");
      }

      if (!brochureFile && !isEdit) {
        throw new Error("Brochure file is required");
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
      toast.error(err.message || "Something went wrong");
    },
  });

  /* ---------- UI ---------- */

  return (
    <form
      onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
      className="space-y-6"
    >
      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Project Name" {...form.register("projectName")} />
          <Input placeholder="Open Plot No" {...form.register("openPlotNo")} />
          <Input placeholder="Survey No" {...form.register("surveyNo")} />
          <Input placeholder="Location" {...form.register("location")} />

          <Input
            type="number"
            placeholder="Total Area"
            {...form.register("totalArea", { valueAsNumber: true })}
          />

          <Select
            value={form.watch("areaUnit")}
            onValueChange={(v) => form.setValue("areaUnit", v as any)}
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

          <Select
            value={form.watch("approvalAuthority")}
            onValueChange={(v) => form.setValue("approvalAuthority", v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Approval Authority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DTCP">DTCP</SelectItem>
              <SelectItem value="HMDA">HMDA</SelectItem>
              <SelectItem value="RERA">RERA</SelectItem>
              <SelectItem value="PANCHAYAT">Panchayat</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

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

          <Input
            type="number"
            placeholder="Road Width (ft)"
            {...form.register("roadWidthFt", { valueAsNumber: true })}
          />

          <Select
            value={form.watch("titleStatus")}
            onValueChange={(v) => form.setValue("titleStatus", v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Title Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Clear">Clear</SelectItem>
              <SelectItem value="Disputed">Disputed</SelectItem>
              <SelectItem value="NA">NA</SelectItem>
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

          <Input placeholder="RERA No" {...form.register("reraNo")} />
          <Input placeholder="Document No" {...form.register("documentNo")} />
        </div>

        <Textarea placeholder="Boundaries" {...form.register("boundaries")} />
        <Textarea placeholder="Remarks" {...form.register("remarks")} />

        {/* THUMBNAIL */}
        <div className="space-y-2">
          <Label>Main Image</Label>
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

        {/* 🔥 BROCHURE */}
        <div className="space-y-2">
          <Label>Brochure (PDF)</Label>
          {brochureName && (
            <p className="text-sm text-muted-foreground">{brochureName}</p>
          )}
          <Input
            type="file"
            accept=".pdf,.doc,.docx"
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

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full md:w-fit"
        >
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
