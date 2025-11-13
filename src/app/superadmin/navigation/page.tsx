"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useToast } from '@/hooks/use-toast';
import { Save, GripVertical } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationConfig } from '@/hooks/use-navigation-config';
import type { NavItemConfig } from '@/services/navigation-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DraggableNavTableProps {
  items: NavItemConfig[];
  onDragEnd: (result: DropResult) => void;
  onFieldChange: (id: string, field: 'label' | 'tooltip' | 'visible', value: string | boolean) => void;
  droppableId: string;
}

const DraggableNavTable: React.FC<DraggableNavTableProps> = ({ items, onDragEnd, onFieldChange, droppableId }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Etiqueta del Menú</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-center">Visible</TableHead>
          </TableRow>
        </TableHeader>
        <Droppable droppableId={droppableId}>
          {(provided) => (
            <TableBody {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided) => (
                    <TableRow ref={provided.innerRef} {...provided.draggableProps} className="bg-card hover:bg-muted/50">
                      <TableCell {...provided.dragHandleProps} className="cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.label}
                          onChange={(e) => onFieldChange(item.id, 'label', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <span className="text-sm capitalize text-muted-foreground">{item.roles.join(', ')}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={item.visible}
                          onCheckedChange={(checked) => onFieldChange(item.id, 'visible', checked)}
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
  );
};


export default function NavigationSettingsPage() {
  const { navConfig, isLoading, isError, saveConfig, isSaving, setNavConfig } = useNavigationConfig();
  const { toast } = useToast();
  
  const handleDragEnd = (result: DropResult, type: 'sidebar' | 'footer') => {
    if (!result.destination) return;
    
    setNavConfig((prevConfig) => {
        if (!prevConfig) return prevConfig;
        const items = Array.from(type === 'sidebar' ? prevConfig.sidebarItems : prevConfig.footerItems);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination!.index, 0, reorderedItem);
        const updatedItems = items.map((item, index) => ({ ...item, order: index }));

        return {
            ...prevConfig,
            [type === 'sidebar' ? 'sidebarItems' : 'footerItems']: updatedItems
        };
    });
  };

  const handleFieldChange = (id: string, field: 'label' | 'tooltip' | 'visible', value: string | boolean, type: 'sidebar' | 'footer') => {
    setNavConfig((prevConfig) => {
        if (!prevConfig) return prevConfig;
        const key = type === 'sidebar' ? 'sidebarItems' : 'footerItems';
        const updatedItems = prevConfig[key].map(item =>
            item.id === id ? { ...item, [field]: value } : item
        );
        return { ...prevConfig, [key]: updatedItems };
    });
  };

  const handleSaveChanges = async () => {
    try {
      await saveConfig(navConfig);
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
                Personaliza las etiquetas, el orden y la visibilidad de los menús de la aplicación.
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
            <Tabs defaultValue="sidebar" className="w-full">
              <TabsList>
                <TabsTrigger value="sidebar">Navegación Lateral (Principal)</TabsTrigger>
                <TabsTrigger value="footer">Navegación Inferior (Móvil)</TabsTrigger>
              </TabsList>
              <TabsContent value="sidebar" className="mt-4">
                 <DraggableNavTable 
                    items={navConfig?.sidebarItems || []}
                    onDragEnd={(result) => handleDragEnd(result, 'sidebar')}
                    onFieldChange={(id, field, value) => handleFieldChange(id, field, value, 'sidebar')}
                    droppableId="sidebarItems"
                 />
              </TabsContent>
              <TabsContent value="footer" className="mt-4">
                 <DraggableNavTable 
                    items={navConfig?.footerItems || []}
                    onDragEnd={(result) => handleDragEnd(result, 'footer')}
                    onFieldChange={(id, field, value) => handleFieldChange(id, field, value, 'footer')}
                    droppableId="footerItems"
                 />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
