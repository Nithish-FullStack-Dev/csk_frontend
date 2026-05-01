import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function RescheduleDialogAgent({
  open,
  setOpen,
  schedule,
  fetchAppointments,
  clients,
}) {
  const [isSaving, setisSaving] = useState(false);
  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      ...schedule,
      clientId: schedule.lead?._id || schedule.clientId,
      date:
        typeof schedule.date === "string"
          ? schedule.date
          : schedule.date?.toISOString().split("T")[0],
      startTime: schedule.startTime
        ? new Date(schedule.startTime).toISOString().split("T")[1]?.slice(0, 5)
        : "",
      endTime: schedule.endTime
        ? new Date(schedule.endTime).toISOString().split("T")[1]?.slice(0, 5)
        : "",
      location: schedule.location || "",
      notes: schedule.notes || "",
      status: schedule.status || "scheduled",
    },
  });

  const onSubmit = async (formData) => {
    try {
      setisSaving(true);
      const payload = {
        ...formData,
        lead: formData.clientId, // backend expects `lead`
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`,
      };

      await axios.put(
        `${import.meta.env.VITE_URL}/api/agent-schedule/updateSchedules/${
          schedule._id
        }`,
        payload,
        { withCredentials: true },
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
      setisSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="md:w-[600px] w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1">
            <Label>Title</Label>
            <Input {...register("title")} placeholder="Enter title" required />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Client</Label>
            {/* Lead / Client Selection */}
            <Controller
              disabled
              name="clientId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <Label>Date</Label>
              <Input type="date" {...register("date")} />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Start Time</Label>
              <Input type="time" {...register("startTime")} />
            </div>

            <div className="flex flex-col gap-1">
              <Label>End Time</Label>
              <Input type="time" {...register("endTime")} />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label>Location</Label>
            <Input {...register("location")} placeholder="Enter location" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Enter notes" />
          </div>
          <div>
            <Label>Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Updating" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
