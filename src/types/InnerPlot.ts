import { z } from "zod";

export interface InnerPlot extends InnerPlotFormValues {
  _id: string;
  thumbnailUrl?: string;
  images: string[];
}

export const innerPlotSchema = z.object({
  openPlotId: z.string(),
  plotNo: z.string().min(1),
  area: z.number().positive(),
  // wastageArea: z.string().optional(),
  facing: z.enum(["North", "South", "East", "West"]).optional(),
  // roadWidthFt: z.number().optional(),
  plotType: z.enum([
    "Residential",
    "Commercial",
    "Road",
    "OpenSpace",
    "WasteLand",
  ]),
  status: z.enum(["Available", "Sold", "Blocked"]),
  remarks: z.string().optional(),
});

export type InnerPlotFormValues = z.infer<typeof innerPlotSchema>;
