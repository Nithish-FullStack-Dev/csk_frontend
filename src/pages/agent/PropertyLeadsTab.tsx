"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ChevronRight,
  MoreHorizontal,
  PhoneCall,
  Mail,
  Calendar,
  FileText,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Lead } from "@/utils/leads/LeadConfig";
import { Property } from "@/types/property";
import { Building } from "@/types/building";

interface Props {
  filteredLeads: Lead[];
  leadData: Lead[];
  activeTab: string;
  setActiveTab: (val: string) => void;
  setSelectedLead: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  handleDeleteFloor: (id: string, e: React.MouseEvent) => void;
  isSalesManager: boolean;
  userCanEditUser: boolean;
  userCanDeleteUser: boolean;
}

export default function PropertyLeadsTab({
  filteredLeads,
  leadData,
  activeTab,
  setActiveTab,
  setSelectedLead,
  onEdit,
  handleDeleteFloor,
  isSalesManager,
  userCanEditUser,
  userCanDeleteUser,
}: Props) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="p-4 pb-0">
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All Leads</TabsTrigger>
            <TabsTrigger value="hot">Hot</TabsTrigger>
            <TabsTrigger value="warm">Warm</TabsTrigger>
            <TabsTrigger value="cold">Cold</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="p-0">
        {/* Desktop table */}
        <Table className="hidden sm:table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Property</TableHead>
              <TableHead>Property Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Last Action
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState />
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map((lead) => {
                const statusColors = {
                  hot: "bg-estate-error/20 text-estate-error",
                  warm: "bg-estate-gold/20 text-estate-gold",
                  cold: "bg-estate-teal/20 text-estate-teal",
                };

                const propertyStatusColors: Record<string, string> = {
                  New: "bg-blue-100 text-blue-800",
                  Enquiry: "bg-yellow-100 text-yellow-800",
                  Assigned: "bg-purple-100 text-purple-800",
                  "Follow up": "bg-orange-100 text-orange-800",
                  "In Progress": "bg-indigo-100 text-indigo-800",
                  Closed: "bg-green-100 text-green-800",
                  Rejected: "bg-red-100 text-red-800",
                };

                const leadUnit = lead.unit as Property;
                const leadProperty = lead.property as Building;

                const propertyDisplayName = leadUnit
                  ? `${leadProperty?.propertyType} - ${leadUnit?.plotNo}`
                  : "N/A";

                return (
                  <TableRow key={lead._id}>
                    <TableCell>
                      <LeadUserCell lead={lead} />
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          statusColors[lead.status as keyof typeof statusColors]
                        }
                      >
                        {lead.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {propertyDisplayName}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={
                          propertyStatusColors[
                            lead.propertyStatus as keyof typeof propertyStatusColors
                          ]
                        }
                      >
                        {lead.propertyStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {lead.lastContact
                        ? formatDistanceToNow(new Date(lead.lastContact), {
                            addSuffix: true,
                          })
                        : "N/A"}
                    </TableCell>

                    <TableCell>
                      <ActionsMenu
                        lead={lead}
                        isSalesManager={isSalesManager}
                        userCanEditUser={userCanEditUser}
                        userCanDeleteUser={userCanDeleteUser}
                        onView={() => setSelectedLead(lead)}
                        onEdit={() => onEdit(lead)}
                        onDelete={(e) => handleDeleteFloor(lead._id, e)}
                        onVisit={() => navigate("/visits")}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Mobile cards */}
        <div className="sm:hidden space-y-4 p-4">
          {filteredLeads.length === 0 ? (
            <EmptyState />
          ) : (
            filteredLeads.map((lead) => (
              <MobileLeadCard
                key={lead._id}
                lead={lead}
                isSalesManager={isSalesManager}
                userCanEditUser={userCanEditUser}
                userCanDeleteUser={userCanDeleteUser}
                onView={() => setSelectedLead(lead)}
                onEdit={() => onEdit(lead)}
                onDelete={(e) => handleDeleteFloor(lead._id, e)}
                onVisit={() => navigate("/visits")}
              />
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-4">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{filteredLeads.length}</strong> of{" "}
          <strong>{leadData?.length || 0}</strong> leads
        </div>
      </CardFooter>
    </Card>
  );
}

/* ---------------- helper components ---------------- */

function EmptyState() {
  return (
    <div className="text-center py-12 text-gray-500">
      <div className="text-4xl mb-2">😕</div>
      <h1 className="text-lg font-semibold">No Leads Found</h1>
      <p className="text-sm text-gray-400">
        Try changing your filters or add a new lead.
      </p>
    </div>
  );
}

function LeadUserCell({ lead }: { lead: Lead }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage
          src={`https://ui-avatars.com/api/?name=${lead.name.replace(
            " ",
            "+",
          )}&background=1A365D&color=fff`}
        />
        <AvatarFallback>{lead.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{lead.name}</p>
        <p className="text-xs text-muted-foreground">{lead.email}</p>
      </div>
    </div>
  );
}

function ActionsMenu({
  lead,
  isSalesManager,
  userCanEditUser,
  userCanDeleteUser,
  onView,
  onEdit,
  onDelete,
  onVisit,
}: any) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" onClick={onView}>
        <ChevronRight className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <a href={`tel:${lead.phone}`}>
            <DropdownMenuItem>
              <PhoneCall className="mr-2 h-4 w-4" /> Call
            </DropdownMenuItem>
          </a>
          <a
            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
              lead.email,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" /> Email
            </DropdownMenuItem>
          </a>

          {!isSalesManager && (
            <DropdownMenuItem onClick={onVisit}>
              <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {userCanEditUser && (
            <DropdownMenuItem onClick={onEdit}>
              <FileText className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
          )}

          {userCanDeleteUser && (
            <DropdownMenuItem onClick={onDelete}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function MobileLeadCard({
  lead,
  isSalesManager,
  userCanEditUser,
  userCanDeleteUser,
  onView,
  onEdit,
  onDelete,
  onVisit,
}: any) {
  const statusColors = {
    hot: "bg-estate-error/20 text-estate-error",
    warm: "bg-estate-gold/20 text-estate-gold",
    cold: "bg-estate-teal/20 text-estate-teal",
  };

  const propertyStatusColors: Record<string, string> = {
    New: "bg-blue-100 text-blue-800",
    Enquiry: "bg-yellow-100 text-yellow-800",
    Assigned: "bg-purple-100 text-purple-800",
    "Follow up": "bg-orange-100 text-orange-800",
    "In Progress": "bg-indigo-100 text-indigo-800",
    Closed: "bg-green-100 text-green-800",
    Rejected: "bg-red-100 text-red-800",
  };

  const leadUnit = lead.unit as Property;
  const leadProperty = lead.property as Building;

  const propertyDisplayName = leadUnit
    ? `${leadProperty?.projectName} - ${leadUnit.plotNo}`
    : "N/A";

  return (
    <div className="bg-white border rounded-lg shadow p-4 space-y-2">
      <LeadUserCell lead={lead} />

      <div className="flex justify-between">
        <span className="font-medium">Status:</span>
        <Badge
          className={statusColors[lead.status as keyof typeof statusColors]}
        >
          {lead.status}
        </Badge>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Property:</span>
        <span>{propertyDisplayName}</span>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Property Status:</span>
        <Badge
          className={
            propertyStatusColors[
              lead.propertyStatus as keyof typeof propertyStatusColors
            ]
          }
        >
          {lead.propertyStatus}
        </Badge>
      </div>

      <div className="flex justify-between">
        <span className="font-medium">Last Contact:</span>
        <span>
          {lead.lastContact
            ? formatDistanceToNow(new Date(lead.lastContact), {
                addSuffix: true,
              })
            : "N/A"}
        </span>
      </div>

      <div className="flex gap-2 mt-2">
        <Button size="sm" variant="outline" className="flex-1" onClick={onView}>
          <ChevronRight className="h-4 w-4 mr-1" /> View
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="flex-1">
              <MoreHorizontal className="h-4 w-4 mr-1" /> Actions
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <a href={`tel:${lead.phone}`}>
              <DropdownMenuItem>
                <PhoneCall className="mr-2 h-4 w-4" /> Call
              </DropdownMenuItem>
            </a>
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                lead.email,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <DropdownMenuItem>
                <Mail className="mr-2 h-4 w-4" /> Email
              </DropdownMenuItem>
            </a>

            {!isSalesManager && (
              <DropdownMenuItem onClick={onVisit}>
                <Calendar className="mr-2 h-4 w-4" /> Schedule Visit
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {userCanEditUser && (
              <DropdownMenuItem onClick={onEdit}>
                <FileText className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            )}

            {userCanDeleteUser && (
              <DropdownMenuItem onClick={onDelete}>
                <Trash className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
