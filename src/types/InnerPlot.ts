import { z } from "zod";

export interface InnerPlot extends InnerPlotFormValues {
  _id: string;
  thumbnailUrl?: string;
  images: string[];
}

export const innerPlotSchema = z.object({
  openPlotId: z.string().min(1),
  plotNo: z.string().min(1, "Plot number is required"),
  area: z.number({
    required_error: "Area is required",
    invalid_type_error: "Area must be a number",
  }),
  facing: z.string().min(1, "Facing is required"),
  plotType: z.string().min(1, "Plot type is required"),
  status: z.string().min(1, "Status is required"),
  remarks: z.string().optional(),
});

export type InnerPlotFormValues = z.infer<typeof innerPlotSchema>;
