import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OpenLand } from "@/types/OpenLand";
import OpenLandForm from "./OpenLandForm";

interface OpenLandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openLand?: OpenLand;
  onSubmit: (data: any) => void;
}

export function OpenLandDialog({
  open,
  onOpenChange,
  openLand,
  onSubmit,
}: OpenLandDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] w-[90vw] max-h-[90vh] overflow-auto rounded-xl">
        <OpenLandForm
          openLand={openLand}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
