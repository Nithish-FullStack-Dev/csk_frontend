import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InnerPlotForm } from "./InnerPlotForm";

interface InnerPlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openPlotId: string;
}

export function InnerPlotDialog({
  open,
  onOpenChange,
  openPlotId,
}: InnerPlotDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add Inner Plot</DialogTitle>
        </DialogHeader>

        <InnerPlotForm
          openPlotId={openPlotId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
