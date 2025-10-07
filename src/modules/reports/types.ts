export type ReportGroupBy = "day" | "week" | "month" | "quarter" | "year";

export type ReportType =
  | "properties"
  | "users-access"
  | "agents"
  | "team-leads"
  | "sales-managers"
  | "contractors"
  | "site-incharge"
  | "accounting";

export interface ReportFilters {
  dateFrom: Date;
  dateTo: Date;
  groupBy: ReportGroupBy;
  search?: string;
  propertyId?: string;
  agentId?: string;
  teamLeadId?: string;
  salesManagerId?: string;
  contractorId?: string;
  siteInchargeId?: string;
}

export interface ReportMetric {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: "currency" | "percent" | "number";
}

export interface ColumnConfig {
  key: string;
  header: string;
  format?: "currency" | "percent" | "number" | "date";
  align?: "left" | "center" | "right";
}

export interface ReportConfig {
  id: ReportType;
  title: string;
  description: string;
  icon: any;
  category: string;
  roles: string[];
  columns: ColumnConfig[];
}

// Report data shapes
export interface PropertiesReportRow {
  period: string;
  propertyId: string;
  propertyName: string;
  totalUnits: number;
  soldUnits: number;
  availableUnits: number;
  sellThroughPercent: number;
  bookings: number;
  revenue: number;
  avgDealSize: number;
}

export interface UserAccessReportRow {
  userId: string;
  name: string;
  role: string;
  eventType: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface AgentReportRow {
  agentId: string;
  agentName: string;
  period: string;
  leadsAdded: number;
  enquiries: number;
  siteBookings: number;
  leadsClosed: number;
  conversionRate: number;
}

export interface TeamLeadReportRow {
  teamLeadId: string;
  teamLeadName: string;
  period: string;
  teamMembers: number;
  leadsClosed: number;
  siteBookingsApproved: number;
  siteBookingsRejected: number;
  totalSales: number;
}

export interface SalesManagerReportRow {
  managerId: string;
  managerName: string;
  period: string;
  bookings: number;
  dealsWon: number;
  revenue: number;
  avgDealSize: number;
}

export interface ContractorReportRow {
  contractorId: string;
  contractorName: string;
  period: string;
  tasksCreated: number;
  tasksApproved: number;
  tasksRejected: number;
  invoicesCount: number;
  photoEvidenceCount: number;
  avgProgressPercent: number;
}

export interface SiteInchargeReportRow {
  siteInchargeId: string;
  name: string;
  period: string;
  projectsActive: number;
  qcTasksCreated: number;
  tasksVerified: number;
  inspections: number;
  avgProgressPercent: number;
}

export interface AccountingReportRow {
  period: string;
  revenueTotal: number;
  invoicesReceived: number;
  invoicesApproved: number;
  invoicesRejected: number;
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  taxUploads: number;
  taxClaims: number;
  budgetAllocated: number;
  budgetUsed: number;
  budgetUtilizedPercent: number;
}
