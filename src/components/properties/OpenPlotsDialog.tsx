import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpenPlot } from "@/types/OpenPlots";
import { OpenPlotForm } from "./OpenPlotForm";

interface OpenPlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openPlot?: OpenPlot;
}

export function OpenPlotDialog({
  open,
  onOpenChange,
  openPlot,
}: OpenPlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[90vw] max-h-[90vh] overflow-auto rounded-xl">
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
          onSuccess={() => {
            onOpenChange(false); // close dialog
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
