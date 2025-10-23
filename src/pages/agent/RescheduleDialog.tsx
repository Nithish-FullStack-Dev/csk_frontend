import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

export function RescheduleDialog({
  open,
  setOpen,
  schedule,
  fetchAppointments,
}) {
  console.log(schedule);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    notes: "",
    status: "",
    type: "",
    property: "",
    floorUnit: "",
    unit: "",
    client: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // ✅ Populate form when schedule changes
  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title || "",
        date:
          typeof schedule.date === "string"
            ? schedule.date
            : schedule.date?.toISOString().split("T")[0] || "",
        startTime: schedule.startTime
          ? new Date(schedule.startTime).toTimeString().slice(0, 5)
          : "",
        endTime: schedule.endTime
          ? new Date(schedule.endTime).toTimeString().slice(0, 5)
          : "",
        location: schedule.location || "",
        notes: schedule.notes || "",
        status: schedule.status,
        type: schedule.type,
        property: schedule.property?._id || "",
        floorUnit: schedule.floorUnit?._id || "",
        unit: schedule.unit?._id || "",
        client: schedule.client?._id || "",
      });
    }
  }, [schedule]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdating(true);

      const payload = {
        ...formData,
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`,
      };

      await axios.put(
        `${import.meta.env.VITE_URL}/api/user-schedule/schedule/${
          schedule._id
        }`,
        payload,
        { withCredentials: true }
      );

      toast({ title: "Success", description: "Appointment rescheduled." });
      setOpen(false);
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to reschedule.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Update the date, time, or notes for this appointment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Editable Fields */}
          <Input
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Title"
            required
          />

          {/* Read-only details */}
          <Input
            value={schedule?.client?.name || "Unknown Client"}
            disabled
            readOnly
          />

          <Input
            value={schedule?.property?.projectName || "Unknown Property"}
            disabled
            readOnly
          />

          <Input
            value={
              schedule?.floorUnit
                ? `${schedule.floorUnit.floorNumber} / ${schedule.floorUnit.unitType}`
                : "N/A"
            }
            disabled
            readOnly
          />

          <Input
            value={
              schedule?.unit
                ? `Plot No: ${schedule.unit.plotNo} (${schedule.unit.propertyType})`
                : "N/A"
            }
            disabled
            readOnly
          />

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <Input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </div>

          {/* Notes & Location */}
          <Textarea
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
          />

          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes"
          />

          {/* Buttons */}
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
