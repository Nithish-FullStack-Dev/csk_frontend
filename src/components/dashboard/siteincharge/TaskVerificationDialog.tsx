import { useState } from "react";
import { 
  DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Upload, XCircle, CheckCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TaskVerificationDialogProps {
  onOpenChange: (open: boolean) => void;
  taskId?: string;
}

const TaskVerificationDialog = ({ onOpenChange, taskId }: TaskVerificationDialogProps) => {


  return (
    <DialogContent className="sm:max-w-[650px]">
      <DialogHeader>
        <DialogTitle>Verify Task Completion</DialogTitle>
        <DialogDescription>
          Review the contractor's work and verify task completion.
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="bg-muted p-3 rounded-md">
          <p className="font-medium">{task.title}</p>
          <p className="text-sm text-muted-foreground">
            {task.project} / {task.unit}
          </p>
          <p className="text-sm text-muted-foreground">
            Phase: {task.phase}
          </p>
          <p className="text-sm text-muted-foreground">
            Contractor: {task.contractor}
          </p>
          <p className="text-sm text-muted-foreground">
            Completed on: {new Date(task.completedDate).toLocaleDateString()}
          </p>
        </div>
        
        <Tabs defaultValue="contractor" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="contractor" className="flex-1">Contractor Photos</TabsTrigger>
            <TabsTrigger value="verification" className="flex-1">Your Verification</TabsTrigger>
          </TabsList>
          <TabsContent value="contractor" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              {task.contractorPhotos.map((photo, index) => (
                <div key={index} className="relative rounded-md overflow-hidden border border-border">
                  <img 
                    src={photo}
                    alt={`Contractor Evidence ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="verification" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Upload Verification Photos</Label>
              <div className="grid grid-cols-2 gap-4 mb-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative rounded-md overflow-hidden border border-border">
                    <img 
                      src={URL.createObjectURL(photo)}
                      alt={`Verification ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />
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
                  onClick={() => document.getElementById("verification-photo-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  className="border-dashed"
                  onClick={() => document.getElementById("verification-camera-capture")?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <Input 
                id="verification-photo-upload" 
                type="file"
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />
              <Input 
                id="verification-camera-capture" 
                type="file"
                className="hidden" 
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-2">
          <Label>Quality Assessment</Label>
          <RadioGroup value={quality} onValueChange={setQuality as any} className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="excellent" id="excellent" />
              <Label htmlFor="excellent">Excellent</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="good" id="good" />
              <Label htmlFor="good">Good</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="acceptable" id="acceptable" />
              <Label htmlFor="acceptable">Acceptable</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="poor" id="poor" />
              <Label htmlFor="poor">Poor</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Verification Decision</Label>
          <Select value={verificationStatus} onValueChange={setVerificationStatus as any} required>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approved">
                <div className="flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  <span>Approved - Work meets requirements</span>
                </div>
              </SelectItem>
              <SelectItem value="rework">
                <div className="flex items-center">
                  <AlertCircle className="mr-2 h-4 w-4 text-amber-600" />
                  <span>Needs Rework - Specific corrections required</span>
                </div>
              </SelectItem>
              <SelectItem value="rejected">
                <div className="flex items-center">
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  <span>Rejected - Work fails to meet standards</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes & Feedback</Label>
          <Textarea 
            id="notes" 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)}
            placeholder={verificationStatus !== "approved" 
              ? "Please describe the issues that need to be addressed" 
              : "Add any comments or feedback (optional)"}
            rows={3}
            required={verificationStatus !== "approved"}
          />
        </div>
        
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant={verificationStatus === "approved" ? "default" : verificationStatus === "rework" ? "secondary" : "destructive"}
          >
            Submit Verification
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default TaskVerificationDialog;
