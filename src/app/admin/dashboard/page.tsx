"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Settings, ShoppingBag, Utensils, Users, CreditCard, Share2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from 'react-i18next';

export default function AdminDashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">{t('adminDashboard.title')}</h1>
      <p className="text-lg text-muted-foreground">{t('adminDashboard.description')}</p>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/profile">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('adminDashboard.profileCard.title')}</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('adminDashboard.profileCard.mainText')}</div>
              <p className="text-xs text-muted-foreground">{t('adminDashboard.profileCard.subText')}</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/dishes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('adminDashboard.dishCard.title')}</CardTitle>
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('adminDashboard.dishCard.mainText')}</div>
              <p className="text-xs text-muted-foreground">{t('adminDashboard.dishCard.subText')}</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminDashboard.employeeCard.title')}</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('adminDashboard.employeeCard.mainText')}</div>
            <p className="text-xs text-muted-foreground">{t('adminDashboard.employeeCard.subText')}</p>
          </CardContent>
        </Card>
        <Link href="/admin/reservations">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('adminDashboard.reservationsCard.title')}</CardTitle>
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('adminDashboard.reservationsCard.mainText')}</div>
              <p className="text-xs text-muted-foreground">{t('adminDashboard.reservationsCard.subText')}</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('adminDashboard.paymentsCard.title')}</CardTitle>
            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t('adminDashboard.paymentsCard.mainText')}</div>
            <p className="text-xs text-muted-foreground">{t('adminDashboard.paymentsCard.subText')}</p>
          </CardContent>
        </Card>
        <Link href="/admin/share-menu">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('adminDashboard.shareMenuCard.title')}</CardTitle>
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{t('adminDashboard.shareMenuCard.mainText')}</div>
              <p className="text-xs text-muted-foreground">{t('adminDashboard.shareMenuCard.subText')}</p>
            </CardContent>
          </Card>
        </Link>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>{t('adminDashboard.quickStats.title')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center space-x-4 rounded-md border p-4">
                <BarChart className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{t('adminDashboard.quickStats.totalDishes')}</p>
                    <p className="text-2xl font-semibold">25</p> {/* Mock Data */}
                </div>
            </div>
             <div className="flex items-center space-x-4 rounded-md border p-4">
                <ShoppingBag className="h-8 w-8 text-primary"/>
                <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{t('adminDashboard.quickStats.pendingOrders')}</p>
                    <p className="text-2xl font-semibold">5</p> {/* Mock Data */}
                </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
