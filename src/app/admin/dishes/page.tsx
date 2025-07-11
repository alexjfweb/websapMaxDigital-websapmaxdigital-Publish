
"use client";

import { useState, type ChangeEvent, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, UploadCloud, X, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { mockDishes } from "@/lib/mock-data"; 
import { useLanguage } from "@/contexts/language-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Dish, DishFormData } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";


export default function AdminDishesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();

  // Schema for the form validation, using t function for messages
  const dishFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, { message: t('adminDishes.validation.nameRequired') }),
    description: z.string().min(10, { message: t('adminDishes.validation.descriptionRequired') }),
    price: z.coerce.number().positive({ message: t('adminDishes.validation.pricePositive') }),
    category: z.string().min(3, { message: t('adminDishes.validation.categoryRequired') }),
    stock: z.coerce.number().int().min(-1, { message: t('adminDishes.validation.stockInvalid') }),
    image: z.any().optional(),
  });

  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<DishFormData>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: -1,
      image: null,
    },
  });
  
  // Re-validate form when language changes
  useEffect(() => {
    form.trigger();
  }, [t, form]);

  // Effect to populate form when editing
  useEffect(() => {
    if (editingDish) {
      form.reset({
        id: editingDish.id,
        name: editingDish.name,
        description: editingDish.description,
        price: editingDish.price,
        category: editingDish.category,
        stock: editingDish.stock,
        image: null, // Image file needs to be re-uploaded for security reasons
      });
      setImagePreview(editingDish.imageUrl);
    } else {
      form.reset({
        name: "",
        description: "",
        price: 0,
        category: "",
        stock: -1,
        image: null,
      });
      setImagePreview(null);
    }
  }, [editingDish, form, isDialogOpen]); // Added isDialogOpen to reset form on close

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("image", file); // Set file object for form submission
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      form.setValue("image", null);
    }
  };
  
  const onSubmit = (values: DishFormData) => {
    // In a real app, you would send this to a backend API
    if (editingDish) {
      // Logic to update an existing dish
      setDishes(prevDishes => prevDishes.map(d => 
        d.id === editingDish.id ? { 
          ...d, 
          ...values, 
          imageUrl: imagePreview || d.imageUrl, // Keep old image if new one isn't uploaded
          price: Number(values.price),
          stock: Number(values.stock) 
        } : d
      ));
      toast({
        title: t('adminDishes.toast.updateSuccessTitle'),
        description: t('adminDishes.toast.updateSuccessDescription', { dishName: values.name }),
      });
    } else {
      // Logic to create a new dish
      const newDish: Dish = {
          id: `dish-${Date.now()}`, // Generate a mock ID
          name: values.name,
          description: values.description,
          price: Number(values.price),
          category: values.category,
          stock: Number(values.stock),
          likes: 0, // New dishes start with 0 likes
          imageUrl: imagePreview || "https://placehold.co/600x400.png", // Use preview or a placeholder
      };
      setDishes(prevDishes => [newDish, ...prevDishes]);
      toast({
          title: t('adminDishes.toast.createSuccessTitle'),
          description: t('adminDishes.toast.createSuccessDescription', { dishName: values.name }),
      });
    }

    setEditingDish(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDish(null);
    setIsDialogOpen(true);
  }

  const handleDeleteDish = (dishId: string, dishName: string) => {
    setDishes(prevDishes => prevDishes.filter(d => d.id !== dishId));
    toast({
        title: t('adminDishes.toast.deleteSuccessTitle'),
        description: t('adminDishes.toast.deleteSuccessDescription', { dishName: dishName }),
        variant: "destructive"
    })
  }
  
  // Mock function to render stars
  const renderStars = (likes: number) => {
    return Array(5).fill(0).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < likes ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
    ));
  };


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{t('adminDishes.title')}</h1>
          <p className="text-lg text-muted-foreground">{t('adminDishes.description')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                    <PlusCircle className="mr-2 h-5 w-5" /> {t('adminDishes.addNewButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingDish ? t('adminDishes.form.titleEdit') : t('adminDishes.form.titleCreate')}</DialogTitle>
                    <DialogDescription>
                        {editingDish ? t('adminDishes.form.descriptionEdit') : t('adminDishes.form.descriptionCreate')}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>{t('adminDishes.form.nameLabel')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('adminDishes.form.namePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                               <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>{t('adminDishes.form.descriptionLabel')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t('adminDishes.form.descriptionPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                           </div>
                           <div className="space-y-4">
                                <FormLabel>{t('adminDishes.form.imageLabel')}</FormLabel>
                                <div className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg">
                                    {imagePreview ? (
                                        <>
                                            <Image src={imagePreview} alt={t('adminDishes.form.imagePreviewAlt')} layout="fill" objectFit="cover" className="rounded-lg"/>
                                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => { setImagePreview(null); form.setValue("image", null); }}>
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </>
                                    ) : (
                                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-card hover:bg-muted/50 rounded-lg">
                                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2"/>
                                            <span className="text-sm text-muted-foreground">{t('adminDishes.form.imageUploadText')}</span>
                                        </label>
                                    )}
                                    <Input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleImageChange}/>
                                </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('adminDishes.form.priceLabel')}</FormLabel>
                                    <FormControl>
                                    <Input type="number" step="0.01" placeholder="19.99" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('adminDishes.form.categoryLabel')}</FormLabel>
                                    <FormControl>
                                    <Input placeholder={t('adminDishes.form.categoryPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('adminDishes.form.stockLabel')}</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder={t('adminDishes.form.stockPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('adminDishes.form.cancelButton')}</Button>
                            <Button type="submit"><Save className="mr-2 h-4 w-4"/> {editingDish ? t('adminDishes.form.saveChangesButton') : t('adminDishes.form.saveDishButton')}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
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
                      <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => openEditDialog(dish)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="hover:text-destructive">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('adminDishes.deleteDialog.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {t('adminDishes.deleteDialog.description', { dishName: dish.name })}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('adminDishes.deleteDialog.cancelButton')}</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteDish(dish.id, dish.name)} className={cn(buttonVariants({ variant: "destructive" }))}>
                                    {t('adminDishes.deleteDialog.confirmButton')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
