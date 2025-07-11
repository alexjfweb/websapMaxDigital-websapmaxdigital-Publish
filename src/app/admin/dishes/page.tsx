
"use client";

import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, UploadCloud, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { mockDishes } from "@/lib/mock-data"; 
import { useLanguage } from "@/contexts/language-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Dish } from "@/types";

// Schema for the form validation
const dishFormSchema = z.object({
  name: z.string().min(3, { message: "Dish name must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  category: z.string().min(3, { message: "Category is required." }),
  stock: z.coerce.number().int().min(-1, { message: "Stock must be -1 for unlimited, or a positive number." }),
  image: z.any().optional(),
});


// Mock function to render stars
const renderStars = (likes: number) => {
  return Array(5).fill(0).map((_, i) => (
    <svg key={i} className={`h-4 w-4 ${i < likes ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  ));
};

export default function AdminDishesPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [dishes, setDishes] = useState<Dish[]>(mockDishes);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof dishFormSchema>>({
    resolver: zodResolver(dishFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      stock: -1,
    },
  });

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
  
  const onSubmit = (values: z.infer<typeof dishFormSchema>) => {
    // In a real app, you would send this to a backend API to create the dish
    const newDish: Dish = {
        id: `dish-${Date.now()}`, // Generate a mock ID
        name: values.name,
        description: values.description,
        price: values.price,
        category: values.category,
        stock: values.stock,
        likes: 0, // New dishes start with 0 likes
        imageUrl: imagePreview || "https://placehold.co/600x400.png", // Use preview or a placeholder
    };
    
    setDishes(prevDishes => [newDish, ...prevDishes]);
    
    toast({
        title: "Dish Created!",
        description: `The dish "${values.name}" has been successfully added to your menu.`,
    });

    form.reset();
    setImagePreview(null);
    setIsDialogOpen(false);
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
                <Button>
                    <PlusCircle className="mr-2 h-5 w-5" /> {t('adminDishes.addNewButton')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add New Dish</DialogTitle>
                    <DialogDescription>
                        Fill out the details below to add a new item to your menu.
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
                                    <FormLabel>Dish Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Sizzling Fajitas" {...field} />
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the dish..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                           </div>
                           <div className="space-y-4">
                                <Label>Dish Image</Label>
                                <div className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg">
                                    {imagePreview ? (
                                        <>
                                            <Image src={imagePreview} alt="Dish preview" layout="fill" objectFit="cover" className="rounded-lg"/>
                                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => setImagePreview(null)}>
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </>
                                    ) : (
                                        <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-card hover:bg-muted/50 rounded-lg">
                                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2"/>
                                            <span className="text-sm text-muted-foreground">Click to upload image</span>
                                        </Label>
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
                                    <FormLabel>Price ($)</FormLabel>
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
                                    <FormLabel>Category</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g., Main Courses" {...field} />
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
                                    <FormLabel>Stock Count</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="-1 for unlimited" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Save Dish</Button>
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
