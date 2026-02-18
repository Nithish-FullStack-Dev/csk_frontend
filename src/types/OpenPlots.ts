// src/types/OpenPlots.ts
import { z } from "zod";

export const openPlotSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  openPlotNo: z.string().min(1, "Open plot number is required"),

  surveyNo: z.string().optional(),

  approvalAuthority: z
    .enum(["DTCP", "HMDA", "RERA", "PANCHAYAT", "OTHER"])
    .optional(),

  location: z.string().min(1, "Location is required"),

  googleMapsLocation: z
    .string()
    .optional()
    .refine(
      (v) => !v || v.startsWith("http"),
      "Enter valid Google Maps link",
    ),
  totalArea: z.coerce
    .number()
    .positive("Total area must be greater than 0"),

  areaUnit: z.enum(["SqFt", "SqYd", "Acre"]),

  facing: z.enum(["North", "South", "East", "West"]).optional(),

  roadWidthFt: z.coerce.number().optional(),

  boundaries: z.string().optional(),

  titleStatus: z.enum(["Clear", "Disputed", "NA"]),

  status: z.enum(["Available", "Sold", "Blocked"]),

  reraNo: z.string().optional(),
  documentNo: z.string().optional(),

  remarks: z.string().optional(),
});

export type OpenPlotFormValues = z.infer<typeof openPlotSchema>;

export interface OpenPlot extends OpenPlotFormValues {
  _id: string;
  thumbnailUrl: string;
  images: string[];
  brochureUrl?: string;
  googleMapsLocation?: string;
}
