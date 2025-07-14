"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from 'react-i18next';
import type { Company } from "@/types";
import { format } from "date-fns";
import { useEffect, useState } from "react";

// Mock Data for Companies
const mockCompanies: Company[] = [
  { id: "com-1", name: "websapMax Restaurant", location: "Flavor Town", status: "active", registrationDate: "2023-01-15T00:00:00Z" },
  { id: "com-2", name: "The Burger Joint", location: "Metropolis", status: "active", registrationDate: "2023-03-20T00:00:00Z" },
  { id: "com-3", name: "Pizza Palace", location: "Gotham City", status: "inactive", registrationDate: "2023-05-10T00:00:00Z" },
  { id: "com-4", name: "Sushi Central", location: "Star City", status: "pending", registrationDate: "2024-07-28T00:00:00Z" },
  { id: "com-5", name: "Taco Tuesday", location: "Central City", status: "active", registrationDate: "2023-09-01T00:00:00Z" },
];

export default function SuperAdminCompaniesPage() {
  const { t } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const companies = mockCompanies;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getStatusBadge = (status: Company['status']) => {
    const statusKey = `superAdminCompanies.status.${status}`;
    const statusText = t(statusKey);
    switch (status) {
      case "active": return <Badge className="bg-green-500 text-white hover:bg-green-600">{statusText}</Badge>;
      case "inactive": return <Badge variant="destructive">{statusText}</Badge>;
      case "pending": return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">{statusText}</Badge>;
      default: return <Badge variant="outline">{statusText}</Badge>;
    }
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('superAdminCompanies.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('superAdminCompanies.description')}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('superAdminCompanies.registerNewCompanyButton')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('superAdminCompanies.allCompaniesCard.title')}</CardTitle>
          <CardDescription>{t('superAdminCompanies.allCompaniesCard.description')}</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('superAdminCompanies.searchInputPlaceholder')} className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> {t('superAdminCompanies.filterByStatusButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('superAdminCompanies.table.name')}</TableHead>
                <TableHead className="hidden sm:table-cell">{t('superAdminCompanies.table.location')}</TableHead>
                <TableHead className="text-center">{t('superAdminCompanies.table.status')}</TableHead>
                <TableHead className="hidden md:table-cell text-center">{t('superAdminCompanies.table.registered')}</TableHead>
                <TableHead className="text-right">{t('superAdminCompanies.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">{company.location}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(company.status)}</TableCell>
                  <TableCell className="hidden md:table-cell text-center text-xs text-muted-foreground">
                    {format(new Date(company.registrationDate), "P")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="hover:text-blue-500" title={t('superAdminCompanies.actions.details')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-primary" title={t('superAdminCompanies.actions.edit')}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title={t('superAdminCompanies.actions.delete')}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
