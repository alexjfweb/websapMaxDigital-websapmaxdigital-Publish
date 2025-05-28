import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit3, Trash2, Search, Filter, UploadCloud } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { mockDishes } from "@/lib/mock-data"; // Assuming mock dishes are available

// Mock function to render stars
const renderStars = (likes: number) => {
  return Array(5).fill(0).map((_, i) => (
    <svg key={i} className={`h-4 w-4 ${i < likes ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
  ));
};

export default function AdminDishesPage() {
  // State for search, filter, dialogs, and CRUD operations would go here.
  const dishes = mockDishes;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dish Management</h1>
          <p className="text-lg text-muted-foreground">Add, edit, or remove dishes from your menu.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Dish
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Dishes</CardTitle>
          <CardDescription>Overview of all menu items.</CardDescription>
          <div className="flex flex-col md:flex-row gap-2 pt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search dishes..." className="pl-8" />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filter by Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden md:table-cell">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Likes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    {dish.stock === -1 ? <Badge variant="secondary">Unlimited</Badge> : 
                     dish.stock === 0 ? <Badge variant="destructive">Out</Badge> : 
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

      {/* Placeholder for Add/Edit Dish Modal/Dialog */}
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingDish ? 'Edit Dish' : 'Add New Dish'}</DialogTitle>
            <DialogDescription>
              {editingDish ? 'Update the details of this dish.' : 'Fill in the details for the new menu item.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             Form fields for dish name, description, price, category, stock, likes, image upload 
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
