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

interface TabItem {
  value: string;
  label: string;
  icon: React.ElementType;
}

const tabItems: TabItem[] = [
  { value: "permission", label: "Permission Matrix", icon: Grid },
  { value: "manage", label: "Manage Roles", icon: Shield },
  { value: "user", label: "User Role Assignment", icon: Users },
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
        <div className="flex items-center gap-2 justify-between">
          <div>
            <h1 className="text-2xl font-bold font-sans">Role Management</h1>
            <p className="text-1xl font-sans">
              Manage user roles and permissions across the system
            </p>
          </div>
          <div className="flex items-center gap-2 font-sans">
            <Shield />
            <h1 className="font-sans">RBAC System</h1>
          </div>
        </div>

        <div className="relative">
          <TabsList className="grid w-full grid-cols-4 relative bg-estate-indigo/20 rounded-md overflow-hidden">
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
                className="relative z-10 flex items-center justify-center font-medium text-sm px-4 py-2 font-sans"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="permission">
          <Permission />
        </TabsContent>

        <TabsContent value="manage">
          <ManageRoles />
        </TabsContent>

        <TabsContent value="user">
          <UserRoleAssignment />
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-sans">
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
