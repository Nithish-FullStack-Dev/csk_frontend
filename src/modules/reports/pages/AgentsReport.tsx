import { useState, useMemo } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterBar } from "../components/FilterBar";
import { MetricCard } from "../components/MetricCard";
import { DataTable } from "../components/DataTable";
import { ExportButton } from "../components/ExportButton";
import { ReportFilters, AgentReportRow, ReportMetric } from "../types";
import { reportColumns } from "../utils/columns";
import {
  subDays,
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  addMonths,
  subMonths,
  addQuarters,
  subQuarters,
  addYears,
  subYears,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { User } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/Loader";
import axios from "axios";
import { fetchAllSiteVisits } from "@/pages/agent/SiteVisits";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchAllAgents, fetchAllLeads, Lead } from "@/utils/leads/LeadConfig";

export interface SiteVisitData {
  _id: string;
  clientId: Lead;
  vehicleId: any; // Vehicle type from SiteVisits
  date: string;
  time: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  notes?: string;
  bookedBy: string | User; // Updated: Can be string OR User object (per your API)
  priority: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
}

export default function AgentsReport() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilters>({
    dateFrom: subDays(new Date(), 30),
    dateTo: new Date(),
    groupBy: "month",
    search: "",
  });

  // Fetch all leads
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

  // Fetch all agents
  const {
    data: agents = [],
    isLoading: isAgentsLoading,
    isError: isAgentsError,
    error: agentsError,
  } = useQuery<User[]>({
    queryKey: ["agents"],
    queryFn: fetchAllAgents,
    staleTime: 0,
  });

  // Fetch all site visits (for siteBookings computation)
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

  // Helper: Compute data for a given date range and groupBy
  const computeReportData = useMemo(() => {
    return (
      dateFrom: Date,
      dateTo: Date,
      groupBy: string,
      search: string = ""
    ) => {
      if (!leadData.length || !agents.length || !siteVisits.length) return [];

      // Filter leads by date range
      const filteredLeads = leadData.filter((lead) => {
        const leadDate = new Date(lead.createdAt);
        return isWithinInterval(leadDate, { start: dateFrom, end: dateTo });
      });

      // Filter site visits by date range
      const filteredSiteVisits = siteVisits.filter((visit) => {
        const visitDate = new Date(visit.date);
        return isWithinInterval(visitDate, { start: dateFrom, end: dateTo });
      });

      // Group leads by agent and period
      const agentPeriodGroups: Record<string, Record<string, Lead[]>> = {};
      agents.forEach((agent) => {
        agentPeriodGroups[agent._id] = {};
        const agentLeads = filteredLeads.filter(
          (lead) => lead.addedBy._id === agent._id
        );
        agentLeads.forEach((lead) => {
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

          if (!agentPeriodGroups[agent._id][periodKey]) {
            agentPeriodGroups[agent._id][periodKey] = [];
          }
          agentPeriodGroups[agent._id][periodKey].push(lead);
        });
      });

      // Group site visits by agent and period
      const agentSiteVisitGroups: Record<
        string,
        Record<string, SiteVisitData[]>
      > = {};
      agents.forEach((agent) => {
        agentSiteVisitGroups[agent._id] = {};
        const agentVisits = filteredSiteVisits.filter((visit) => {
          const bookedById =
            typeof visit.bookedBy === "string"
              ? visit.bookedBy
              : visit.bookedBy?._id;
          return bookedById === agent._id;
        });
        agentVisits.forEach((visit) => {
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

          if (!agentSiteVisitGroups[agent._id][periodKey]) {
            agentSiteVisitGroups[agent._id][periodKey] = [];
          }
          agentSiteVisitGroups[agent._id][periodKey].push(visit);
        });
      });

      // Compute metrics using UNION of lead & visit periods
      const reportRows: AgentReportRow[] = [];
      agents.forEach((agent) => {
        const leadPeriods = Object.keys(agentPeriodGroups[agent._id] || {});
        const visitPeriods = Object.keys(agentSiteVisitGroups[agent._id] || {});
        const allPeriods = [...new Set([...leadPeriods, ...visitPeriods])];

        allPeriods.forEach((period) => {
          const leads = agentPeriodGroups[agent._id]?.[period] || [];
          const totalLeads = leads.length;

          const enquiries = leads.filter((lead) =>
            ["New", "Assigned", "Follow up"].includes(lead.propertyStatus)
          ).length;

          const siteVisitPeriod =
            agentSiteVisitGroups[agent._id]?.[period] || [];
          const siteBookings = siteVisitPeriod.filter((visit) =>
            ["confirmed", "pending"].includes(visit.status)
          ).length;

          const leadsClosed = leads.filter(
            (lead) => lead.propertyStatus === "Closed"
          ).length;

          const conversionRate =
            totalLeads > 0 ? (leadsClosed / totalLeads) * 100 : 0;

          if (
            search &&
            !agent.name.toLowerCase().includes(search.toLowerCase())
          ) {
            return;
          }

          if (totalLeads > 0 || siteBookings > 0) {
            reportRows.push({
              agentId: agent._id,
              agentName: agent.name,
              period,
              leadsAdded: totalLeads,
              enquiries,
              siteBookings,
              leadsClosed,
              conversionRate: Number(conversionRate.toFixed(1)),
            });
          }
        });
      });

      return reportRows.sort((a, b) => {
        if (a.agentName === b.agentName) {
          return a.period.localeCompare(b.period);
        }
        return a.agentName.localeCompare(b.agentName);
      });
    };
  }, [leadData, agents, siteVisits]);

  // Current period data
  const currentData = computeReportData(
    filters.dateFrom,
    filters.dateTo,
    filters.groupBy,
    filters.search
  );

  // Previous period data (dynamic based on groupBy)
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
      default: // day/week: fallback to 30 days prior
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

  // Compute totals for current and previous
  const getTotals = (data: AgentReportRow[]) => ({
    totalLeads: data.reduce((sum, row) => sum + row.leadsAdded, 0),
    totalClosed: data.reduce((sum, row) => sum + row.leadsClosed, 0),
    totalBookings: data.reduce((sum, row) => sum + row.siteBookings, 0),
    avgConversion:
      data.length > 0
        ? data.reduce((sum, row) => sum + row.conversionRate, 0) / data.length
        : 0,
  });

  const currentTotals = getTotals(currentData);
  const previousTotals = getTotals(previousData);

  // Compute trend for a metric
  const computeTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: false };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: current > previous };
  };

  // Dynamic metrics with trends
  const metrics: ReportMetric[] = [
    {
      label: "Total Leads",
      value: currentTotals.totalLeads,
      format: "number" as const,
      trend: computeTrend(currentTotals.totalLeads, previousTotals.totalLeads),
    },
    {
      label: "Leads Closed",
      value: currentTotals.totalClosed,
      format: "number" as const,
      trend: computeTrend(
        currentTotals.totalClosed,
        previousTotals.totalClosed
      ),
    },
    {
      label: "Site Bookings",
      value: currentTotals.totalBookings,
      format: "number" as const,
      trend: computeTrend(
        currentTotals.totalBookings,
        previousTotals.totalBookings
      ),
    },
    {
      label: "Avg Conversion",
      value: currentTotals.avgConversion,
      format: "percent" as const,
      trend: computeTrend(
        currentTotals.avgConversion,
        previousTotals.avgConversion
      ),
    },
  ];

  if (isLeadsLoading || isAgentsLoading || isSiteVisitsLoading) {
    return <Loader />;
  }

  if (isLeadsError) {
    console.error("Error fetching leads:", leadsError);
    // Optionally render error UI
  }

  if (isAgentsError) {
    console.error("Error fetching agents:", agentsError);
    // Optionally render error UI
  }

  if (isSiteVisitsError) {
    console.error("Error fetching site visits:", siteVisitsError);
    // Optionally render error UI
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/reports")}
              className="mb-4"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Buildings
            </Button>
            <h1 className="text-3xl font-bold">Agent Performance Report</h1>
            <p className="text-muted-foreground">
              Track leads, enquiries, and conversion metrics for all agents
            </p>
          </div>
          <ExportButton
            reportTitle="Agent Performance Report"
            data={currentData}
            columns={reportColumns.agents}
            filters={filters}
          />
        </div>

        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          showSearch={true} // Enable search for agent names
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agent Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={reportColumns.agents} data={currentData} />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
