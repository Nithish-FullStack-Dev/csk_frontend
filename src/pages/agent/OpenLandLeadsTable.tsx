import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  ChevronRight,
  MoreHorizontal,
  PhoneCall,
  Mail,
  FileText,
  Trash,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Lead } from "@/utils/leads/LeadConfig";
import { OpenLand } from "@/types/OpenLand";
import { EmptyState } from "@/utils/agent/EmptyState";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  leads: Lead[];
  setSelectedLead?: (lead: Lead) => void;
  onEdit?: (lead: Lead) => void;
  handleDeleteLead?: (id: string, e: React.MouseEvent) => void;
  userCanEditUser?: boolean;
  userCanDeleteUser?: boolean;
}

export default function OpenLandLeadsTable({
  leads,
  setSelectedLead,
  onEdit,
  handleDeleteLead,
  userCanEditUser,
  userCanDeleteUser,
}: Props) {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const data = leads.filter((l) => l.openLand && !l.openPlot && !l.property);

  if (!data.length) {
    return <EmptyState text="No Open Land Leads Found" />;
  }

  const statusColors: Record<string, string> = {
    hot: "bg-estate-error/20 text-estate-error",
    warm: "bg-estate-gold/20 text-estate-gold",
    cold: "bg-estate-teal/20 text-estate-teal",
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Open Land</TableHead>
          <TableHead>Land Type</TableHead>
          <TableHead>Property Status</TableHead>
          <TableHead>Last Contact</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((lead) => {
          const propertyStatusColors: Record<string, string> = {
            New: "bg-blue-100 text-blue-800",
            Enquiry: "bg-yellow-100 text-yellow-800",
            Assigned: "bg-purple-100 text-purple-800",
            "Follow up": "bg-orange-100 text-orange-800",
            "In Progress": "bg-indigo-100 text-indigo-800",
            Closed: "bg-green-100 text-green-800",
            Rejected: "bg-red-100 text-red-800",
          };
          return (
            <TableRow key={lead._id}>
              <TableCell className="font-medium">{lead.name}</TableCell>

              <TableCell>
                <Badge className={statusColors[lead.status] || ""}>
                  {lead.status}
                </Badge>
              </TableCell>

              <TableCell>{(lead.openLand as OpenLand)?.projectName}</TableCell>

              <TableCell>{(lead.openLand as OpenLand)?.landType}</TableCell>

              <TableCell>
                <Badge
                  className={
                    propertyStatusColors[
                      lead.propertyStatus as keyof typeof propertyStatusColors
                    ]
                  }
                >
                  {lead?.propertyStatus || "N/A"}
                </Badge>
              </TableCell>

              <TableCell>
                {lead.lastContact
                  ? formatDistanceToNow(new Date(lead.lastContact), {
                      addSuffix: true,
                    })
                  : "N/A"}
              </TableCell>

              {/* ACTIONS */}
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {setSelectedLead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}

                  {!isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <a href={`tel:${lead.phone}`}>
                          <DropdownMenuItem>
                            <PhoneCall className="mr-2 h-4 w-4" />
                            Call
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
                            <Mail className="mr-2 h-4 w-4" />
                            Email
                          </DropdownMenuItem>
                        </a>

                        <DropdownMenuSeparator />

                        {userCanEditUser && onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(lead)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}

                        {userCanDeleteUser && handleDeleteLead && (
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteLead(lead._id, e)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
