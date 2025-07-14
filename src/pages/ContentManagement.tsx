import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, Building, Users, Image, MapPin } from "lucide-react";
import HeroSectionCMS from "@/components/cms/HeroSectionCMS";
import AboutSectionCMS from "@/components/cms/AboutSectionCMS";
import PropertiesCMS from "@/components/cms/PropertiesCMS";
import ContactCMS from "@/components/cms/ContactCMS";
import MainLayout from "@/components/layout/MainLayout";

const tabItems = [
  { value: "hero", label: "Hero Section", icon: Home },
  { value: "about", label: "About Section", icon: Users },
  { value: "gallery", label: "Gallery", icon: Image },
  { value: "contact", label: "Contact Info", icon: MapPin },
];

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState("hero");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
  });

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
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Content Management System</h1>
            <p className="text-muted-foreground">
              Manage all visual components of your public website
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live Website
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="relative">
            <TabsList className="grid w-full grid-cols-4 relative bg-estate-indigo/20 rounded-md overflow-hidden">
              {/* Animated indicator */}
              <motion.div
                className="absolute top-0 bottom-0 h-[85%] my-auto bg-white rounded-md shadow-md z-0"
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                }}
              />

              {tabItems.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  ref={(el) => (tabRefs.current[value] = el)}
                  className={`flex items-center gap-2 z-10 relative transition-all duration-300 ${
                    activeTab === value
                      ? "text-black font-semibold"
                      : "text-gray"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="hero">
            <HeroSectionCMS />
          </TabsContent>

          <TabsContent value="about">
            <AboutSectionCMS />
          </TabsContent>

          <TabsContent value="gallery">
            <Card>
              <CardHeader>
                <CardTitle>Gallery Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Gallery management coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact">
            <ContactCMS />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ContentManagement;
