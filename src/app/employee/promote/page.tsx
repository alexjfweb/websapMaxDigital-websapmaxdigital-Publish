"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import WhatsAppIcon from "@/components/icons/whatsapp-icon";
import FacebookIcon from "@/components/icons/facebook-icon"; // Assuming you'll create these
import InstagramIcon from "@/components/icons/instagram-icon";
import XIcon from "@/components/icons/x-icon";
import TikTokIcon from "@/components/icons/tiktok-icon";
import React, { useEffect, useState } from 'react';

export default function EmployeePromotePage() {
  const { toast } = useToast();
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
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
      .catch(err => console.error('Failed to copy: ', err));
  };

  const shareOnSocialMedia = (platformUrlTemplate: string) => {
    if (!menuUrl) return;
    const shareText = `Check out the delicious menu at websapMax! ${menuUrl}`;
    const url = platformUrlTemplate.replace('{URL}', encodeURIComponent(menuUrl)).replace('{TEXT}', encodeURIComponent(shareText));
    window.open(url, '_blank');
  };

  if (!menuUrl) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">Promote Our Menu</h1>
        <p className="text-lg text-muted-foreground">Loading promotion options...</p>
      </div>
    );
  }

  const socialPlatforms = [
    { name: "WhatsApp", icon: <WhatsAppIcon className="h-6 w-6" />, action: () => shareOnSocialMedia('https://wa.me/?text={TEXT}') },
    { name: "Facebook", icon: <FacebookIcon className="h-6 w-6" />, action: () => shareOnSocialMedia('https://www.facebook.com/sharer/sharer.php?u={URL}&quote={TEXT}') },
    { name: "Instagram", icon: <InstagramIcon className="h-6 w-6" />, action: () => alert("Share on Instagram: Copy link and post manually or share to stories if app allows.") }, // Instagram sharing is complex
    { name: "X (Twitter)", icon: <XIcon className="h-6 w-6" />, action: () => shareOnSocialMedia('https://twitter.com/intent/tweet?url={URL}&text={TEXT}') },
    { name: "TikTok", icon: <TikTokIcon className="h-6 w-6" />, action: () => alert("Share on TikTok: Create a video and add the link in your bio or description.") }, // TikTok sharing is primarily via app
  ];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-primary">Promote Our Menu!</h1>
        <p className="text-lg text-muted-foreground mt-2">Help spread the word about websapMax. Share our digital menu with your network.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Copy className="h-5 w-5"/> Copy Menu Link</CardTitle>
          <CardDescription>Share this direct link to our menu.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <input type="text" value={menuUrl} readOnly className="flex-grow p-2 border rounded-md bg-muted text-sm" />
          <Button onClick={handleCopyToClipboard} variant="outline" size="icon" aria-label="Copy link">
            <Copy className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5"/> Share on Social Media</CardTitle>
          <CardDescription>One-click sharing to popular platforms.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {socialPlatforms.map(platform => (
            <Button key={platform.name} onClick={platform.action} variant="outline" className="flex flex-col items-center justify-center h-24 p-2 gap-2 hover:bg-accent/10">
              {platform.icon}
              <span className="text-xs">{platform.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Promotion Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>Personalize your message:</strong> When sharing, add a personal note about your favorite dish or a current promotion.</p>
            <p><strong>Use relevant hashtags:</strong> Consider using hashtags like #websapMax #RestaurantName #[City]Food #Foodie.</p>
            <p><strong>Best times to post:</strong> Share around meal times (lunch, dinner) when people are most likely thinking about food.</p>
        </CardContent>
      </Card>

    </div>
  );
}

