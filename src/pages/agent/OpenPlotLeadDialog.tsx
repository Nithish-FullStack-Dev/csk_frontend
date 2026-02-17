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
  useInnerPlotDropdown,
  useOpenPlotDropdown,
  useSaveOpenPlotLead,
  useUpdateOpenPlotLead,
} from "@/utils/leads/LeadConfig";
import { Lead } from "@/utils/leads/LeadConfig";

interface Props {
  open: boolean;
  mode: "create" | "edit";
  lead?: Lead;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function OpenPlotLeadDialog({
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

  const [openPlotId, setOpenPlotId] = useState("");
  const [innerPlotId, setInnerPlotId] = useState("");

  const { data: openPlots = [] } = useOpenPlotDropdown(open);
  const { data: innerPlots = [] } = useInnerPlotDropdown(openPlotId);

  const { mutate: createLead, isPending: creating } = useSaveOpenPlotLead();
  const { mutate: updateLead, isPending: updating } = useUpdateOpenPlotLead();

  /* ---------- PREFILL FOR EDIT ---------- */
  useEffect(() => {
    if (mode === "edit" && lead) {
      setName(lead.name);
      setEmail(lead.email);
      setPhone(lead.phone);
      setSource(lead.source);
      setStatus(lead.status);
      setNotes(lead.notes || "");
      setOpenPlotId(
        typeof lead.openPlot === "object"
          ? lead.openPlot._id
          : lead.openPlot || "",
      );
      setInnerPlotId(
        typeof lead.innerPlot === "object"
          ? lead.innerPlot._id
          : lead.innerPlot || "",
      );
    } else {
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
    setOpenPlotId("");
    setInnerPlotId("");
  };

  const handleSubmit = () => {
    if (
      !name ||
      !email ||
      !phone ||
      !source ||
      !status ||
      !openPlotId ||
      !innerPlotId
    ) {
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
      openPlot: openPlotId,
      innerPlot: innerPlotId,
      isPlotLead: true,
      isPropertyLead: false,
      isLandLead: false,
    } as const;

    if (mode === "create") {
      createLead(payload, {
        onSuccess: () => {
          toast.success("Open plot lead created");
          onSuccess?.();
          onClose();
        },
      });
    } else if (mode === "edit" && lead) {
      updateLead(
        {
          _id: lead._id,
          ...payload,
        },
        {
          onSuccess: () => {
            toast.success("Open plot lead updated");
            onSuccess?.();
            onClose();
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-h-[80vh] flex flex-col  max-w-[520px] rounded-xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add Open Plot Lead" : "Edit Open Plot Lead"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 p-4 max-h-[80vh] overflow-y-auto">
          <InputField label="Name *" value={name} onChange={setName} />
          <InputField label="Email *" value={email} onChange={setEmail} />
          <InputField label="Phone *" value={phone} onChange={setPhone} />
          <InputField label="Source *" value={source} onChange={setSource} />

          <SelectField
            label="Open Plot *"
            value={openPlotId}
            onChange={(v) => {
              setOpenPlotId(v);
              setInnerPlotId("");
            }}
            options={openPlots.map((p) => ({
              value: p._id,
              label: `${p.projectName} - ${p.openPlotNo}`,
            }))}
          />

          <SelectField
            label="Inner Plot *"
            value={innerPlotId}
            disabled={!openPlotId}
            onChange={setInnerPlotId}
            options={innerPlots.map((p) => ({
              value: p._id,
              label: `Plot ${p.plotNo}`,
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

/* ---------- Helpers ---------- */

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
