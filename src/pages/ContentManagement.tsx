import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Home, Users, Image, MapPin } from "lucide-react";
import HeroSectionCMS from "@/components/cms/HeroSectionCMS";
import AboutSectionCMS from "@/components/cms/AboutSectionCMS";
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
      <div className="p-0 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Content Management System
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage all visual components of your public website
            </p>
          </div>
          <Badge
            variant="secondary"
            className="self-start md:self-auto bg-green-100 text-green-800"
          >
            Live Website
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="relative">
            <TabsList
              className="
                flex md:grid w-full md:grid-cols-4 
                overflow-x-auto md:overflow-hidden
                scrollbar-hide gap-2 md:gap-0
                bg-estate-indigo/20 rounded-md p-1
              "
            >
              {/* Animated indicator */}
              <motion.div
                className="absolute top-1 bottom-1 h-[85%] my-auto bg-white rounded-md shadow-md z-0"
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
                  className={`
                    flex items-center gap-2 px-3 py-2 
                    whitespace-nowrap z-10 relative transition-all duration-300
                    ${
                      activeTab === value
                        ? "text-black font-semibold"
                        : "text-gray-600"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab content */}
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
