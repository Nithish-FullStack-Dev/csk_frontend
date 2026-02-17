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
          <TableHead>Last Contact</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((lead) => (
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
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
