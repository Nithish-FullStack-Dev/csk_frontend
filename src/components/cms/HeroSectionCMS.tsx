import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Plus, Trash2, Eye, Upload } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Permission } from "@/types/permission";
import { toast } from "sonner";
import Loader from "../Loader";
import { fetchRolePermissions } from "@/utils/units/Methods";

const HeroSectionCMS = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [slides, setSlides] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [uploading, setUploading] = useState(false);

  const {
    data: rolePermissions,
    isLoading: isRolePermissionsLoading,
    error: rolePermissionsError,
    isError: isRolePermissionsError,
  } = useQuery<Permission>({
    queryKey: ["rolePermissions", user?.role],
    queryFn: () => fetchRolePermissions(user?.role as string),
    enabled: !!user?.role,
  });

  const fetchSlides = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_URL}/api/cms/getAllCms`
      );
      setSlides(res.data.banners);
    } catch (error) {
      console.log("Fetch error", error);
      return null;
    }
  };

  const saveSlides = async (slideList) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_URL}/api/cms/addAllCms`,
        {
          slides: slideList,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log("Save error", error);
      return null;
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  if (isRolePermissionsError) {
    console.error("Error fetching role permissions:", rolePermissionsError);
    toast.error("Failed to load role permissions");
  }

  if (isRolePermissionsLoading) {
    return <Loader />;
  }

  const canUserAdd = rolePermissions?.permissions.some(
    (per) => per.submodule === "Content Management" && per.actions.write
  );
  const canUserEdit = rolePermissions?.permissions.some(
    (per) => per.submodule === "Content Management" && per.actions.edit
  );
  const canUserDelete = rolePermissions?.permissions.some(
    (per) => per.submodule === "Content Management" && per.actions.delete
  );

  const handleSave = async () => {
    setIsEditing(false);
    setEditingSlide(null);
    await saveSlides(slides);
  };

  const addNewSlide = async () => {
    const newSlide = {
      title: "New Slide Title",
      subtitle: "New slide subtitle",
      cta: "Call to Action",
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/api/cms/addCms`,
        newSlide,
        { withCredentials: true }
      );
      const savedSlide = response.data.banner;
      setSlides([...slides, savedSlide]);
    } catch (error) {
      console.log("Save error", error);
      return null;
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    slideId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/uploads/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        const updatedSlides = slides.map((slide) =>
          slide._id === slideId
            ? { ...slide, image: `${uploadedUrl}?v=${Date.now()}` }
            : slide
        );
        setSlides(updatedSlides);
        await saveSlides(updatedSlides);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      e.target.value = "";
      setUploading(false);
    }
  };

  const removeSlide = async (id) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_URL}/api/cms/deleteCms/${id}`,
        { withCredentials: true }
      );
      setSlides((prevSlides) => prevSlides.filter((slide) => slide._id !== id));
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  const updateSlide = (id, field, value) => {
    setSlides((prevSlides) =>
      prevSlides.map((slide) =>
        slide._id === id ? { ...slide, [field]: value } : slide
      )
    );
  };

  return (
    <Card>
      <CardHeader className="flex md:flex-row items-center justify-between flex-col gap-3 text-center md:text-left">
        <div>
          <CardTitle className="mb-2">Hero Section Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage the main hero slider on your homepage
          </p>
        </div>
        <div className="flex gap-2 flex-wrap justify-center md:justify-end">
          {isEditing
            ? (canUserAdd || canUserEdit) && (
                <Button onClick={handleSave} size="sm" disabled={uploading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )
            : canUserEdit && (
                <Button onClick={() => setIsEditing(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h3 className="text-lg font-semibold">
            Hero Slides ({slides.length})
            <p className="text-sm text-muted-foreground text-red-500">
              Please Don't switch tabs while uploading or saving
            </p>
          </h3>
          {canUserAdd && (
            <Button
              onClick={addNewSlide}
              variant="outline"
              size="sm"
              className="w-full md:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slide
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {slides.map((slide, index) => (
            <Card key={slide._id} className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-32 h-40 md:h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <Badge variant="secondary">Slide {index + 1}</Badge>
                    {canUserDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSlide(slide._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${slide._id}`}>Title</Label>
                        <Input
                          id={`title-${slide._id}`}
                          value={slide.title}
                          onChange={(e) =>
                            updateSlide(slide._id, "title", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor={`cta-${slide._id}`}>
                          Call to Action
                        </Label>
                        <Input
                          id={`cta-${slide._id}`}
                          value={slide.cta}
                          onChange={(e) =>
                            updateSlide(slide._id, "cta", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Label htmlFor={`subtitle-${slide._id}`}>
                          Subtitle
                        </Label>
                        <Textarea
                          id={`subtitle-${slide._id}`}
                          value={slide.subtitle}
                          onChange={(e) =>
                            updateSlide(slide._id, "subtitle", e.target.value)
                          }
                          rows={2}
                        />
                      </div>
                      <div className="col-span-1 md:col-span-2">
                        <Label htmlFor={`image-${slide._id}`}>Image URL</Label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="file"
                            accept="image/*"
                            id={`image-${slide._id}`}
                            className="hidden"
                            onChange={(e) => handleFileChange(e, slide._id)}
                          />

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document
                                .getElementById(`image-${slide._id}`)
                                ?.click()
                            }
                            className="w-full sm:w-auto"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? "Uploading..." : "Upload Image"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold">{slide.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {slide.subtitle}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {slide.cta}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroSectionCMS;
