
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { mockDishes } from "@/lib/mock-data"; 
import { useLanguage } from "@/contexts/language-context";

// Mock function to render stars
const renderStars = (likes: number) => {
  return Array(5).fill(0).map((_, i) => (
    <svg key={i} className={`h-4 w-4 ${i < likes ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  ));
};

export default function AdminDishesPage() {
  const { t } = useLanguage();
  const dishes = mockDishes;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('adminDishes.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('adminDishes.description')}</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> {t('adminDishes.addNewButton')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('adminDishes.allDishesCard.title')}</CardTitle>
          <CardDescription>{t('adminDishes.allDishesCard.description')}</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t('adminDishes.searchInputPlaceholder')} className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> {t('adminDishes.filterButton')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">{t('adminDishes.table.image')}</TableHead>
                <TableHead>{t('adminDishes.table.name')}</TableHead>
                <TableHead>{t('adminDishes.table.category')}</TableHead>
                <TableHead className="text-right">{t('adminDishes.table.price')}</TableHead>
                <TableHead className="text-center">{t('adminDishes.table.stock')}</TableHead>
                <TableHead className="text-center hidden sm:table-cell">{t('adminDishes.table.likes')}</TableHead>
                <TableHead className="text-right">{t('adminDishes.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dishes.map((dish) => (
                <TableRow key={dish.id}>
                  <TableCell className="hidden md:table-cell">
                    <Image 
                        src={dish.imageUrl} 
                        alt={dish.name} 
                        width={48} 
                        height={48} 
                        className="rounded-md object-cover"
                        data-ai-hint="food item"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{dish.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dish.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${dish.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    {dish.stock === -1 ? <Badge variant="secondary">{t('adminDishes.stock.unlimited')}</Badge> : 
                     dish.stock === 0 ? <Badge variant="destructive">{t('adminDishes.stock.out')}</Badge> : 
                     dish.stock}
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <div className="flex justify-center">{renderStars(dish.likes)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-destructive">
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
