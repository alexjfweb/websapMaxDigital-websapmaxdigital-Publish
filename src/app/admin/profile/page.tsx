import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Save, Edit, Trash2 } from "lucide-react";

// Mock data - in a real app, this would come from a backend/state management
const mockProfile = {
  name: "websapMax Restaurant",
  logoUrl: "https://placehold.co/150x150.png?text=Logo",
  address: "123 Foodie Lane, Flavor Town",
  phone: "+1 (555) 123-4567",
  email: "contact@websapmax.com",
  description: "The best place for delicious food!",
  primaryColor: "#FF4500",
  secondaryColor: "#FFF2E6",
  accentColor: "#FFB347",
  nequiQrUrl: "https://placehold.co/200x200.png?text=NequiQR",
};


export default function AdminProfilePage() {
  // State and handlers for form inputs and image uploads would go here in a real app.

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Manage Restaurant Profile</h1>
      <p className="text-lg text-muted-foreground">Update your restaurant's information and branding.</p>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>Keep your restaurant details up-to-date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input id="restaurantName" defaultValue={mockProfile.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Phone Number</Label>
              <Input id="restaurantPhone" type="tel" defaultValue={mockProfile.phone} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="restaurantAddress">Address</Label>
            <Input id="restaurantAddress" defaultValue={mockProfile.address} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantEmail">Email</Label>
            <Input id="restaurantEmail" type="email" defaultValue={mockProfile.email} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="restaurantDescription">Description</Label>
            <Textarea id="restaurantDescription" defaultValue={mockProfile.description} rows={4} />
          </div>
          
          <div className="space-y-4">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
                <img src={mockProfile.logoUrl} alt="Current Logo" className="h-24 w-24 rounded-md border object-cover" data-ai-hint="logo placeholder"/>
                <Button variant="outline">
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload New Logo
                    <Input type="file" className="hidden" accept="image/*" />
                </Button>
            </div>
            <FormDescription className="text-xs">Recommended size: 200x200px. Max 2MB.</FormDescription>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding & Colors</CardTitle>
          <CardDescription>Customize the look and feel of your public menu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex items-center gap-2">
                        <Input id="primaryColor" type="color" defaultValue={mockProfile.primaryColor} className="w-16 h-10 p-1" />
                        <Input type="text" defaultValue={mockProfile.primaryColor} readOnly className="flex-1" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="secondaryColor">Background Color</Label>
                     <div className="flex items-center gap-2">
                        <Input id="secondaryColor" type="color" defaultValue={mockProfile.secondaryColor} className="w-16 h-10 p-1" />
                        <Input type="text" defaultValue={mockProfile.secondaryColor} readOnly className="flex-1" />
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex items-center gap-2">
                        <Input id="accentColor" type="color" defaultValue={mockProfile.accentColor} className="w-16 h-10 p-1" />
                        <Input type="text" defaultValue={mockProfile.accentColor} readOnly className="flex-1" />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Configure how customers can pay.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label>Nequi QR Code</Label>
                <div className="flex items-center gap-4">
                    <img src={mockProfile.nequiQrUrl} alt="Nequi QR Code" className="h-24 w-24 rounded-md border object-cover" data-ai-hint="QR code placeholder"/>
                    <Button variant="outline">
                        <UploadCloud className="mr-2 h-4 w-4" /> Upload Nequi QR
                        <Input type="file" className="hidden" accept="image/*" />
                    </Button>
                </div>
                <FormDescription className="text-xs">Upload the QR code image for Nequi payments.</FormDescription>
            </div>
             {/* Add fields for Nequi account holder and number if needed */}
            <div className="flex items-center space-x-2">
                <Input type="checkbox" id="cod" defaultChecked />
                <Label htmlFor="cod" className="text-sm font-normal">
                    Enable Cash on Delivery (COD)
                </Label>
            </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline"><Edit className="mr-2 h-4 w-4" /> Edit</Button>
        <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        <Button variant="destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete Profile (Caution)</Button>
      </div>
    </div>
  );
}
