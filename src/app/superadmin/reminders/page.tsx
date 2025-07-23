
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LayoutGrid, Settings, FileText, History, Server, AlertTriangle, CheckCircle, CalendarX2, Play, Pause, Save, Edit, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// Mock Data
const mockSummary = {
  dueThisWeek: 12,
  overdue: 5,
  sentToday: 47,
};

const mockReminderHistory = [
    { id: "rem-1", company: "The Burger Joint", type: "7 Days Before", date: "2024-07-30T09:00:00Z", status: "Sent" },
    { id: "rem-2", company: "Pizza Palace", type: "On Expiration", date: "2024-07-29T09:00:00Z", status: "Opened" },
    { id: "rem-3", company: "Sushi Central", type: "3 Days Overdue", date: "2024-07-28T09:00:00Z", status: "Sent" },
    { id: "rem-4", company: "Taco Tuesday", type: "7 Days Before", date: "2024-07-27T09:00:00Z", status: "Failed" },
];

const mockConfigs: ReminderConfig[] = [
  { id: 'cfg-1', name: '7-Day Warning', trigger: '7 days before expiration', status: 'active' },
  { id: 'cfg-2', name: 'Expiration Day Notice', trigger: 'On expiration day', status: 'active' },
  { id: 'cfg-3', name: '3-Day Overdue Alert', trigger: '3 days after expiration', status: 'inactive' },
];

type ReminderConfig = {
    id: string;
    name: string;
    trigger: string;
    status: 'active' | 'inactive';
};

export default function SuperAdminRemindersPage() {
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ReminderConfig | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<ReminderConfig | null>(null);

  // Estado para el modal de edición de plantilla
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{name: string, content: string} | null>(null);
  const [templateContent, setTemplateContent] = useState("");

  // Mock de plantillas
  const templates = [
    { name: 'Estimado cliente, su pago vence pronto...', content: 'Estimado cliente, su pago vence pronto...' },
    { name: 'Estimado cliente, hoy es el día de vencimiento de su pago...', content: 'Estimado cliente, hoy es el día de vencimiento de su pago...' },
    { name: 'Estimado cliente, su pago está vencido. Por favor regularice...', content: 'Estimado cliente, su pago está vencido. Por favor regularice...' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Sent": return <Badge variant="default" className="bg-blue-500 text-white hover:bg-blue-600">Enviado</Badge>;
      case "Opened": return <Badge variant="default" className="bg-green-500 text-white hover:bg-green-600">Abierto</Badge>;
      case "Failed": return <Badge variant="destructive">Fallido</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleEditConfig = (config: ReminderConfig) => {
    setSelectedConfig(config);
    setIsConfigDialogOpen(true);
  };

  const handleNewConfig = () => {
    setSelectedConfig(null);
    setIsConfigDialogOpen(true);
  }

  const handleDeleteClick = (config: ReminderConfig) => {
    setConfigToDelete(config);
    setIsDeleteDialogOpen(true);
  }

  const handleDeleteConfirm = () => {
    // Logic to delete the config would go here.
    toast({
        title: `Configuration "${configToDelete?.name}" deleted.`,
        description: "This is a mock action.",
    });
    setIsDeleteDialogOpen(false);
    setConfigToDelete(null);
  }

  const handleEditTemplate = (template: {name: string, content: string}) => {
    setSelectedTemplate(template);
    setTemplateContent(template.content);
    setIsTemplateDialogOpen(true);
  };
  const handleCloseTemplateDialog = () => {
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
    setTemplateContent("");
  };
  const handleSaveTemplate = () => {
    toast({ title: 'Plantilla guardada', description: 'Los cambios se han guardado correctamente.' });
    setIsTemplateDialogOpen(false);
    setSelectedTemplate(null);
    setTemplateContent("");
  };

  if (!isMounted) {
    return null; // or a loading skeleton
  }


  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/superadmin/dashboard" passHref>
          <Button variant="outline" size="icon" aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary">Recordatorios</h1>
          <p className="text-lg text-muted-foreground">Descripción de la página</p>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="border-b-0 justify-start w-full gap-2 flex-wrap h-auto">
          <TabsTrigger value="summary" className="flex items-center gap-2"><LayoutGrid className="h-4 w-4"/>Resumen</TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2"><Settings className="h-4 w-4"/>Configuración</TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2"><FileText className="h-4 w-4"/>Plantillas</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2"><History className="h-4 w-4"/>Historial</TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2"><Server className="h-4 w-4"/>Sistema</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-6">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Próximos a vencer</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{mockSummary.dueThisWeek}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{mockSummary.overdue}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enviados hoy</CardTitle>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{mockSummary.sentToday}</div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarX2 className="h-5 w-5"/>
                  Próximos recordatorios
                </CardTitle>
                <CardDescription>Descripción de la sección</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-48 border-2 border-dashed rounded-lg">
                  <CalendarX2 className="h-12 w-12 mb-4" />
                  <p>No hay recordatorios próximos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="config" className="mt-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Configuración</CardTitle>
                            <CardDescription>Descripción de la sección</CardDescription>
                        </div>
                        <Button onClick={handleNewConfig}>
                            <PlusCircle className="mr-2 h-4 w-4"/> Nuevo</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockConfigs.map((config) => (
                                <TableRow key={config.id}>
                                    <TableCell className="font-medium">{config.name}</TableCell>
                                    <TableCell>{config.trigger}</TableCell>
                                    <TableCell>
                                        <Badge variant={config.status === 'active' ? 'default' : 'outline'} className={config.status === 'active' ? 'bg-green-500 text-white' : ''}>
                                            {config.status === 'active' ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEditConfig(config)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => handleDeleteClick(config)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Plantillas</CardTitle>
                    <CardDescription>Descripción de la sección</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {templates.map((tpl) => (
                        <div key={tpl.name} className="flex items-center justify-between p-4 border rounded-lg">
                            <p className="font-medium">{tpl.name}</p>
                            <Button variant="outline" size="sm" onClick={() => handleEditTemplate(tpl)}><Edit className="mr-2 h-4 w-4"/>Editar</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Historial</CardTitle>
                    <CardDescription>Descripción de la sección</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead className="text-right">Estado</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockReminderHistory.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.company}</TableCell>
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{format(new Date(item.date), "PPp")}</TableCell>
                                    <TableCell className="text-right">{getStatusBadge(item.status)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="system" className="mt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Sistema</CardTitle>
                    <CardDescription>Descripción de la sección</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <p className="font-semibold">Estado</p>
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="font-medium">En ejecución</span>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p><span className="font-semibold text-foreground">Última ejecución:</span> 2 horas atrás</p>
                        <p><span className="font-semibold text-foreground">Próxima ejecución:</span> En 22 horas</p>
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Button variant="destructive"><Pause className="mr-2 h-4 w-4"/> Pausar</Button>
                        <Button variant="outline"><Play className="mr-2 h-4 w-4"/> Ejecutar ahora</Button>
                    </div>
                </CardContent>
             </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Dialog (for create/edit) */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedConfig ? 'Editar configuración' : 'Crear nueva configuración'}</DialogTitle>
            <DialogDescription>Descripción de la sección</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nombre</Label>
              <Input id="name" defaultValue={selectedConfig?.name || ""} placeholder="Nombre de la configuración" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="triggerType" className="text-right">Tipo de disparo</Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona el tipo de disparo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="before">Antes de la expiración</SelectItem>
                        <SelectItem value="on">El día de la expiración</SelectItem>
                        <SelectItem value="after">Después de la expiración</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="days" className="text-right">Días</Label>
              <Input id="days" type="number" defaultValue="7" placeholder="Días antes o después" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sendingMethod" className="text-right">Método de envío</Label>
                <Select>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Selecciona el método de envío" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="email">Correo electrónico</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxRetries" className="text-right">Intentos máximos</Label>
              <Input id="maxRetries" type="number" defaultValue="3" placeholder="Máximo de intentos" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="retryInterval" className="text-right">Intervalo de reintento</Label>
              <Input id="retryInterval" type="number" defaultValue="24" placeholder="Intervalo entre intentos" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Estado</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch id="status-mode" defaultChecked={selectedConfig?.status === 'active'} />
                <Label htmlFor="status-mode">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => {
                // Mock save action
                toast({ title: "Configuration saved!", description: "This is a mock action."});
                setIsConfigDialogOpen(false);
            }}><Save className="mr-2 h-4 w-4" />Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfigToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de edición de plantilla */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar plantilla</DialogTitle>
            <DialogDescription>{selectedTemplate?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <label className="block mb-2 font-medium" htmlFor="template-content">Contenido del mensaje</label>
            <textarea
              id="template-content"
              className="w-full min-h-[120px] rounded-md border p-2 text-base focus:ring-2 focus:ring-primary focus:outline-none"
              value={templateContent}
              onChange={e => setTemplateContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseTemplateDialog}>Cancelar</Button>
            <Button onClick={handleSaveTemplate}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
