import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, Upload, Plus, Trash2 } from "lucide-react";
import axios from "axios";

interface GalleryItem {
  _id?: string;
  key: string;
  title: string;
  image: string;
  uploading?: boolean;
}

interface AboutContent {
  _id: string;
  galleryTitle: string;
  galleryDes: string;
  gallery: GalleryItem[];
}

const GalleryCms = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [aboutId, setAboutId] = useState<string>("");
  const [galleryTitle, setGalleryTitle] = useState<string>("");
  const [galleryDes, setGalleryDes] = useState<string>("");

  // Fetch gallery data from API
  const fetchGalleryInfo = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/api/aboutSection/getAboutSec`
      );
      setAboutId(data._id || "");
      setGalleryTitle(data.galleryTitle || "");
      setGalleryDes(data.galleryDes || "");
      setGallery(
        (data.gallery || []).map(
          (item: Omit<GalleryItem, "key" | "uploading">) => ({
            ...item,
            key:
              item._id ||
              `fetched-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            uploading: false,
          })
        )
      );
    } catch (error) {
      console.error("Failed to fetch gallery data:", error);
    }
  };

  useEffect(() => {
    fetchGalleryInfo();
  }, []);

  // Gallery image upload
  const handleImageUpload = async (key: string, file: File) => {
    setGallery((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, uploading: true } : item
      )
    );

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_URL}/api/uploads/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const uploadedUrl = res.data?.url;

      if (uploadedUrl) {
        setGallery((prev) =>
          prev.map((item) =>
            item.key === key
              ? {
                  ...item,
                  image: `${uploadedUrl}?v=${Date.now()}`,
                  uploading: false,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error("Upload failed:", err);
      setGallery((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, uploading: false } : item
        )
      );
    }
  };

  // Update gallery item
  const updateGalleryItem = (key: string, field: string, value: any) => {
    setGallery(
      gallery.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  // Add new gallery item
  const addGalleryItem = () => {
    setGallery((prev) => [
      ...prev,
      {
        key: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title: "",
        image: "",
        uploading: false,
      },
    ]);
  };

  // Remove gallery item
  const removeGalleryItem = (key: string) => {
    setGallery((prev) => prev.filter((item) => item.key !== key));
  };

  // Save changes
  const handleSave = async () => {
    setIsEditing(false);
    try {
      const galleryPayload = gallery.map(
        ({ uploading, key, _id, ...rest }) => rest
      );

      const payload = {
        galleryTitle,
        galleryDes,
        gallery: galleryPayload,
      };

      await axios.put(
        `${
          import.meta.env.VITE_URL
        }/api/aboutSection/updateAboutSec/${aboutId}`,
        payload
      );

      await fetchGalleryInfo();
    } catch (error) {
      console.error("Error saving gallery data:", error);
    }
  };

  const isAnyUploading = gallery.some((item) => item.uploading);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="space-y-4 w-full">
            <div>
              <CardTitle>Gallery Management</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Manage the gallery images, titles, and descriptions
              </p>
            </div>
            {isEditing && (
              <div className="space-y-4">
                <div>
                  <Label>Gallery Title</Label>
                  <Input
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="Gallery Title"
                  />
                </div>
                <div>
                  <Label>Gallery Description</Label>
                  <Input
                    value={galleryDes}
                    onChange={(e) => setGalleryDes(e.target.value)}
                    placeholder="Gallery Description"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <Button onClick={handleSave} size="sm" disabled={isAnyUploading}>
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

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((item) => (
              <Card key={item.key} className="p-4 flex flex-col">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-40 h-40 rounded overflow-hidden bg-gray-200">
                        {item.uploading ? (
                          <div className="flex items-center justify-center h-full text-xs text-gray-500">
                            Uploading...
                          </div>
                        ) : (
                          item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        id={`gallery-image-${item.key}`}
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] &&
                          handleImageUpload(item.key, e.target.files[0])
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document
                            .getElementById(`gallery-image-${item.key}`)
                            ?.click()
                        }
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={item.title}
                        onChange={(e) =>
                          updateGalleryItem(item.key, "title", e.target.value)
                        }
                        placeholder="Image Title"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeGalleryItem(item.key)}
                      className="w-full"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="w-40 h-40 mx-auto rounded overflow-hidden bg-gray-200">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <h4 className="font-semibold">{item.title}</h4>
                  </div>
                )}
              </Card>
            ))}
          </div>
          {isEditing && (
            <Button
              onClick={addGalleryItem}
              size="sm"
              variant="outline"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Gallery Image
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GalleryCms;
