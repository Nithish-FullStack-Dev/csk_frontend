
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { XCircle, Upload, Camera, FileImage } from "lucide-react";

interface PhotoUploaderProps {
  photos: File[];
  setPhotos: (photos: File[]) => void;
  photoCaptions: string[];
  setPhotoCaptions: (captions: string[]) => void;
}

const PhotoUploader = ({
  photos,
  setPhotos,
  photoCaptions,
  setPhotoCaptions
}: PhotoUploaderProps) => {
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and append to existing photos
      const newFiles = Array.from(e.target.files);
      setPhotos([...photos, ...newFiles]);
      
      // Add empty captions for new photos
      setPhotoCaptions([
        ...photoCaptions,
        ...newFiles.map(() => "")
      ]);
    }
  };
  
  // Remove a photo from the list
  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoCaptions(photoCaptions.filter((_, i) => i !== index));
  };
  
  // Update a photo caption
  const updateCaption = (index: number, caption: string) => {
    setPhotoCaptions(photoCaptions.map((c, i) => i === index ? caption : c));
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <Label htmlFor="photos">Upload Photos</Label>
        <span className="text-xs text-muted-foreground">{photos.length} photos selected</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
        {photos.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground">
            <FileImage className="h-10 w-10 mb-2" />
            <p className="text-sm text-center">No photos selected. Click below to upload.</p>
          </div>
        )}
        
        {photos.map((photo, index) => (
          <div key={index} className="relative rounded-md overflow-hidden border border-border flex flex-col">
            <img 
              src={URL.createObjectURL(photo)}
              alt={`Evidence ${index + 1}`}
              className="w-full h-32 object-cover"
            />
            <div className="p-2">
              <Input 
                size={1}
                placeholder="Add caption"
                value={photoCaptions[index] || ""}
                onChange={(e) => updateCaption(index, e.target.value)}
                className="text-xs"
              />
            </div>
            <Button 
              type="button"
              variant="ghost" 
              size="icon"
              className="absolute top-1 right-1 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full"
              onClick={() => removePhoto(index)}
            >
              <XCircle className="h-4 w-4 text-white" />
            </Button>
          </div>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          type="button"
          variant="outline"
          className="flex-1 border-dashed"
          onClick={() => document.getElementById("photo-upload")?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Photos
        </Button>
        <Button 
          type="button"
          variant="outline"
          className="border-dashed"
          onClick={() => document.getElementById("camera-capture")?.click()}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
      <Input 
        id="photo-upload" 
        type="file"
        className="hidden" 
        accept="image/*"
        multiple
        onChange={handleFileChange}
      />
      <Input 
        id="camera-capture" 
        type="file"
        className="hidden" 
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />
      <p className="text-xs text-muted-foreground">
        Please upload clear photos showing the construction progress. GPS location will be automatically added.
      </p>
    </div>
  );
};

export default PhotoUploader;
