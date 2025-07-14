import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Edit, Save, Plus, Trash2, Eye, Upload } from "lucide-react";
import axios from "axios";

const HeroSectionCMS = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [slides, setSlides] = useState([]);
  const [editingSlide, setEditingSlide] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchSlides = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/cms/getAllCms");
      setSlides(res.data.banners);
    } catch (error) {
      console.log("Fetch error", error);
    }
  };

  const saveSlides = async () => {
    try {
      await axios.post("http://localhost:3000/api/cms/addAllCms", { slides });
      console.log("Slides saved");
    } catch (error) {
      console.log("Save error", error);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleSave = async () => {
    setIsEditing(false);
    setEditingSlide(null);
    await saveSlides();
  };

  const addNewSlide = async () => {
    const newSlide = {
      title: "New Slide Title",
      subtitle: "New slide subtitle",
      cta: "Call to Action",
    };

    try {
      const response = await axios.post(
        "http://localhost:3000/api/cms/addCms",
        newSlide
      );
      const savedSlide = response.data.banner;
      setSlides([...slides, savedSlide]);
    } catch (error) {
      console.log("Save error", error);
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
        "http://localhost:3000/api/uploads/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        setSlides((prevSlides) =>
          prevSlides.map((slide) =>
            slide._id === slideId
              ? { ...slide, image: `${uploadedUrl}?v=${Date.now()}` }
              : slide
          )
        );
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
      await axios.delete(`http://localhost:3000/api/cms/deleteCms/${id}`);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="mb-2">Hero Section Management</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage the main hero slider on your homepage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          {isEditing ? (
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Hero Slides ({slides.length})
          </h3>
          <Button onClick={addNewSlide} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </Button>
        </div>

        <div className="grid gap-4">
          {slides.map((slide, index) => (
            <Card key={slide._id} className="p-4">
              <div className="flex gap-4">
                <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">Slide {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSlide(slide._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-4">
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
                      <div className="col-span-2">
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
                      <div className="col-span-2">
                        <Label htmlFor={`image-${slide._id}`}>Image URL</Label>
                        <div className="flex gap-2">
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
