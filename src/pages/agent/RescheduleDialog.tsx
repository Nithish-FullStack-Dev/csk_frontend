import {
  Dialog,
  DialogContent,
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

export function RescheduleDialog({
  open,
  setOpen,
  schedule,
  fetchAppointments,
  clients,
  properties,
}) {
  // Ensure schedule is defined before using it
  if (!schedule) return null;

  const { control, register, handleSubmit, reset, setValue } = useForm({
    defaultValues: {
      ...schedule,
      // Fix: extract _id from nested objects for select fields
      propertyId: schedule.property?._id || "",
      clientId: schedule.client?._id || "",
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
      // Map propertyId to property for API
      const payload = {
        ...formData,
        property: formData.propertyId,
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
      console.error("Reschedule Error:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.error || "Failed to reschedule.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-w-[90vw] max-h-[80vh] overflow-scroll rounded-xl">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <Input {...register("title")} placeholder="Title" required />

          {/* Client Selection */}
          <Controller
            name="clientId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(clients) &&
                    clients.map((client) => (
                      <SelectItem key={client._id} value={client._id}>
                        {client.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Property Selection */}
          <Controller
            name="propertyId"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Property" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(properties) &&
                    properties.map((property) => (
                      <SelectItem key={property._id} value={property._id}>
                        {property.basicInfo?.projectName || "Unnamed Project"}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" {...register("date")} required />
            <Input type="time" {...register("startTime")} required />
            <Input type="time" {...register("endTime")} required />
          </div>

          {/* Location & Notes */}
          <Textarea {...register("location")} placeholder="Location" />
          <Textarea {...register("notes")} placeholder="Notes" />

          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset(); // Optional: reset form on cancel
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
