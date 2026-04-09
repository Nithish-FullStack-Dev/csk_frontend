import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { Calendar, Clock, User, Phone, MessageSquare } from "lucide-react";

interface SiteVisitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  projectName: string;
  isLoading?: boolean;
}

export function SiteVisitDialog({
  open,
  onOpenChange,
  onSubmit,
  projectName,
  isLoading = false,
}: SiteVisitDialogProps) {
  const form = useForm({
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      date: "",
      time: "",
      visitors: "1",
      requirements: "",
    },
  });

  const handleSubmit = (data: any) => {
    const siteVisitData = {
      ...data,
      visitors: Number(data.visitors),
      projectName,
      status: "requested",
      createdAt: new Date().toISOString(),
    };

    onSubmit(siteVisitData);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-auto h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-500" />
            Schedule Site Visit
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Book a visit to {projectName}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      required
                      placeholder="Enter your full name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Phone className="mr-2 h-4 w-4" />
                    Phone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      required
                      placeholder="Enter your phone number"
                      type="tel"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your email"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Preferred Date
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Preferred Time
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="2:00">2:00 PM</SelectItem>
                      <SelectItem value="3:00">3:00 PM</SelectItem>
                      <SelectItem value="4:00">4:00 PM</SelectItem>
                      <SelectItem value="5:00">5:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visitors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Visitors</FormLabel>
                  <Select onValueChange={field.onChange} value="1">
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select number of visitors" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 Person</SelectItem>
                      <SelectItem value="2">2 People</SelectItem>
                      <SelectItem value="3">3 People</SelectItem>
                      <SelectItem value="4">4 People</SelectItem>
                      <SelectItem value="5">5 People</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Special Requirements (Optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Any specific requirements or questions about the project"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? "Scheduling..." : "Schedule Visit"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
