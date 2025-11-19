// OpenLandDetails.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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

  const galleryImages = useMemo(() => {
    const setImgs = new Set<string>(land?.images || []);
    if (land?.thumbnailUrl) setImgs.add(land.thumbnailUrl);
    return Array.from(setImgs);
  }, [land]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLand(initialLand);
  }, [initialLand]);

  const { data: agents = [], isLoading: isLoadingAgents } = useQuery({
    queryKey: ["agents"],
    queryFn: fetchAgents,
    staleTime: 2 * 60 * 1000,
  });

  const {
    data: leadsResponse,
    isLoading: isLoadingLeads,
    isError: isErrorLeads,
  } = useQuery({
    queryKey: ["leads"],
    queryFn: fetchAllLeads,
  });

  const leads = leadsResponse ?? [];

  const refreshLand = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/openLand/getOpenLandById/${land._id}`,
        { withCredentials: true }
      );
      const fresh = data?.land ?? data;
      if (fresh) {
        setLand(fresh);
        onRefresh?.(fresh);
      }
    } catch (err) {
      console.error("refreshLand error", err);
    }
  };

  const openAddInterest = () => {
    setEditingInterest(null);
    setSelectedLeadId(null);
    setSelectedAgentId(null);
    setInterestDialogOpen(true);
  };

  const openEditInterest = (entry: InterestedEntry) => {
    setEditingInterest(entry);
    setSelectedLeadId(entry.lead?._id ?? null);
    setSelectedAgentId(entry.agent?._id ?? null);
    setInterestDialogOpen(true);
  };

  const submitInterest = async () => {
    if (!selectedLeadId || !selectedAgentId) {
      toast.error("Please select both lead and agent.");
      return;
    }
    if (!land._id) {
      toast.error("Missing land ID.");
      return;
    }

    setSubmittingInterest(true);
    try {
      if (editingInterest) {
        const url = `${import.meta.env.VITE_URL}/api/openLand/${
          land._id
        }/updateInterestedCustomer/${editingInterest._id}`;
        await axios.put(
          url,
          { leadId: selectedLeadId, agentId: selectedAgentId },
          { withCredentials: true }
        );
        toast.success("Interested lead updated");
      } else {
        const url = `${import.meta.env.VITE_URL}/api/openLand/${
          land._id
        }/addInterestedCustomer`;
        await axios.post(
          url,
          { leadId: selectedLeadId, agentId: selectedAgentId },
          { withCredentials: true }
        );
        toast.success("Interested lead added");
      }
      setInterestDialogOpen(false);
      await refreshLand();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to save interested lead"
      );
    } finally {
      setSubmittingInterest(false);
    }
  };

  const deleteInterest = async (interestId: string) => {
    if (!land._id) return;
    if (!window.confirm("Delete this interested lead?")) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/openLand/${
          land._id
        }/removeInterestedCustomer/${interestId}`,
        { withCredentials: true }
      );
      toast.success("Removed interested lead");
      await refreshLand();
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove interested lead");
    }
  };

  const openMarkSold = () => {
    setSoldBuyerId(null);
    setSoldDate(format(new Date(), "yyyy-MM-dd"));
    setSoldDialogOpen(true);
  };

  const submitMarkSold = async () => {
    if (!soldBuyerId) {
      toast.error("Select buyer (lead)");
      return;
    }
    if (!land._id) {
      toast.error("Missing land ID.");
      return;
    }
    setMarkingSold(true);
    try {
      const url = `${import.meta.env.VITE_URL}/api/openLand/${
        land._id
      }/markAsSold`;
      await axios.post(
        url,
        { soldToCustomerId: soldBuyerId, soldDate: soldDate },
        { withCredentials: true }
      );
      toast.success("Marked as sold");
      setSoldDialogOpen(false);
      await refreshLand();
    } catch (err) {
      console.error("mark sold error", err);
      toast.error("Failed to mark as sold");
    } finally {
      setMarkingSold(false);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let scrollSpeed = 0.7;
    let animationFrame: number;
    let isHovering = false;

    // Duplicate content for seamless infinite loop
    const originalContent = el.innerHTML;
    el.innerHTML = originalContent + originalContent;

    const scroll = () => {
      if (!el) return;

      if (!isHovering) {
        el.scrollTop += scrollSpeed;

        // Reset WITHOUT jump when halfway (because content is duplicated)
        if (el.scrollTop >= el.scrollHeight / 2) {
          el.scrollTop = 0;
        }
      }

      animationFrame = requestAnimationFrame(scroll);
    };

    const stopScroll = () => {
      isHovering = true;
    };
    const startScroll = () => {
      isHovering = false;
    };

    el.addEventListener("mouseenter", stopScroll);
    el.addEventListener("mouseleave", startScroll);

    scroll();

    return () => {
      cancelAnimationFrame(animationFrame);
      el.removeEventListener("mouseenter", stopScroll);
      el.removeEventListener("mouseleave", startScroll);
      el.innerHTML = originalContent; // restore
    };
  }, [land?.interestedCustomers]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Open Lands
        </Button>

        <div className="flex gap-3">
          {canEdit && (
            <>
              <Button size="sm" onClick={onEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={onDelete}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row">
          {land?.thumbnailUrl && (
            <div className="md:w-1/3">
              <img
                src={land.thumbnailUrl}
                alt={land.projectName}
                className="h-64 w-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              />
            </div>
          )}

          <div className={`p-6 ${land?.thumbnailUrl ? "md:w-2/3" : "w-full"}`}>
            <h2 className="text-2xl font-bold mb-1">{land.projectName}</h2>
            <div className="mt-1">{getStatusBadge(land?.landStatus)}</div>

            <p className="text-muted-foreground mt-2">
              {land.location || "No location provided"}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>
                  Land Area: {land.landArea ?? "—"} {land.areaUnit ?? ""}
                </span>
              </div>

              <div className="flex items-center">
                <Building className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>Land Type: {land.landType}</span>
              </div>

              {land.facing && (
                <div className="flex items-center">
                  <Compass className="h-5 w-5 mr-2 text-muted-foreground" />
                  <span>Facing: {land.facing}</span>
                </div>
              )}
            </div>

            {land.brochureUrl && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={(e: any) => {
                  e.stopPropagation();
                  const API_BASE =
                    import.meta.env.VITE_URL || "http://localhost:3000";
                  const proxyUrl = `${API_BASE}/api/download-proxy?url=${encodeURIComponent(
                    land.brochureUrl
                  )}&filename=${encodeURIComponent(
                    land.projectName || "brochure"
                  )}`;
                  window.open(proxyUrl, "_blank");
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> Download Brochure
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Owner & Land Details
            </CardTitle>
          </CardHeader>

          <CardContent className="text-sm space-y-4">
            {/* Two Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Owner */}
              <div className="flex items-start gap-3">
                <UserIcon className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Owner</p>
                  <p className="font-medium">
                    {land.ownerName || "Not Assigned"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Land Status</p>
                  <div>{getStatusBadge(land.landStatus)}</div>
                </div>
              </div>

              {/* Available Date */}
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Available Date
                  </p>
                  <p className="font-medium">
                    {land.availableDate
                      ? format(new Date(land.availableDate), "dd MMM yyyy")
                      : "—"}
                  </p>
                </div>
              </div>

              {/* Land Approval */}
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Land Approval</p>
                  <p className="font-medium">{land.LandApproval}</p>
                </div>
              </div>

              {/* RERA Approved */}
              <div className="flex items-start gap-3">
                <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">RERA Approved</p>
                  <p className="font-medium flex items-center gap-1">
                    {land.reraApproved ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </p>
                </div>
              </div>

              {/* RERA Number (Only if exists) */}
              {land.reraNumber && (
                <div className="flex items-start gap-3">
                  <Hash className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">RERA Number</p>
                    <p className="font-medium">{land.reraNumber}</p>
                  </div>
                </div>
              )}

              {/* Municipal Permission */}
              <div className="flex items-start gap-3">
                <Building className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Municipal Permission
                  </p>
                  <p className="font-medium flex items-center gap-1">
                    {land.municipalPermission ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-red-600" />
                    )}
                  </p>
                </div>
              </div>

              {/* Land Area */}
              <div className="flex items-start gap-3">
                <LayoutGrid className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Land Area</p>
                  <p className="font-medium">
                    {land.landArea} {land.areaUnit}
                  </p>
                </div>
              </div>

              {/* Facing */}
              <div className="flex items-start gap-3">
                <Compass className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Facing</p>
                  <p className="font-medium">{land.facing}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{land.location}</p>
                </div>
              </div>

              {/* Description */}
              {land.description && (
                <div className="flex items-start gap-3 md:col-span-2">
                  <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="font-medium leading-relaxed">
                      {land.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5" /> Interested Leads
            </CardTitle>

            {canEdit && (
              <div className="flex gap-2">
                <Button size="sm" onClick={openAddInterest}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>

                {land.landStatus !== "Sold" && (
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                    onClick={openMarkSold}
                  >
                    <Pencil className="h-4 w-4 mr-1" /> Mark Sold
                  </Button>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent>
            <div
              ref={scrollRef}
              className="h-64 overflow-hidden pr-3 space-y-4"
              style={{ scrollBehavior: "smooth" }}
            >
              {land.interestedCustomers?.length ? (
                land.interestedCustomers.map((entry: any) => {
                  const lead = entry.lead as InterestedEntry["lead"];
                  const ag = entry.agent;

                  return (
                    <div
                      key={entry._id}
                      className="border rounded-lg p-3 shadow-sm bg-white flex justify-between items-start hover:bg-gray-50 transition"
                    >
                      <div className="space-y-1 text-sm">
                        <p className="font-semibold text-base">
                          {lead?.name || "Unknown"}{" "}
                          {lead?.phone && (
                            <span className="text-muted-foreground text-sm">
                              • {lead.phone}
                            </span>
                          )}
                        </p>

                        {lead?.email && (
                          <p className="text-xs text-muted-foreground">
                            ✉️ {lead.email}
                          </p>
                        )}

                        {lead?.source && (
                          <p className="text-xs text-muted-foreground">
                            Source:{" "}
                            <span className="font-medium">{lead.source}</span>
                          </p>
                        )}
                        {lead?.status && (
                          <p className="text-xs text-muted-foreground">
                            Status:{" "}
                            <span className="font-medium">{lead.status}</span>
                          </p>
                        )}
                        {lead?.propertyStatus && (
                          <p className="text-xs text-muted-foreground">
                            Property Status:{" "}
                            <span className="font-medium">
                              {lead.propertyStatus}
                            </span>
                          </p>
                        )}
                        {lead?.notes && (
                          <p className="text-xs text-muted-foreground">
                            Notes: {lead.notes}
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Agent: {ag?.name || "—"}{" "}
                          {ag?.email ? <>• {ag.email}</> : ""}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {entry.createdAt
                            ? format(
                                new Date(entry.createdAt),
                                "dd MMM yyyy, hh:mm a"
                              )
                            : ""}
                        </p>
                      </div>

                      {canEdit && (
                        <div className="flex flex-col gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            onClick={() =>
                              openEditInterest(entry as InterestedEntry)
                            }
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => deleteInterest(entry._id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-sm">
                  No interested leads
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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

      <Dialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInterest ? "Edit Interested Lead" : "Add Interested Lead"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Lead</label>
              <Select
                onValueChange={(val) => setSelectedLeadId(val)}
                value={selectedLeadId || ""}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingLeads ? "Loading..." : "Select lead"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l: any) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name || "No Name"} {l.phone ? `• ${l.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Agent</label>
              <Select
                onValueChange={(val) => setSelectedAgentId(val)}
                value={selectedAgentId || ""}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingAgents ? "Loading..." : "Select agent"
                    }
                  />
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

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setInterestDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitInterest} disabled={submittingInterest}>
                {submittingInterest
                  ? "Saving..."
                  : editingInterest
                  ? "Update"
                  : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={soldDialogOpen} onOpenChange={setSoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Land as Sold</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Buyer (Lead)
              </label>
              <Select
                onValueChange={(val) => setSoldBuyerId(val)}
                value={soldBuyerId || ""}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isLoadingLeads ? "Loading..." : "Select lead"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((l: any) => (
                    <SelectItem key={l._id} value={l._id}>
                      {l.name || "No Name"} {l.phone ? `• ${l.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Sold Date
              </label>
              <Input
                type="date"
                value={soldDate ?? ""}
                onChange={(e) => setSoldDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSoldDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitMarkSold} disabled={markingSold}>
                {markingSold ? "Processing..." : "Mark as Sold"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
