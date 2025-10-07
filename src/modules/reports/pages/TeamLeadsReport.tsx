import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, TeamLeadReportRow, ReportMetric } from "../types";
import { reportColumns } from "../utils/columns";
import {
  subDays,
  format,
  isWithinInterval,
  startOfWeek,
  subMonths,
  subQuarters,
  subYears,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import axios from "axios";
import { fetchAllLeads, Lead } from "@/pages/agent/LeadManagement";
import { fetchAllSiteVisits, SiteVisitData } from "@/pages/agent/SiteVisits";
import { TeamMember } from "@/pages/TeamManagement";

const fetchAllTeamMembers = async (): Promise<TeamMember[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/team/getAllTeamMembers`,
    { withCredentials: true }
  );
  return data || [];
};

interface TeamLead extends User {
  role: "team_lead";
}

const fetchAllTeamLeads = async (): Promise<TeamLead[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_URL}/api/teamLead/getAllTeamLeads`,
    { withCredentials: true }
  );
  return data || [];
};

export default function TeamLeadsReport() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
    search: "",
  });

  const {
    data: leadData = [],
    isLoading: isLeadsLoading,
    isError: isLeadsError,
    error: leadsError,
  } = useQuery<Lead[]>({
    queryKey: ["allLeads"],
    queryFn: fetchAllLeads,
    staleTime: 0,
  });

  const {
    data: siteVisits = [],
    isLoading: isSiteVisitsLoading,
    isError: isSiteVisitsError,
    error: siteVisitsError,
  } = useQuery<SiteVisitData[]>({
    queryKey: ["allSiteVisits"],
    queryFn: fetchAllSiteVisits,
    staleTime: 0,
  });

  const {
    data: allTeamMembers = [],
    isLoading: isTeamMembersLoading,
    isError: isTeamMembersError,
    error: teamMembersError,
  } = useQuery<TeamMember[]>({
    queryKey: ["allTeamMembers"],
    queryFn: fetchAllTeamMembers,
    staleTime: 0,
  });

  const {
    data: teamLeads = [],
    isLoading: isTeamLeadsLoading,
    isError: isTeamLeadsError,
    error: teamLeadsError,
  } = useQuery<TeamLead[]>({
    queryKey: ["allTeamLeads"],
    queryFn: fetchAllTeamLeads,
    staleTime: 0,
  });

  const computeReportData = useMemo(() => {
    return (
      dateFrom: Date,
      dateTo: Date,
      groupBy: string,
      search: string = ""
    ) => {
      // The only required data is teamLeads to structure the report
      if (!teamLeads.length) return [];

      const filteredLeads = leadData.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return isWithinInterval(leadDate, { start: dateFrom, end: dateTo });
      });

      const filteredSiteVisits = siteVisits.filter((visit) => {
        const visitDate = new Date(visit.date);
        return isWithinInterval(visitDate, { start: dateFrom, end: dateTo });
      });

      const agentToLeadMap = new Map<string, string>();
      allTeamMembers.forEach((teamMember) => {
        const agentId = teamMember.agentId?._id;
        const leadId = teamMember.teamLeadId?._id;
        if (agentId && leadId) {
          agentToLeadMap.set(agentId, leadId);
        }
      });

      const leadGroups: Record<string, Record<string, number>> = {};
      filteredLeads.forEach((lead) => {
        if (lead.propertyStatus === "Closed") {
          const agentId = (lead.addedBy as any)?._id;
          const leadId = agentToLeadMap.get(agentId);
          if (!leadId) return;

          let periodKey: string;
          const leadDate = new Date(lead.createdAt);

          switch (groupBy) {
            case "day":
              periodKey = format(leadDate, "MMM dd, yyyy");
              break;
            case "week":
              periodKey = `Week of ${format(startOfWeek(leadDate), "MMM dd")}`;
              break;
            case "month":
              periodKey = format(leadDate, "MMM yyyy");
              break;
            case "quarter":
              periodKey = `Q${
                Math.floor(leadDate.getMonth() / 3) + 1
              } ${leadDate.getFullYear()}`;
              break;
            case "year":
              periodKey = format(leadDate, "yyyy");
              break;
            default:
              periodKey = format(leadDate, "MMM yyyy");
          }

          if (!leadGroups[leadId]) leadGroups[leadId] = {};
          if (!leadGroups[leadId][periodKey]) leadGroups[leadId][periodKey] = 0;
          leadGroups[leadId][periodKey] += 1;
        }
      });

      const approvedGroups: Record<string, Record<string, number>> = {};
      const rejectedGroups: Record<string, Record<string, number>> = {};
      filteredSiteVisits.forEach((visit) => {
        const agentId =
          typeof visit.bookedBy === "string"
            ? visit.bookedBy
            : (visit.bookedBy as any)?._id;
        const leadId = agentToLeadMap.get(agentId);
        if (!leadId) return;

        let periodKey: string;
        const visitDate = new Date(visit.date);

        switch (groupBy) {
          case "day":
            periodKey = format(visitDate, "MMM dd, yyyy");
            break;
          case "week":
            periodKey = `Week of ${format(startOfWeek(visitDate), "MMM dd")}`;
            break;
          case "month":
            periodKey = format(visitDate, "MMM yyyy");
            break;
          case "quarter":
            periodKey = `Q${
              Math.floor(visitDate.getMonth() / 3) + 1
            } ${visitDate.getFullYear()}`;
            break;
          case "year":
            periodKey = format(visitDate, "yyyy");
            break;
          default:
            periodKey = format(visitDate, "MMM yyyy");
        }

        if (!approvedGroups[leadId]) approvedGroups[leadId] = {};
        if (!rejectedGroups[leadId]) rejectedGroups[leadId] = {};

        if (visit.status === "confirmed") {
          if (!approvedGroups[leadId][periodKey])
            approvedGroups[leadId][periodKey] = 0;
          approvedGroups[leadId][periodKey] += 1;
        } else if (visit.status === "cancelled") {
          if (!rejectedGroups[leadId][periodKey])
            rejectedGroups[leadId][periodKey] = 0;
          rejectedGroups[leadId][periodKey] += 1;
        }
      });

      const teamSizePerLead = new Map<string, number>();
      allTeamMembers.forEach((teamMember) => {
        const leadId = teamMember.teamLeadId?._id;
        if (leadId) {
          teamSizePerLead.set(leadId, (teamSizePerLead.get(leadId) || 0) + 1);
        }
      });

      const reportRows: TeamLeadReportRow[] = [];
      teamLeads.forEach((teamLead) => {
        if (
          search &&
          !teamLead.name.toLowerCase().includes(search.toLowerCase())
        )
          return;

        const leadPeriods = Object.keys(leadGroups[teamLead._id] || {});
        const approvedPeriods = Object.keys(approvedGroups[teamLead._id] || {});
        const rejectedPeriods = Object.keys(rejectedGroups[teamLead._id] || {});
        const allPeriods = [
          ...new Set([...leadPeriods, ...approvedPeriods, ...rejectedPeriods]),
        ];

        // Recalculate sales for the team lead regardless of activity period
        const totalSales = allTeamMembers
          .filter((tm) => tm.teamLeadId?._id === teamLead._id)
          .reduce((sum, tm) => sum + (tm.performance?.sales || 0), 0);

        // If there is activity in the current period, create a row for each period
        if (allPeriods.length > 0) {
          allPeriods.forEach((period) => {
            const teamMembersCount = teamSizePerLead.get(teamLead._id) || 0;
            const leadsClosed = leadGroups[teamLead._id]?.[period] || 0;
            const siteBookingsApproved =
              approvedGroups[teamLead._id]?.[period] || 0;
            const siteBookingsRejected =
              rejectedGroups[teamLead._id]?.[period] || 0;

            reportRows.push({
              teamLeadId: teamLead._id,
              teamLeadName: teamLead.name,
              period,
              teamMembers: teamMembersCount,
              totalSales,
              leadsClosed,
              siteBookingsApproved,
              siteBookingsRejected,
            });
          });
        }
        // If there is no activity in the period, but the Team Lead exists,
        // add a single row to show the Team Lead and their team size/sales
        else if (teamSizePerLead.get(teamLead._id) > 0 || totalSales > 0) {
          reportRows.push({
            teamLeadId: teamLead._id,
            teamLeadName: teamLead.name,
            period: "N/A",
            teamMembers: teamSizePerLead.get(teamLead._id) || 0,
            totalSales,
            leadsClosed: 0,
            siteBookingsApproved: 0,
            siteBookingsRejected: 0,
          });
        }
      });

      return reportRows.sort((a, b) =>
        a.teamLeadName.localeCompare(b.teamLeadName)
      );
    };
  }, [leadData, siteVisits, allTeamMembers, teamLeads]);

  if (
    isLeadsLoading ||
    isSiteVisitsLoading ||
    isTeamMembersLoading ||
    isTeamLeadsLoading
  ) {
    return <Loader />;
  }

  if (
    isLeadsError ||
    isSiteVisitsError ||
    isTeamMembersError ||
    isTeamLeadsError
  ) {
    console.error("Fetch errors:", {
      leadsError,
      siteVisitsError,
      teamMembersError,
      teamLeadsError,
    });
  }

  const currentData = computeReportData(
    filters.dateFrom,
    filters.dateTo,
    filters.groupBy,
    filters.search
  );

  const getPreviousDateRange = (
    dateFrom: Date,
    dateTo: Date,
    groupBy: string
  ) => {
    let prevFrom: Date, prevTo: Date;
    switch (groupBy) {
      case "month":
        prevFrom = subMonths(dateFrom, 1);
        prevTo = subMonths(dateTo, 1);
        break;
      case "quarter":
        prevFrom = subQuarters(dateFrom, 1);
        prevTo = subQuarters(dateTo, 1);
        break;
      case "year":
        prevFrom = subYears(dateFrom, 1);
        prevTo = subYears(dateTo, 1);
        break;
      default:
        prevFrom = subDays(dateFrom, 30);
        prevTo = subDays(dateTo, 30);
    }
    return { prevFrom, prevTo };
  };

  const { prevFrom, prevTo } = getPreviousDateRange(
    filters.dateFrom,
    filters.dateTo,
    filters.groupBy
  );
  const previousData = computeReportData(
    prevFrom,
    prevTo,
    filters.groupBy,
    filters.search
  );

  const getTotals = (data: TeamLeadReportRow[]) => ({
    totalClosed: data.reduce((sum, row) => sum + row.leadsClosed, 0),
    totalApproved: data.reduce((sum, row) => sum + row.siteBookingsApproved, 0),
    totalRejected: data.reduce((sum, row) => sum + row.siteBookingsRejected, 0),
    totalSales: data.reduce((sum, row) => sum + row.totalSales, 0),
    totalTeamSize: data.reduce((sum, row) => sum + row.teamMembers, 0),
  });

  const currentTotals = getTotals(currentData);
  const previousTotals = getTotals(previousData);

  const computeTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: false };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: current > previous };
  };

  const metrics: ReportMetric[] = [
    {
      label: "Total Leads Closed",
      value: currentTotals.totalClosed,
      format: "number" as const,
      trend: computeTrend(
        currentTotals.totalClosed,
        previousTotals.totalClosed
      ),
    },
    {
      label: "Total Sales",
      value: currentTotals.totalSales,
      format: "currency" as const,
      trend: computeTrend(currentTotals.totalSales, previousTotals.totalSales),
    },
    {
      label: "Bookings Approved",
      value: currentTotals.totalApproved,
      format: "number" as const,
      trend: computeTrend(
        currentTotals.totalApproved,
        previousTotals.totalApproved
      ),
    },
    {
      label: "Bookings Rejected",
      value: currentTotals.totalRejected,
      format: "number" as const,
      trend: computeTrend(
        currentTotals.totalRejected,
        previousTotals.totalRejected
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Team Lead Report</h1>
            <p className="text-muted-foreground">
              Team performance, incentives, and vehicle tracking
            </p>
          </div>
          <ExportButton
            reportTitle="Team Lead Report"
            data={currentData}
            columns={reportColumns["team-leads"]}
            filters={filters}
          />
        </div>

        <FilterBar filters={filters} onFiltersChange={setFilters} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Team Lead Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={reportColumns["team-leads"]}
              data={currentData}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
