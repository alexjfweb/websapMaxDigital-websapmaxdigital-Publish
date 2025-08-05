
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { Save, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationConfig } from '@/hooks/use-navigation-config';

// Base items structure to provide context if config is loading/missing
const baseNavItems = [
  // Superadmin
  { id: 'sa-dashboard', label: 'Panel (SA)', role: 'superadmin' },
  { id: 'sa-companies', label: 'Empresas', role: 'superadmin' },
  // ... add all other base items if needed for a complete skeleton
];

export default function NavigationSettingsPage() {
  const { navConfig, isLoading, isError, updateConfig } = useNavigationConfig();
  const [localNavConfig, setLocalNavConfig] = useState(navConfig);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Sync local state when fetched config changes
    setLocalNavConfig(navConfig);
  }, [navConfig]);
  
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localNavConfig);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order property
    const updatedItems = items.map((item, index) => ({ ...item, order: index }));
    
    setLocalNavConfig(updatedItems);
  };

  const handleFieldChange = (id: string, field: 'label' | 'tooltip' | 'visible', value: string | boolean) => {
    const updatedItems = localNavConfig.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setLocalNavConfig(updatedItems);
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateConfig(localNavConfig);
      toast({
        title: '¡Éxito!',
        description: 'La configuración de navegación ha sido guardada.',
      });
    } catch (error) {
       toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración.',
        variant: 'destructive',
      });
    } finally {
        setIsSaving(false);
    }
  };

  const renderSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-10"></TableHead>
          <TableHead>Etiqueta del Menú</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead className="text-center">Visible</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton className="h-5 w-5"/></TableCell>
            <TableCell><Skeleton className="h-5 w-32"/></TableCell>
            <TableCell><Skeleton className="h-5 w-20"/></TableCell>
            <TableCell className="text-center"><Skeleton className="h-5 w-10 mx-auto"/></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Editor de Navegación</CardTitle>
              <CardDescription>
                Personaliza las etiquetas, el orden y la visibilidad de los elementos del menú principal.
              </CardDescription>
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving || isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {isLoading ? renderSkeleton() : isError ? <p className="text-destructive">Error al cargar la configuración.</p> : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Etiqueta del Menú</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-center">Visible</TableHead>
                </TableRow>
              </TableHeader>
              <Droppable droppableId="navigationItems">
                {(provided) => (
                  <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                    {localNavConfig.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <TableRow ref={provided.innerRef} {...provided.draggableProps} className="bg-card hover:bg-muted/50">
                            <TableCell {...provided.dragHandleProps} className="cursor-grab">
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={item.label}
                                onChange={(e) => handleFieldChange(item.id, 'label', e.target.value)}
                              />
                            </TableCell>
                            <TableCell>
                              <span className="text-sm capitalize text-muted-foreground">{item.roles.join(', ')}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Switch
                                checked={item.visible}
                                onCheckedChange={(checked) => handleFieldChange(item.id, 'visible', checked)}
                              />
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </TableBody>
                )}
              </Droppable>
            </Table>
          </DragDropContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
