
// src/app/layout.tsx
"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import ClientProviders from './ClientProviders';
import { Toaster } from '@/components/ui/toaster';
import React, { useEffect } from 'react';
import { databaseSyncService } from '@/services/database-sync-service';
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const inter = Inter({
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { toast } = useToast();

  useEffect(() => {
    // Función para asegurar que el perfil de la compañía principal exista
    const ensureCompanyProfileExists = async () => {
      if (!db) return;
      const companyId = 'websapmax';
      const docRef = doc(db, "companies", companyId);
      try {
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log(`El perfil para '${companyId}' no existe. Creando uno por defecto...`);
          const defaultProfileData = {
            id: companyId,
            name: "WebSapMax Restaurante",
            ruc: "123456789",
            location: "Ciudad Principal",
            status: 'active',
            registrationDate: new Date().toISOString(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            email: "contacto@websapmax.com",
            phone: "3001234567",
            addressStreet: "Calle Falsa 123",
          };
          await setDoc(docRef, defaultProfileData);
          toast({
            title: "Perfil de Restaurante Creado",
            description: "El perfil de demostración ha sido creado automáticamente.",
          });
        }
      } catch (error) {
        console.error("Error al verificar/crear el perfil de la compañía:", error);
      }
    };
    
    // Función para sincronizar planes
    const runSync = async () => {
      try {
        console.log('Ejecutando sincronización de base de datos...');
        const message = await databaseSyncService.syncLandingPlans('system-init', 'system@init.com');
        console.log(message);
        if (message.includes('crearon')) {
           toast({
            title: "Sistema inicializado",
            description: "Los planes de ejemplo han sido creados.",
          });
        }
      } catch (error) {
        console.error("Fallo la sincronización automática:", error);
         toast({
            title: "Error de Sincronización",
            description: "No se pudo inicializar la base de datos.",
            variant: "destructive",
          });
      }
    };
    
    // Ejecutar ambas funciones
    ensureCompanyProfileExists();
    runSync();
  }, [toast]);


  return (
    <html lang="es">
      <body className={inter.className} suppressHydrationWarning={true}>
        <ClientProviders>{children}</ClientProviders>
        <Toaster />
      </body>
    </html>
  );
}
