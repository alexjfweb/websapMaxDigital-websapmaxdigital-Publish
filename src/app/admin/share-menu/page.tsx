"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import React, { useEffect, useState } from 'react';
import Image from 'next/image'; // Added import for Next.js Image

export default function AdminShareMenuPage() {
  const { toast } = useToast();
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    // Ensure this runs only on the client
    if (typeof window !== 'undefined') {
      setMenuUrl(window.location.origin + "/menu");
    }
  }, []);


  const handleCopyToClipboard = () => {
    if (!menuUrl) return;
    navigator.clipboard.writeText(menuUrl)
      .then(() => {
        toast({
          title: "Link Copied!",
          description: "Menu link copied to clipboard.",
        });
      })
      .catch(err => {
        toast({
          title: "Error",
          description: "Failed to copy link. Please try again.",
          variant: "destructive",
        });
        console.error('Failed to copy: ', err);
      });
  };

  const handleShareViaWhatsApp = () => {
    if (!menuUrl) return;
    const message = `Check out our delicious menu at websapMax: ${menuUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!menuUrl) {
    // Render a loading state or null until menuUrl is set
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Share Menu</h1>
        <p className="text-lg text-muted-foreground">Loading sharing options...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary text-center">Share Your Menu</h1>
      <p className="text-lg text-muted-foreground text-center">Easily share your digital menu with customers.</p>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Shareable Link</CardTitle>
          <CardDescription>Copy this link to share your menu anywhere.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input id="menuLink" value={menuUrl} readOnly className="flex-grow" />
            <Button onClick={handleCopyToClipboard} variant="outline" size="icon" aria-label="Copy link">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Customers can view your full interactive menu by visiting this link.
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Share via WhatsApp</CardTitle>
          <CardDescription>Quickly send the menu link through WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleShareViaWhatsApp} className="w-full bg-green-500 hover:bg-green-600 text-white">
            <WhatsAppIcon className="mr-2 h-5 w-5" /> Share on WhatsApp
          </Button>
          <p className="text-sm text-muted-foreground mt-3 text-center">
            This will open WhatsApp with a pre-filled message containing your menu link.
          </p>
        </CardContent>
      </Card>
      
      {/* Placeholder for QR Code Generation */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Menu QR Code</CardTitle>
          <CardDescription>Customers can scan this QR code to view the menu.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="p-4 border rounded-lg bg-white">
            {/* In a real app, you'd use a library like qrcode.react here */}
            <Image 
                src={`https://placehold.co/200x200.png?text=QR+Code+for+${encodeURIComponent(menuUrl)}`} 
                alt="Menu QR Code" 
                width={200} 
                height={200}
                data-ai-hint="QR code"
            />
          </div>
          <Button variant="outline">Download QR Code</Button>
        </CardContent>
      </Card>
    </div>
  );
}
