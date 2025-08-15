
"use client";

import { useState, type ChangeEvent, useEffect, useMemo } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import type { Dish, DishFormData } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, Timestamp, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useDishes } from "@/hooks/use-dishes";
import { Skeleton } from "@/components/ui/skeleton";
import { storageService } from "@/services/storage-service";
import { useSession } from "@/contexts/session-context";

export default function AdminDishesPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;
  const { dishes, isLoading, error, refreshDishes } = useDishes(companyId);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dishToDelete, setDishToDelete] = useState<Dish | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const dishFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, { message: 'Se requiere un nombre mínimo de 3 caracteres' }),
    description: z.string().min(10, { message: 'Se requiere una descripción mínima de 10 caracteres' }),
    price: z.coerce.number().positive({ message: 'El precio debe ser positivo' }),
    category: z.string().min(3, { message: 'Se requiere una categoría mínima de 3 caracteres' }),
    stock: z.coerce.number().int().min(-1, { message: 'El stock es inválido' }),
    image: z.any().optional(),
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    if (editingDish) {
      form.reset({
        id: editingDish.id,
        name: editingDish.name,
        description: editingDish.description,
        price: editingDish.price,
        category: editingDish.category,
        stock: editingDish.stock,
        image: null,
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
  }, [editingDish, form, isDialogOpen]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("image", file);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
      form.setValue("image", null);
    }
  };
  
  const onSubmit = async (values: DishFormData) => {
    // Obtener el companyId en el momento de la sumisión para asegurar el valor más reciente.
    const currentCompanyId = currentUser.companyId;

    if (!currentCompanyId) {
      toast({ title: 'Error', description: 'No se ha identificado la compañía. Por favor, recargue la página.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    const isUpdating = !!editingDish;
  
    try {
      const normalizedNewName = values.name.trim().toLowerCase();
      // Verificamos si es una actualización y si el nombre ha cambiado
      const isNameChanged = !isUpdating || (editingDish && normalizedNewName !== editingDish.name.trim().toLowerCase());
  
      if (isNameChanged) {
        // Solo verificamos duplicados si el nombre es nuevo o ha cambiado
        const isDuplicate = dishes.some(
          (dish) => dish.name.trim().toLowerCase() === normalizedNewName
        );
        if (isDuplicate) {
          toast({
            title: 'Error: Plato duplicado',
            description: `Ya existe un plato con el nombre "${values.name}".`,
            variant: 'destructive',
          });
          setIsSubmitting(false);
          return;
        }
      }
  
      let imageUrl = editingDish?.imageUrl || "https://placehold.co/800x450.png";
  
      if (values.image instanceof File) {
        const newUrl = await storageService.compressAndUploadFile(values.image, `dishes/${currentCompanyId}/`);
        if (newUrl) {
          if (editingDish?.imageUrl && !editingDish.imageUrl.includes('placehold.co')) {
            await storageService.deleteFile(editingDish.imageUrl);
          }
          imageUrl = newUrl;
        }
      } else if (isUpdating && !imagePreview && editingDish?.imageUrl && !editingDish.imageUrl.includes('placehold.co')) {
        await storageService.deleteFile(editingDish.imageUrl);
        imageUrl = "https://placehold.co/800x450.png";
      }
      
      const dishData: any = { // Usamos any temporalmente para construir el objeto
        companyId: currentCompanyId,
        name: values.name,
        description: values.description,
        price: Number(values.price),
        category: values.category,
        stock: Number(values.stock),
        imageUrl,
        updatedAt: new Date().toISOString(),
      };
  
      if (isUpdating) {
        const dishRef = doc(db, 'dishes', editingDish.id);
        await updateDoc(dishRef, dishData);
        toast({
          title: 'Plato actualizado',
          description: `El plato "${values.name}" se ha actualizado correctamente.`,
        });
      } else {
        dishData.likes = 0;
        dishData.available = true;
        dishData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'dishes'), dishData);
        toast({
          title: 'Plato creado',
          description: `El plato "${values.name}" se ha creado correctamente.`,
        });
      }
  
      setEditingDish(null);
      setIsDialogOpen(false);
      await refreshDishes();
  
    } catch (error) {
      console.error("Error guardando el plato: ", error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el plato. Inténtelo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (dish: Dish) => {
    setEditingDish(dish);
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    setEditingDish(null);
    setIsDialogOpen(true);
  }

  const handleDeleteDish = (dish: Dish) => {
    setDishToDelete(dish);
  };

  const confirmDelete = async () => {
    if (!dishToDelete) return;
    
    try {
      if (dishToDelete.imageUrl && !dishToDelete.imageUrl.includes('placehold.co')) {
        await storageService.deleteFile(dishToDelete.imageUrl);
      }
      await deleteDoc(doc(db, 'dishes', dishToDelete.id));
      toast({
        title: 'Plato eliminado',
        description: `El plato "${dishToDelete.name}" se ha eliminado correctamente.`,
        variant: "destructive"
      });
      await refreshDishes();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el plato. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setDishToDelete(null);
    }
  };
  
  const renderStars = (likes: number) => {
    return Array(5).fill(0).map((_, i) => (
        <svg key={i} className={`h-4 w-4 ${i < likes ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
    ));
  };

  const filteredDishes = useMemo(() => {
    let filtered = dishes || [];
    if (searchTerm.trim()) {
      filtered = filtered.filter(dish => 
        dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dish.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dish => dish.category === selectedCategory);
    }
    return filtered;
  }, [dishes, searchTerm, selectedCategory]);

  const getUniqueCategories = () => {
    if (!dishes) return ['all'];
    const categories = dishes.map(dish => dish.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  const renderTableBody = () => {
    if (isLoading) {
      return (
        <>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              <TableCell className="hidden md:table-cell"><Skeleton className="h-12 w-12 rounded-md" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
              <TableCell className="text-center hidden sm:table-cell"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </>
      );
    }

    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-red-500 py-8">
            Error al cargar los platos. Por favor, intente de nuevo más tarde.
          </TableCell>
        </TableRow>
      );
    }

    if (filteredDishes.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
            No se encontraron platos.
          </TableCell>
        </TableRow>
      );
    }

    return filteredDishes.map((dish) => (
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
          {dish.stock === -1 ? <Badge variant="secondary">Ilimitado</Badge> : 
           dish.stock === 0 ? <Badge variant="destructive">Agotado</Badge> : 
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
            <AlertDialog onOpenChange={(open) => !open && setDishToDelete(null)}>
              <AlertDialogTrigger asChild>
                 <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteDish(dish)}>
                   <Trash2 className="h-4 w-4" />
                 </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar plato?</AlertDialogTitle>
                      <AlertDialogDescription>
                          ¿Estás seguro de que quieres eliminar el plato <strong>"{dish.name}"</strong>? 
                          Esta acción no se puede deshacer y el plato desaparecerá del menú público.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>
                          Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={confirmDelete}
                        className={cn(buttonVariants({ variant: "destructive" }))}
                      >
                          Sí, eliminar
                      </AlertDialogAction>
                  </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </TableCell>
      </TableRow>
    ));
  };

  if (!isClient) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80 mt-2" />
          </div>
          <Skeleton className="h-10 w-44" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
            <div className="flex flex-col md:flex-row gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-center hidden sm:table-cell">Likes</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {renderTableBody()}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestión de platos</h1>
          <p className="text-lg text-muted-foreground">Crea, edita y gestiona los platos de tu menú.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button onClick={openNewDialog}>
                    <PlusCircle className="mr-2 h-5 w-5" /> Agregar nuevo plato
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{editingDish ? 'Editar plato' : 'Crear nuevo plato'}</DialogTitle>
                    <DialogDescription>
                        {editingDish ? 'Modifica los detalles del plato existente.' : 'Añade un nuevo plato a tu menú.'}
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
                                    <FormLabel>Nombre</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nombre del plato" {...field} />
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
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Descripción del plato" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                           </div>
                           <div className="space-y-4">
                                <FormLabel>Imagen</FormLabel>
                                <div className="relative flex items-center justify-center w-full h-40 border-2 border-dashed rounded-lg">
                                    {imagePreview ? (
                                        <>
                                            <Image src={imagePreview} alt="Vista previa de la imagen" layout="fill" objectFit="cover" className="rounded-lg"/>
                                            <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => { setImagePreview(null); form.setValue("image", null); }}>
                                                <X className="h-4 w-4"/>
                                            </Button>
                                        </>
                                    ) : (
                                        <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-card hover:bg-muted/50 rounded-lg">
                                            <UploadCloud className="h-8 w-8 text-muted-foreground mb-2"/>
                                            <span className="text-sm text-muted-foreground">Subir imagen</span>
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
                                    <FormLabel>Precio</FormLabel>
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
                                    <FormLabel>Categoría</FormLabel>
                                    <FormControl>
                                    <Input placeholder="Categoría del plato" {...field} />
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
                                    <FormLabel>Stock (-1 para ilimitado)</FormLabel>
                                    <FormControl>
                                    <Input type="number" placeholder="Stock del plato" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                         <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>Cancelar</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Guardando...' : <><Save className="mr-2 h-4 w-4"/> {editingDish ? 'Guardar cambios' : 'Guardar plato'}</>}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los platos</CardTitle>
          <CardDescription>Visualiza y administra todos los platos de tu menú.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, descripción..." 
                className="pl-8" 
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="mr-2 h-4 w-4" /> Filtrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Imagen</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Precio</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Likes</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderTableBody()}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de filtros */}
      <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar platos</DialogTitle>
            <DialogDescription>
              Selecciona los criterios para filtrar los platos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {getUniqueCategories().map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className="justify-start"
                  >
                    {category === 'all' ? 'Todas las categorías' : category}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Búsqueda</label>
              <Input
                placeholder="Buscar por nombre, descripción..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="mt-2"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
              <Button onClick={() => setIsFilterModalOpen(false)}>
                Aplicar filtros
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
