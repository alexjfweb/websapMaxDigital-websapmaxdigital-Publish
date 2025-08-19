"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10">
      {/* Header básico sin Firebase */}
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <Link href="/" className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="text-2xl font-bold text-foreground">WebSapMax</span>
              </Link>
            </div>
            <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <Button asChild variant="ghost">
                  <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild>
                  <Link href="/register">Registrarse</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal estático */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
            <span className="block">Bienvenido a</span>
            <span className="block text-primary">WebSapMax Digital</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-muted-foreground sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Una aplicación moderna construida con Next.js y Firebase, ahora sin errores de carga.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
                <Button asChild size="lg">
                    <Link href="/login">Comenzar</Link>
                </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
