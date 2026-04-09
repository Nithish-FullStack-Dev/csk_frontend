import React, { useEffect, useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ScheduleVisits = () => {
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [status, setStatus] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (selectedSchedule) {
      setStatus(selectedSchedule.status);
    }
  }, [selectedSchedule]);

  const { data: schedules = [] } = useQuery({
    queryKey: ["schedules-visit"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/schedule-visit/getAllScheduleVisits`,
        {
          withCredentials: true,
        },
      );
      return data?.data || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async () => {
      return await axios.put(
        `${import.meta.env.VITE_URL}/api/schedule-visit/updateStatus/${selectedSchedule._id}`,
        { status },
        { withCredentials: true },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules-visit"] });
      setEditOpen(false);
      setSelectedSchedule(null);
    },
    onError: (err) => {
      toast.error(
        axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to update status"
          : err.message || "Failed to update status",
      );
    },
  });

  return (
    <>
      {schedules?.length === 0 ? (
        <TableRow>
          <TableCell
            colSpan={8}
            className="text-center py-8 text-muted-foreground"
          >
            No schedules available.
          </TableCell>
        </TableRow>
      ) : (
        schedules.map((schedule: any) => (
          <TableRow key={schedule._id}>
            <TableCell className="font-medium">{schedule.name}</TableCell>

            <TableCell>{schedule.phone}</TableCell>

            <TableCell>
              {schedule.building?.projectName ||
                schedule.plot?.projectName ||
                schedule.land?.projectName ||
                "N/A"}
            </TableCell>

            <TableCell>
              {schedule.preferredDate
                ? new Date(schedule.preferredDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "N/A"}
            </TableCell>

            <TableCell>{schedule.timeSlot}</TableCell>

            <TableCell>{schedule.visitors}</TableCell>
            <TableCell>{schedule.propertyType}</TableCell>

            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  schedule.status === "requested"
                    ? "bg-blue-100 text-blue-800"
                    : schedule.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : schedule.status === "scheduled"
                        ? "bg-yellow-100 text-yellow-800"
                        : schedule.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : schedule.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                }`}
              >
                {schedule.status}
              </span>
            </TableCell>

            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger className="px-2 py-1 rounded-md hover:bg-muted/50">
                  <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                </DropdownMenuTrigger>

                <DropdownMenuContent className="min-w-40">
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedSchedule(schedule);
                      setViewOpen(true);
                    }}
                  >
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedSchedule(schedule);
                      setEditOpen(true);
                    }}
                  >
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))
      )}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Schedule Visit Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected visit request
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              {/* Name */}
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{selectedSchedule?.name || "N/A"}</p>
              </div>

              {/* Phone */}
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {selectedSchedule?.phone || "N/A"}
                </p>
              </div>

              {/* Email */}
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">
                  {selectedSchedule?.email || "N/A"}
                </p>
              </div>

              {/* Project */}
              <div>
                <p className="text-muted-foreground">Project</p>
                <p className="font-medium">
                  {selectedSchedule?.building?.projectName ||
                    selectedSchedule?.plot?.projectName ||
                    selectedSchedule?.land?.projectName ||
                    "N/A"}
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-muted-foreground">Location</p>
                <p className="font-medium">
                  {selectedSchedule?.building?.location ||
                    selectedSchedule?.plot?.location ||
                    selectedSchedule?.land?.location ||
                    "N/A"}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-muted-foreground">Preferred Date</p>
                <p className="font-medium">
                  {selectedSchedule?.preferredDate
                    ? new Date(
                        selectedSchedule?.preferredDate,
                      ).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              {/* Time */}
              <div>
                <p className="text-muted-foreground">Time Slot</p>
                <p className="font-medium">
                  {selectedSchedule?.timeSlot || "N/A"}
                </p>
              </div>

              {/* Visitors */}
              <div>
                <p className="text-muted-foreground">Visitors</p>
                <p className="font-medium">
                  {selectedSchedule?.visitors || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Property Type</p>
                <p className="font-medium">
                  {selectedSchedule?.propertyType || "N/A"}
                </p>
              </div>

              {/* Status */}
              <div>
                <p className="text-muted-foreground">Status</p>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedSchedule?.status === "requested"
                      ? "bg-blue-100 text-blue-800"
                      : selectedSchedule?.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : selectedSchedule?.status === "scheduled"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedSchedule?.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : selectedSchedule?.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedSchedule?.status || "N/A"}
                </span>
              </div>

              {/* Requirements (Full width) */}
              <div className="col-span-2">
                <p className="text-muted-foreground">Requirements</p>
                <p className="font-medium">
                  {selectedSchedule?.requirements || "N/A"}
                </p>
              </div>

              {/* Created At */}
              <div className="col-span-2">
                <p className="text-muted-foreground">Created At</p>
                <p className="font-medium">
                  {selectedSchedule?.createdAt
                    ? new Date(selectedSchedule?.createdAt).toLocaleString(
                        "en-IN",
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Change the visit request status
            </DialogDescription>
          </DialogHeader>

          {selectedSchedule && (
            <div className="space-y-4 mt-4">
              {/* Name */}
              <div>
                <p className="text-muted-foreground text-sm">Customer</p>
                <p className="font-medium">{selectedSchedule.name}</p>
              </div>

              {/* Project */}
              <div>
                <p className="text-muted-foreground text-sm">Project</p>
                <p className="font-medium">
                  {selectedSchedule.building?.projectName ||
                    selectedSchedule.plot?.projectName ||
                    selectedSchedule.land?.projectName ||
                    "N/A"}
                </p>
              </div>

              {/* Status Dropdown */}
              <div>
                <p className="text-muted-foreground text-sm mb-1">Status</p>

                <Select onValueChange={setStatus} value={status}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 text-sm rounded-md border"
                >
                  Cancel
                </button>

                <button
                  onClick={() => updateStatusMutation.mutate()}
                  className="px-4 py-2 text-sm rounded-md bg-primary text-white"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ScheduleVisits;
