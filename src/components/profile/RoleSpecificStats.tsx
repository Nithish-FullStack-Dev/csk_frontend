import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Users,
  TrendingUp,
  Calendar,
  CheckCircle,
  DollarSign,
  FileText,
  Award,
  Clock,
  Target,
} from "lucide-react";

const RoleSpecificStats = () => {
  const { user } = useAuth();

  const getStatsForRole = () => {
    switch (user?.role) {
      case "owner":
        return [
          {
            label: "Total Properties",
            value: "24",
            icon: Building,
            color: "text-blue-500",
          },
          {
            label: "Active Projects",
            value: "8",
            icon: TrendingUp,
            color: "text-green-500",
          },
          {
            label: "Total Revenue",
            value: "₹2.4Cr",
            icon: DollarSign,
            color: "text-purple-500",
          },
          {
            label: "Team Members",
            value: "156",
            icon: Users,
            color: "text-orange-500",
          },
        ];

      case "admin":
        return [
          {
            label: "Users Managed",
            value: "156",
            icon: Users,
            color: "text-blue-500",
          },
          {
            label: "System Uptime",
            value: "99.9%",
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Support Tickets",
            value: "23",
            icon: FileText,
            color: "text-yellow-500",
          },
          {
            label: "Data Backups",
            value: "Daily",
            icon: Clock,
            color: "text-purple-500",
          },
        ];

      case "sales_manager":
        return [
          {
            label: "Team Size",
            value: "12",
            icon: Users,
            color: "text-blue-500",
          },
          {
            label: "Monthly Sales",
            value: "₹45L",
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            label: "Conversion Rate",
            value: "24%",
            icon: Target,
            color: "text-purple-500",
          },
          {
            label: "Active Leads",
            value: "89",
            icon: TrendingUp,
            color: "text-orange-500",
          },
        ];

      case "team_lead":
        return [
          {
            label: "Team Members",
            value: "8",
            icon: Users,
            color: "text-blue-500",
          },
          {
            label: "Completed Tasks",
            value: "156",
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Pending Approvals",
            value: "12",
            icon: Clock,
            color: "text-yellow-500",
          },
          {
            label: "Team Performance",
            value: "92%",
            icon: Award,
            color: "text-purple-500",
          },
        ];

      case "agent":
        return [
          {
            label: "Active Leads",
            value: "23",
            icon: Users,
            color: "text-blue-500",
          },
          {
            label: "Properties Sold",
            value: "8",
            icon: Building,
            color: "text-green-500",
          },
          {
            label: "Commission Earned",
            value: "₹2.4L",
            icon: DollarSign,
            color: "text-purple-500",
          },
          {
            label: "Site Visits",
            value: "34",
            icon: Calendar,
            color: "text-orange-500",
          },
        ];

      case "site_incharge":
        return [
          {
            label: "Active Projects",
            value: "6",
            icon: Building,
            color: "text-blue-500",
          },
          {
            label: "Inspections Done",
            value: "89",
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Quality Issues",
            value: "3",
            icon: Clock,
            color: "text-yellow-500",
          },
          {
            label: "Contractors",
            value: "15",
            icon: Users,
            color: "text-purple-500",
          },
        ];

      case "contractor":
        return [
          {
            label: "Active Projects",
            value: "4",
            icon: Building,
            color: "text-blue-500",
          },
          {
            label: "Completed Tasks",
            value: "67",
            icon: CheckCircle,
            color: "text-green-500",
          },
          {
            label: "Pending Invoices",
            value: "₹3.2L",
            icon: DollarSign,
            color: "text-yellow-500",
          },
          {
            label: "Team Size",
            value: "25",
            icon: Users,
            color: "text-purple-500",
          },
        ];

      case "accountant":
        return [
          {
            label: "Monthly Budget",
            value: "₹15L",
            icon: DollarSign,
            color: "text-blue-500",
          },
          {
            label: "Processed Invoices",
            value: "234",
            icon: FileText,
            color: "text-green-500",
          },
          {
            label: "Tax Compliance",
            value: "100%",
            icon: CheckCircle,
            color: "text-purple-500",
          },
          {
            label: "Pending Payments",
            value: "12",
            icon: Clock,
            color: "text-yellow-500",
          },
        ];

      case "customer_purchased":
        return [
          {
            label: "Properties Owned",
            value: "2",
            icon: Building,
            color: "text-blue-500",
          },
          {
            label: "Total Investment",
            value: "₹1.2Cr",
            icon: DollarSign,
            color: "text-green-500",
          },
          {
            label: "Construction Progress",
            value: "65%",
            icon: TrendingUp,
            color: "text-purple-500",
          },
          {
            label: "Documents",
            value: "18",
            icon: FileText,
            color: "text-orange-500",
          },
        ];

      case "customer_prospect":
        return [
          {
            label: "Properties Viewed",
            value: "12",
            icon: Building,
            color: "text-blue-500",
          },
          {
            label: "Site Visits",
            value: "5",
            icon: Calendar,
            color: "text-green-500",
          },
          {
            label: "Wishlist Items",
            value: "8",
            icon: Target,
            color: "text-purple-500",
          },
          {
            label: "Budget Range",
            value: "₹80L-1Cr",
            icon: DollarSign,
            color: "text-orange-500",
          },
        ];

      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 rounded-lg border bg-muted/50"
            >
              <stat.icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold font-sans">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-sans">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSpecificStats;
