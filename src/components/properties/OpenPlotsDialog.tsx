import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpenPlot } from "@/types/OpenPlots"; // Make sure this is your OpenPlot type
import { OpenPlotForm } from "./OpenPlotForm"; // Your form component for open plots

interface OpenPlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openPlot?: OpenPlot;
  onSubmit: (data: any) => void;
}

export function OpenPlotDialog({
  open,
  onOpenChange,
  openPlot,
  onSubmit,
}: OpenPlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {openPlot ? "Edit Open Plot" : "Add New Open Plot"}
          </DialogTitle>
          <DialogDescription>
            {openPlot
              ? "Update the open plot details below."
              : "Fill in the details below to add a new open plot."}
          </DialogDescription>
        </DialogHeader>
        <OpenPlotForm
          openPlot={openPlot}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
