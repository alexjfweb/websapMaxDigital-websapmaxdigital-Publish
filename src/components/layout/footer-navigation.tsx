
"use client";

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNavigationConfig } from '@/hooks/use-navigation-config';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutDashboard, ShoppingBag, BookUser, ClipboardList, Share2 } from 'lucide-react';
import type { NavItemConfig } from '@/services/navigation-service';

interface FooterNavigationProps {
  role: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  LayoutDashboard,
  ShoppingBag,
  BookUser,
  ClipboardList,
  Share2,
  // Agrega otros íconos que uses en la config base
};

export default function FooterNavigation({ role }: FooterNavigationProps) {
  const pathname = usePathname();
  const { navConfig, isLoading, isError } = useNavigationConfig();

  const footerItems = (navConfig.footerItems || [])
    .filter(item => item.roles.includes(role) && item.visible)
    .sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <footer className="fixed inset-x-0 bottom-0 z-40 block border-t bg-background p-2 shadow-inner md:hidden">
        <div className="flex justify-around">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="h-6 w-6 rounded-md" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </footer>
    );
  }

  if (isError || footerItems.length === 0) {
    return null; // No mostrar nada si hay error o no hay ítems configurados
  }
  
  return (
    <footer className="fixed inset-x-0 bottom-0 z-40 block border-t bg-background p-2 shadow-inner md:hidden">
      <nav className="flex items-center justify-around">
        {footerItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = iconMap[item.icon as string] || LayoutDashboard;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 rounded-md p-2 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
