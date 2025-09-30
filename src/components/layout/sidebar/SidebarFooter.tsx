"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

interface SidebarFooterProps {
  collapsed: boolean;
}

const SidebarFooter = ({ collapsed }: SidebarFooterProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem("name") as HTMLInputElement)?.value;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
    const issue = (form.elements.namedItem("issue") as HTMLTextAreaElement)
      ?.value;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/contact/send-email`,
        {
          name,
          email,
          subject: "Help & Support",
          message: issue,
        },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success("Your request has been submitted!");
        setOpen(false);
      } else {
        toast.error(res.data?.message || "Failed to send email");
      }
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong while sending"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "p-3 border-t border-estate-blue/30",
          collapsed ? "text-center" : ""
        )}
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 text-sm text-white hover:text-estate-mustard rounded-md px-2 py-1.5 w-full text-left"
        >
          <HelpCircle className="h-5 w-5" />
          {!collapsed && <span>Help & Support</span>}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-estate-navy">
              Help & Support
            </DialogTitle>
            <DialogDescription>
              Please fill out the form below and we’ll get back to you shortly.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="issue">Issue</Label>
              <Textarea
                id="issue"
                name="issue"
                placeholder="Describe your issue"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SidebarFooter;
