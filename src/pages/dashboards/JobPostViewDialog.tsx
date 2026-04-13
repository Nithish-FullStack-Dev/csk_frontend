import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Briefcase, MapPin, IndianRupee, Clock, Building } from "lucide-react";
import RenderRichText from "@/components/common/editor/Render";

const JobPostViewDialog = ({ open, onOpenChange, job }: any) => {
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-6 border-b bg-muted/30">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold">
                {job.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" /> {job.department || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {job.location || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" /> {job.jobType || "N/A"}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" /> {job.workMode || "N/A"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={job.status === "published" ? "default" : "secondary"}
                className="capitalize"
              >
                {job.status || "N/A"}
              </Badge>
              {job.salaryRange && (
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <IndianRupee className="h-4 w-4" />
                  {job.salaryRange.min || 0} - {job.salaryRange.max || 0}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">Overview</h3>
              <RenderRichText html={job.description || ""} />
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                Description
              </h3>
              <RenderRichText html={job.description || ""} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {job.responsibilities?.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Responsibilities
                  </h3>
                  <RenderRichText html={job.responsibilities || ""} />
                </section>
              )}

              {job.requirements?.length > 0 && (
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold border-b pb-2">
                    Requirements
                  </h3>
                  <RenderRichText html={job.requirements || ""} />
                </section>
              )}
            </div>

            {job.benefits?.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Benefits
                </h3>
                <RenderRichText html={job.benefits || ""} />
              </section>
            )}

            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Experience Required
                </p>
                <p className="text-sm font-medium">
                  {job.experience?.min || 0} - {job.experience?.max || 0} Years
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Openings</p>
                <p className="text-sm font-medium">{job.openings || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Application Type
                </p>
                <p className="text-sm font-medium capitalize">
                  {job.applicationType || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Featured</p>
                <p className="text-sm font-medium">
                  {job.isFeatured ? "Yes" : "No"}
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default JobPostViewDialog;
