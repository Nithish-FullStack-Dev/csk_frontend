"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ✅ Zod Schema for OpenLand
export const openLandFormSchema = z.object({
  projectName: z.string().min(1, "Project name required"),
  plotNo: z.string().min(1, "Plot number required"),
  location: z.string().min(1, "Location required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  landArea: z.coerce.number().min(1, "Land area required"),
  areaUnit: z.enum(["sqft", "sq-yd", "acre"]),

  pricePerUnit: z.coerce.number().optional(),
  totalPrice: z.coerce.number().optional(),

  googleMapsLink: z.string().optional().or(z.literal("")),

  description: z.string().optional().or(z.literal("")),
  features: z.array(z.string()).optional(),

  reraApproved: z.boolean(),
  reraNumber: z.string().optional().or(z.literal("")),
  municipalPermission: z.boolean(),

  brochureUrl: z.string().optional().or(z.literal("")),
  thumbnailUrl: z.string().optional().or(z.literal("")),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type OpenLandFormValues = z.infer<typeof openLandFormSchema>;

interface Props {
  openLand?: OpenLandFormValues & { _id?: string };
  onSubmit: (data: OpenLandFormValues) => Promise<void>;
  onCancel: () => void;
}

export default function OpenLandForm({ openLand, onSubmit, onCancel }: Props) {
  const isEdit = !!openLand;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OpenLandFormValues>({
    resolver: zodResolver(openLandFormSchema),
    defaultValues: openLand ?? {
      reraApproved: false,
      municipalPermission: false,
    },
  });

  const handleSubmitForm = async (data: OpenLandFormValues) => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();

      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null)
          formData.append(key, String(value));
      });

      if (openLand?._id) formData.append("_id", openLand._id);

      await onSubmit(data);
      toast.success(isEdit ? "Land Updated" : "Land Added");
    } catch (err) {
      toast.error("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmitForm)}
        className="space-y-6"
      >
        {/* Project + Plot */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Project Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plotNo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plot / Survey No</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Plot No" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Location" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Land area & unit */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="landArea"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Land Area</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="500" />
                </FormControl>
                <FormMessage />
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
                    <SelectItem value="sqft">Sqft</SelectItem>
                    <SelectItem value="sq-yd">Sq-Yard</SelectItem>
                    <SelectItem value="acre">Acre</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pricing */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="pricePerUnit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Per Unit</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="5000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Price</FormLabel>
                <FormControl>
                  <Input {...field} type="number" placeholder="1500000" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* RERA + Municipal */}
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reraApproved"
            render={({ field }) => (
              <FormItem className="flex space-x-2 items-center">
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
                    <Input {...field} placeholder="RERA No" />
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
            <FormItem className="flex space-x-2 items-center">
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <FormLabel>Municipal Permission</FormLabel>
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Description" />
              </FormControl>
            </FormItem>
          )}
        />

        <Separator />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isEdit ? "Update" : "Add"} Land
          </Button>
        </div>
      </form>
    </Form>
  );
}
