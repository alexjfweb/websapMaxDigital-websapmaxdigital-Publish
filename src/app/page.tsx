"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, ShoppingCart, Share2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-theme(spacing.16))] text-center p-4 md:p-8">
      <header className="mb-12">
        <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4">
          Welcome to websapMax!
        </h1>
        <p className="text-xl md:text-2xl text-foreground/80 max-w-2xl mx-auto">
          Your ultimate digital menu solution. Explore delicious dishes, place orders seamlessly, and share with ease.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-5xl w-full">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Utensils className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">Interactive Menu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Browse our extensive menu with beautiful images and detailed descriptions.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">Easy Ordering</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Add your favorite dishes to the cart and send your order directly via WhatsApp.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Share2 className="h-12 w-12 text-accent" />
            </div>
            <CardTitle className="text-2xl text-center">Share & Connect</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center">
              Easily share our menu with friends and family or make reservations.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="relative w-full max-w-3xl aspect-video rounded-lg overflow-hidden shadow-2xl mb-12">
        <Image 
          src="https://placehold.co/800x450.png" 
          alt="Delicious Food Montage" 
          fill={true}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          data-ai-hint="food restaurant" 
        />
      </div>

      <Link href="/menu" passHref>
        <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          Explore Our Menu
        </Button>
      </Link>

      <footer className="mt-16 text-muted-foreground text-sm">
        <p>&copy; {currentYear !== null ? currentYear : ''} websapMax. All rights reserved.</p>
        <p>Experience the future of dining.</p>
      </footer>
    </div>
  );
}
