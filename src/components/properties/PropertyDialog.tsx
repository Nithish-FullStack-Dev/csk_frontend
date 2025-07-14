
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Property } from "@/types/property";
import { PropertyForm } from "./PropertyForm";

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: Property;
  onSubmit: (data: any) => void;
}

export function PropertyDialog({ open, onOpenChange, property, onSubmit }: PropertyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{property ? 'Edit Property' : 'Add New Property'}</DialogTitle>
          <DialogDescription>
            {property ? 'Update the property details below.' : 'Fill in the property details below to create a new property.'}
          </DialogDescription>
        </DialogHeader>
        <PropertyForm 
          property={property}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
