import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const AgentDetailsDialog = ({ open, setOpen, schedule }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <p>
            <strong>Title:</strong> {schedule?.title}
          </p>
          <p>
            <strong>Client:</strong> {schedule?.lead?.name}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {typeof schedule.date === "string"
              ? schedule.date
              : schedule.date?.toISOString().split("T")[0]}
          </p>
          <p>
            <strong>Start Time:</strong>{" "}
            {schedule.startTime &&
              new Date(schedule.startTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
          </p>
          <p>
            <strong>End Time:</strong>{" "}
            {schedule.endTime &&
              new Date(schedule?.endTime).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
          </p>
          <p>
            <strong>Location:</strong> {schedule?.location}
          </p>
          <p>
            <strong>Status:</strong> {schedule?.status}
          </p>
          <p>
            <strong>Notes:</strong> {schedule?.notes}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentDetailsDialog;
