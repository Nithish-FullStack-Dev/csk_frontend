"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { OpenLand } from "@/types/OpenLand";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  ChevronLeft,
  Edit,
  Trash,
  MapPin,
  Building,
  FileText,
  Check,
  X,
  Image as ImageIcon,
  User as UserIcon,
  Plus,
  Pencil,
  Calendar,
  LayoutGrid,
  Compass,
  Hash,
  User,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { fetchAgents } from "@/utils/buildings/CustomerConfig";
import { useQuery } from "@tanstack/react-query";
import { fetchAllLeads } from "@/utils/leads/LeadConfig";
import { useLeadbyOpenLandId } from "@/utils/buildings/Projects";
import { Lead, useLeadbyUnitId } from "@/utils/leads/LeadConfig";

type InterestedEntry = {
  _id: string;
  lead: {
    _id: string;
    name?: string;
    phone?: string;
    email?: string;
    status?: string;
    propertyStatus?: string;
    notes?: string;
    source?: string;
  } | null;
  agent: { _id: string; name?: string; email?: string } | null;
  createdAt?: string;
};

function getStatusBadge(status?: string) {
  const colors: Record<string, string> = {
    Available: "bg-green-500",
    Sold: "bg-blue-500",
    Reserved: "bg-purple-500",
    Blocked: "bg-red-500",
    "Under Discussion": "bg-yellow-500",
  };
  return (
    <Badge className={`${colors[status || ""] || "bg-gray-500"} text-white`}>
      {status || "—"}
    </Badge>
  );
}

interface OpenLandDetailsProps {
  land: OpenLand;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRefresh?: (land: OpenLand) => void;
}

export default function OpenLandDetails({
  land: initialLand,
  onBack,
  onEdit,
  onDelete,
  onRefresh,
}: OpenLandDetailsProps) {
  const { user } = useAuth();
  const canEdit = user && ["owner", "admin"].includes(user.role);

  const [land, setLand] = useState<OpenLand>(initialLand);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");

  const [interestDialogOpen, setInterestDialogOpen] = useState(false);
  const [editingInterest, setEditingInterest] =
    useState<InterestedEntry | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [submittingInterest, setSubmittingInterest] = useState(false);

  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [soldBuyerId, setSoldBuyerId] = useState<string | null>(null);
  const [soldDate, setSoldDate] = useState<string | null>(null);
  const [markingSold, setMarkingSold] = useState(false);

  useEffect(() => {
    setLand(initialLand);
  }, [initialLand]);

  const galleryImages = useMemo(() => {
    const setImgs = new Set<string>(land?.images || []);
    if (land?.thumbnailUrl) setImgs.add(land.thumbnailUrl);
    return Array.from(setImgs);
  }, [land]);

  /* -------------------- Fetch Agents -------------------- */
  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
  });

  /* -------------------- Fetch Leads -------------------- */
  const { data: leadsResponse } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchAllLeads,
  });

  // const leads = leadsResponse ?? [];
  const {
    data: leads,
    isLoading: leadsLoading,
    isError: leadsError,
    error: leadErr,
  } = useLeadbyOpenLandId(land._id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Open Lands
        </Button>

        {canEdit && (
          <div className="flex gap-3">
            <Button size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* ---------------- LAND SUMMARY ---------------- */}
      <Card>
        <div className="flex flex-col md:flex-row">
          {land.thumbnailUrl && (
            <div className="md:w-1/3">
              <img
                src={land.thumbnailUrl}
                alt={land.projectName}
                className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          )}

          <div className={`p-6 ${land.thumbnailUrl ? "md:w-2/3" : "w-full"}`}>
            <h2 className="text-2xl font-bold mb-1">{land.projectName}</h2>
            <div className="mt-1">{getStatusBadge(land.landStatus)}</div>

            <p className="text-muted-foreground mt-2">{land.location}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                Land Area: {land.landArea} {land.areaUnit}
              </div>

              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                Land Type: {land.landType}
              </div>

              {land.facing && (
                <div className="flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-muted-foreground" />
                  Facing: {land.facing}
                </div>
              )}
            </div>

            {land.brochureUrl && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  const API_BASE = import.meta.env.VITE_URL;
                  const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
                    land.brochureUrl
                  )}&filename=${encodeURIComponent(
                    land.projectName || "brochure"
                  )}`;
                  window.open(proxyUrl, "_blank");
                }}
              >
                <FileText className="mr-2 h-4 w-4" />
                Download Brochure
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* ---------------- DETAILS + INTERESTED LEADS ---------------- */}
      <div className="grid md:grid-cols-2 gap-6 items-start">
        {/* OWNER & DETAILS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Owner & Land Details
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <Info
                label="Owner"
                value={land.ownerName}
                icon={<UserIcon className="h-4 w-4 mt-1" />}
              />

              <Info
                label="Land Status"
                value={getStatusBadge(land.landStatus)}
                icon={<Check className="h-4 w-4 mt-1" />}
              />

              <Info
                label="Available Date"
                value={
                  land.availableDate
                    ? format(new Date(land.availableDate), "dd MMM yyyy")
                    : "—"
                }
                icon={<Calendar className="h-4 w-4 mt-1" />}
              />

              <Info
                label="Land Approval"
                value={land.LandApproval}
                icon={<Check className="h-4 w-4 mt-1" />}
              />

              <Info
                label="RERA Approved"
                value={
                  land.reraApproved ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )
                }
                icon={<FileText className="h-4 w-4 mt-1" />}
              />

              {land.reraNumber && (
                <Info
                  label="RERA Number"
                  value={land.reraNumber}
                  icon={<Hash className="h-4 w-4 mt-1" />}
                />
              )}

              <Info
                label="Municipal Permission"
                value={
                  land.municipalPermission ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )
                }
                icon={<Building className="h-4 w-4 mt-1" />}
              />

              <Info
                label="Land Area"
                value={`${land.landArea} ${land.areaUnit}`}
                icon={<LayoutGrid className="h-4 w-4 mt-1" />}
              />

              <Info
                label="Facing"
                value={land.facing}
                icon={<Compass className="h-4 w-4 mt-1" />}
              />

              <Info
                label="Location"
                value={land.location}
                icon={<MapPin className="h-4 w-4 mt-1" />}
                full
              />

              {land.description && (
                <Info
                  label="Description"
                  value={land.description}
                  icon={<FileText className="h-4 w-4 mt-1" />}
                  full
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* INTERESTED LEADS */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <User className="mr-2 h-5 w-5" /> Interested Clients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
            {leadsLoading && <p>Loading leads...</p>}
            {leadsError && <p className="text-red-500">{leadErr?.message}</p>}
            {!leadsLoading && !leadsError && leads.length === 0 && (
              <p className="text-gray-500 italic">
                No interested clients found.
              </p>
            )}
            {!leadsLoading && !leadsError && leads.length > 0 && (
              <ul className="list-disc list-inside">
                {leads?.map((lead: Lead, idx: number) => (
                  <li key={lead?._id || idx}>
                    {lead?.name} - {lead?.phone} - {lead?.email}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ---------------- GALLERY ---------------- */}
      {galleryImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <ImageIcon className="mr-2 h-5 w-5" /> Gallery
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentImage(img);
                    setLightboxOpen(true);
                  }}
                  className="cursor-pointer rounded-lg overflow-hidden"
                >
                  <img
                    src={img}
                    alt="Land"
                    className="w-full h-32 object-cover hover:scale-110 transition"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ---------------- MAP ---------------- */}
      {land.googleMapsLocation ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <MapPin className="mr-2 h-5 w-5" /> Location Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <iframe
              title="Plot Location"
              src={(() => {
                const url = land.googleMapsLocation || "";
                if (!url) return "";
                if (url.includes("/embed?pb=")) return url;
                if (url.includes("/maps/place/"))
                  return url.replace("/maps/place/", "/maps/embed/place/");
                const q = url.match(/q=([^&]+)/);
                return `https://www.google.com/maps?q=${
                  q ? decodeURIComponent(q[1]) : encodeURIComponent(url)
                }&output=embed`;
              })()}
              className="w-full h-96 rounded-lg border"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </CardContent>
        </Card>
      ) : (
        <p className="text-gray-500 italic">No map available for this plot.</p>
      )}

      {/* ---------------- ADD / EDIT LEAD DIALOG ---------------- */}
      <Dialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInterest ? "Edit Interested Lead" : "Add Interested Lead"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Lead */}
            <div>
              <label className="block text-sm font-medium mb-1">Lead</label>
              <Select
                value={selectedLeadId || ""}
                onValueChange={(v) => setSelectedLeadId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads?.map((l: any) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name} {l.phone ? `• ${l.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Agent */}
            <div>
              <label className="block text-sm font-medium mb-1">Agent</label>
              <Select
                value={selectedAgentId || ""}
                onValueChange={(v) => setSelectedAgentId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a: any) => (
                    <SelectItem key={a._id} value={a._id}>
                      {a.name} {a.email ? `• ${a.email}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ---------------- MARK SOLD DIALOG ---------------- */}
      <Dialog open={soldDialogOpen} onOpenChange={setSoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Land as Sold</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Buyer */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Buyer (Lead)
              </label>
              <Select
                value={soldBuyerId || ""}
                onValueChange={(v) => setSoldBuyerId(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads?.map((l: any) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name} {l.phone ? `• ${l.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sold Date */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Sold Date
              </label>
              <Input
                type="date"
                value={soldDate || ""}
                onChange={(e) => setSoldDate(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- REUSABLE INFO COMPONENT ---------------- */
function Info({
  label,
  value,
  icon,
  full,
}: {
  label: string;
  value: any;
  icon: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 ${full ? "md:col-span-2" : ""}`}>
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
