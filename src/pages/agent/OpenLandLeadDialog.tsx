"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Lead,
  useOpenLandDropdown,
  useSaveOpenLandLead,
  useUpdateOpenLandLead,
} from "@/utils/leads/LeadConfig";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  lead?: Lead | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OpenLandLeadDialog({
  open,
  mode,
  lead,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState<"hot" | "warm" | "cold" | "">("");
  const [notes, setNotes] = useState("");
  const [openLandId, setOpenLandId] = useState("");

  const { data: openLands = [] } = useOpenLandDropdown(open);

  const { mutate: createLead, isPending: creating } = useSaveOpenLandLead();
  const { mutate: updateLead, isPending: updating } = useUpdateOpenLandLead();

  /* ------------------ Prefill on Edit ------------------ */
  useEffect(() => {
    if (mode === "edit" && lead) {
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone);
      setSource(lead.source);
      setStatus(lead.status);
      setNotes(lead.notes || "");
      setOpenLandId(
        typeof lead.openLand === "object"
          ? lead.openLand._id
          : lead.openLand || "",
      );
    }

    if (mode === "create") {
      resetForm();
    }
  }, [mode, lead]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setSource("");
    setStatus("");
    setNotes("");
    setOpenLandId("");
  };

  /* ------------------ Submit ------------------ */
  const handleSubmit = () => {
    if (!name || !email || !phone || !source || !status || !openLandId) {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      name,
      email,
      phone,
      source,
      status,
      notes,
      openLand: openLandId,
      isLandLead: true,
      isPlotLead: false,
      isPropertyLead: false,
    } as const;

    if (mode === "create") {
      createLead(payload, {
        onSuccess: () => {
          toast.success("Open land lead created");
          onSuccess?.();
          onClose();
          resetForm();
        },
        onError: (err: any) =>
          toast.error(err.message || "Failed to create lead"),
      });
    } else if (mode === "edit" && lead) {
      updateLead(
        { ...payload, _id: lead._id },
        {
          onSuccess: () => {
            toast.success("Open land lead updated");
            onSuccess?.();
            onClose();
          },
          onError: (err: any) =>
            toast.error(err.message || "Failed to update lead"),
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-h-[80vh] flex flex-col  max-w-[520px] rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Open Land Lead" : "Edit Open Land Lead"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 p-4 max-h-[80vh] overflow-y-auto">
          <InputField label="Name *" value={name} onChange={setName} />
          <InputField label="Email *" value={email} onChange={setEmail} />
          <InputField label="Phone *" value={phone} onChange={setPhone} />
          <InputField label="Source *" value={source} onChange={setSource} />

          <SelectField
            label="Open Land *"
            value={openLandId}
            onChange={setOpenLandId}
            options={openLands.map((l) => ({
              value: l._id,
              label: l.projectName,
            }))}
          />

          <SelectField
            label="Status *"
            value={status}
            onChange={setStatus}
            options={[
              { value: "hot", label: "Hot" },
              { value: "warm", label: "Warm" },
              { value: "cold", label: "Cold" },
            ]}
          />

          <InputField label="Notes" value={notes} onChange={setNotes} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating || updating}>
            {(creating || updating) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {mode === "create" ? "Save Lead" : "Update Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------ Helpers ------------------ */

function InputField({ label, value, onChange }: any) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, disabled }: any) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o: any) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
