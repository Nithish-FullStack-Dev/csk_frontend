import MainLayout from "@/components/layout/MainLayout";
import ProfileForm from "@/components/profile/ProfileForm";
import RoleSpecificStats from "@/components/profile/RoleSpecificStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Calendar, Clock } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  const getPermissions = () => {
    const permissions = {
      owner: [
        "Full System Access",
        "User Management",
        "Financial Reports",
        "System Settings",
      ],
      admin: [
        "User Management",
        "Content Management",
        "System Configuration",
        "Reports",
      ],
      sales_manager: [
        "Team Management",
        "Sales Reports",
        "Commission Management",
        "Lead Assignment",
      ],
      team_lead: [
        "Team Coordination",
        "Task Assignment",
        "Performance Review",
        "Site Visits",
      ],
      agent: [
        "Lead Management",
        "Client Communication",
        "Site Visits",
        "Commission Tracking",
      ],
      site_incharge: [
        "Site Monitoring",
        "Quality Control",
        "Contractor Management",
        "Progress Reports",
      ],
      contractor: [
        "Task Management",
        "Material Requests",
        "Invoice Creation",
        "Progress Updates",
      ],
      accountant: [
        "Financial Management",
        "Tax Documents",
        "Budget Tracking",
        "Invoice Processing",
      ],
      customer_purchased: [
        "Property Access",
        "Payment History",
        "Document Access",
        "Support",
      ],
      customer_prospect: [
        "Property Browsing",
        "Site Visits",
        "Application Tracking",
        "Support",
      ],
    };
    return permissions[user?.role as keyof typeof permissions] || [];
  };

  return (
    <MainLayout>
      <div className="space-y-6 p-0 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h1 className="text-2xl sm:text-3xl font-md font-vidaloka">
            Profile
          </h1>
          <div className="flex items-center gap-2 text-sm sm:text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {user && user.updatedAt && (
              <span className="text-muted-foreground">
                Last updated:{" "}
                {new Date(user.updatedAt).toLocaleDateString("en-GB")}
              </span>
            )}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileForm />
            {/* <RoleSpecificStats /> */}
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans text-base sm:text-lg">
                  <Shield className="h-5 w-5" />
                  Permissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {getPermissions().map((permission, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="whitespace-nowrap"
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-sans text-base sm:text-lg">
                  <Calendar className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-0">
                  <span className="text-muted-foreground font-sans">
                    Member Since:
                  </span>
                  <span>
                    {user &&
                      user.createdAt &&
                      new Date(user.createdAt).toLocaleString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-0">
                  <span className="text-muted-foreground font-sans">
                    Account Status:
                  </span>
                  <Badge variant="default" className="bg-green-500 w-fit">
                    Active
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between text-sm gap-1 sm:gap-0">
                  <span className="text-muted-foreground font-sans">
                    Last Login:
                  </span>
                  <span>
                    {user &&
                      user.lastLogin &&
                      new Date(user.lastLogin).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
