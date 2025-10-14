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
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";

export function RescheduleDialog({
  open,
  setOpen,
  schedule,
  fetchAppointments,
}) {
  console.log(schedule);
  const [isUpadting, setisUpadting] = useState(false);
  const { control, register, handleSubmit } = useForm({
    defaultValues: {
      ...schedule,
      date:
        typeof schedule.date === "string"
          ? schedule.date
          : schedule.date?.toISOString().split("T")[0],
      startTime: schedule.startTime?.toISOString().split("T")[1]?.slice(0, 5),
      endTime: schedule.endTime?.toISOString().split("T")[1]?.slice(0, 5),
    },
  });

  const onSubmit = async (formData) => {
    try {
      setisUpadting(true);
      const payload = {
        ...formData,
        startTime: `${formData.date}T${formData.startTime}`,
        endTime: `${formData.date}T${formData.endTime}`,
      };
      console.log(payload);
      await axios.put(
        `${import.meta.env.VITE_URL}/api/user-schedule/schedule/${
          schedule._id
        }`,
        payload,
        {
          withCredentials: true,
        }
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
      setisUpadting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input {...register("title")} placeholder="Title" required />

          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <Input
                value={schedule?.client?.name || "Unknown Client"}
                disabled
                readOnly
              />
            )}
          />

          <Controller
            name="propertyId"
            control={control}
            render={({ field }) => (
              <Input
                value={schedule?.property?.projectName || "Unknown Property"}
                disabled
                readOnly
              />
            )}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input type="date" {...register("date")} />
            <Input type="time" {...register("startTime")} />
            <Input type="time" {...register("endTime")} />
          </div>

          <Textarea {...register("location")} placeholder="Location" />
          <Textarea {...register("notes")} placeholder="Notes" />

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpadting}>
              {isUpadting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
