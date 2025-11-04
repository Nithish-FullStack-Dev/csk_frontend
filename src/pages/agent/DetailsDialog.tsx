import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DetailsDialog({ open, setOpen, schedule }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] max-w-[90vw] rounded-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <div className="space-y-2">
          <p>
            <strong>Title:</strong> {schedule?.title}
          </p>
          <p>
            <strong>Client:</strong> {schedule?.client?.name}
          </p>
          <p>
            <strong>Property:</strong>{" "}
            {schedule?.property?.projectName || "N/A"}
          </p>
          <p>
            <strong>Floor:</strong>{" "}
            {schedule?.floorUnit
              ? `${schedule.floorUnit.floorNumber} / ${schedule.floorUnit.unitType}`
              : "N/A"}
          </p>
          <p>
            <strong>Apartment:</strong>{" "}
            {schedule?.unit ? `Plot No: ${schedule.unit.plotNo}` : "N/A"}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {typeof schedule.date === "string"
              ? schedule.date
              : schedule.date?.toISOString().split("T")[0]}
          </p>
          <p>
            <strong>Start Time:</strong>{" "}
            {schedule.startTime?.toISOString().split("T")[1]?.slice(0, 5)}
          </p>
          <p>
            <strong>End Time:</strong>{" "}
            {schedule.endTime?.toISOString().split("T")[1]?.slice(0, 5)}
          </p>
          <p>
            <strong>Location:</strong> {schedule?.location || "N/A"}
          </p>
          <p>
            <strong>Status:</strong> {schedule?.status || "N/A"}
          </p>
          <p>
            <strong>Notes:</strong> {schedule?.notes || "N/A"}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
