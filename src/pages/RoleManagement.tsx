import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Home,
  Users,
  Building,
  Image,
  MapPin,
  Grid,
  Settings,
} from "lucide-react";
import ContactCMS from "@/components/cms/ContactCMS";
import MainLayout from "@/components/layout/MainLayout";
import Permission from "@/components/roles/Permission ";
import ManageRoles from "@/components/roles/ManageRoles";
import UserRoleAssignment from "@/components/roles/UserRoleAssignment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TabItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  { value: "permission", label: "Permission Matrix", icon: Grid },
  { value: "manage", label: "Manage Roles", icon: Shield },
  { value: "system", label: "System Settings", icon: Settings },
];

const RoleManagement = () => {
  const [activeTab, setActiveTab] = useState("permission");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const currentRef = tabRefs.current[activeTab];
    if (currentRef) {
      const rect = currentRef.getBoundingClientRect();
      const parentRect = currentRef.parentElement!.getBoundingClientRect();
      setIndicatorStyle({
        left: rect.left - parentRect.left,
        width: rect.width,
      });
    }
  }, [activeTab]);

  return (
    <MainLayout>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-2 justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-sans">
              Role Management
            </h1>
            <p className="text-base md:text-lg font-sans">
              Manage user roles and permissions across the system
            </p>
          </div>
          <div className="flex items-center gap-2 font-sans">
            <Shield className="w-5 h-5 md:w-6 md:h-6" />
            <h1 className="text-sm md:text-base font-sans">RBAC System</h1>
          </div>
        </div>

        {/* Mobile: Dropdown */}
        {/* Mobile: Dropdown using shadcn/ui Select */}
        <div className="md:hidden">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full p-2 border rounded-md bg-white text-sm font-sans">
              <SelectValue placeholder="Select a tab" />
            </SelectTrigger>
            <SelectContent>
              {tabItems.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tabs with sliding indicator */}
        <div className="relative overflow-x-auto hidden md:block">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 relative bg-estate-indigo/20 rounded-md overflow-hidden min-w-max">
            <motion.div
              className="absolute top-0 bottom-0 h-[85%] my-auto bg-white rounded-md shadow-md z-0 transition-all"
              layout
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
            />
            {tabItems.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                ref={(el) => (tabRefs.current[tab.value] = el)}
                className="relative z-10 flex items-center justify-center gap-1 md:gap-2 font-medium text-xs md:text-sm px-2 md:px-4 py-2 font-sans whitespace-nowrap"
              >
                <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab contents */}
        <TabsContent value="permission">
          <Permission />
        </TabsContent>

        <TabsContent value="manage">
          <ManageRoles />
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-sans text-sm md:text-base">
                Advanced RBAC configuration and audit settings will be available
                here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <ContactCMS />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default RoleManagement;
