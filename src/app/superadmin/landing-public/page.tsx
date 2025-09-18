

"use client";

import { useState, useEffect, ChangeEvent, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { useLandingConfig } from '@/hooks/use-landing-config';
import type { LandingSection, LandingConfig, LandingSubsection } from '@/services/landing-config-service';
import { storageService } from '@/services/storage-service';
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Palette,
  Type,
  ImageIcon,
  Settings,
  Globe,
  UploadCloud,
  Loader2,
  MessageSquare,
  Star
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useSession } from '@/contexts/session-context';
import { Slider } from '@/components/ui/slider';


const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });


// Función para obtener la configuración por defecto
const getDefaultConfig = (): LandingConfig => ({
  id: 'main',
  heroTitle: 'Título Hero por Defecto',
  heroSubtitle: 'Subtítulo por defecto.',
  heroContent: 'Descubre la revolución para tu NEGOCIO. ¿Tienes una cafetería, pizzería, food truck, panadería, pastelería, servicio de catering o cualquier otro negocio gastronómico? ¡Esta solución es para ti! </br></br>Con nuestro menú digital interactivo, tus clientes explorarán tus platos con fotos de alta calidad y descripciones detalladas, facilitando su elección y aumentando su satisfacción.</br></br>Además, nuestro sistema de gestión integral te permite controlar cada aspecto de tu negocio: desde el inventario y los pedidos hasta las mesas y el personal, todo en una sola plataforma.</br></br>Optimiza tu operación, reduce costos y toma decisiones más inteligentes con datos en tiempo real. Es la solución completa para llevar tu restaurante a un nuevo nivel de eficiencia y rentabilidad.',
  heroButtonText: 'Comenzar',
  heroButtonUrl: '#planes',
  heroBackgroundColor: '#ffffff',
  heroTextColor: '#000000',
  heroButtonColor: '#ff4500',
  sections: [],
  seo: {
    title: 'Página Landing',
    description: 'Descripción por defecto',
    keywords: ['palabra', 'clave'],
    ogTitle: 'Título OG',
    ogDescription: 'Descripción OG',
    ogImage: '',
  }
});


export default function LandingPublicPage() {
  const { landingConfig, isLoading, updateConfig } = useLandingConfig();
  const { currentUser } = useSession();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<LandingConfig>(getDefaultConfig());
  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState(false);
  
  const [pendingFiles, setPendingFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    if (landingConfig && landingConfig.id !== 'main-default') {
      setFormData({
        ...getDefaultConfig(),
        ...landingConfig,
        sections: (landingConfig.sections || []).map(s => ({
            ...s,
            subsections: (s.subsections || []).map(sub => ({
                ...sub,
                imageRadius: sub.imageRadius ?? 50,
            }))
        })),
        seo: { ...getDefaultConfig().seo, ...(landingConfig.seo || {}) }
      });
    }
  }, [landingConfig]);

  const handleSave = async () => {
    if (!currentUser) {
      toast({ title: "Error de autenticación", description: "No se pudo verificar el usuario.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const configToSave: Partial<LandingConfig> = { ...formData };
      await updateConfig(configToSave, currentUser.id, currentUser.email);
      
      toast({
        title: "Éxito",
        description: "Configuración de la landing guardada correctamente",
      });
    } catch (error: any) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error al Guardar",
        description: `No se pudo guardar la configuración: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

    const handleFileSelection = (e: ChangeEvent<HTMLInputElement>, subsectionId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingFiles(prev => ({ ...prev, [subsectionId]: file }));
        }
    };
  
    const handleSubsectionImageUpload = async (sectionIndex: number, subIndex: number) => {
        const subsectionId = formData.sections[sectionIndex].subsections![subIndex].id;
        const file = pendingFiles[subsectionId];
        
        if (!file) {
            toast({ title: 'No hay archivo', description: 'Por favor, selecciona una imagen primero.', variant: 'destructive' });
            return;
        }

        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
          toast({
            title: "Archivo no válido",
            description: "Por favor, selecciona una imagen (JPG, PNG, WEBP).",
            variant: "destructive",
          });
          return;
        }

        if (file.size > maxSize) {
          toast({
            title: "Archivo demasiado grande",
            description: "La imagen no puede pesar más de 5MB.",
            variant: "destructive",
          });
          return;
        }

        setUploading(prev => ({ ...prev, [subsectionId]: true }));

        try {
          const imageUrl = await storageService.uploadFile(file, `subsections/`);
          
          updateSubsection(sectionIndex, subIndex, 'imageUrl', imageUrl);
          setPendingFiles(prev => ({ ...prev, [subsectionId]: null }));

          toast({
            title: "Imagen subida",
            description: "La imagen se ha subido correctamente. Recuerda guardar los cambios.",
          });

        } catch (error: any) {
          toast({
            title: "Error de subida",
            description: error.message || "No se pudo subir la imagen.",
            variant: "destructive",
          });
        } finally {
          setUploading(prev => ({ ...prev, [subsectionId]: false }));
        }
    };
  
  const updateSubsection = (sectionIndex: number, subIndex: number, field: string, value: any) => {
     setFormData(prev => {
      const newSections = [...prev.sections];
      const newSubsections = [...(newSections[sectionIndex].subsections || [])];
      newSubsections[subIndex] = { ...newSubsections[subIndex], [field]: value };
      newSections[sectionIndex] = { ...newSections[sectionIndex], subsections: newSubsections };
      return { ...prev, sections: newSections };
    });
  };

  const addSection = (type: 'features' | 'services' | 'about' | 'contact' | 'testimonials' = 'features') => {
    const newSection: LandingSection = {
      id: `section-${Date.now()}`,
      type: type,
      title: 'Nueva Sección',
      subtitle: '',
      content: 'Contenido de la nueva sección',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#3b82f6',
      buttonText: 'Ver más',
      buttonUrl: '',
      imageUrl: '',
      order: formData.sections.length,
      isActive: true,
      animation: 'fadeIn',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: [],
      subsections: [],
    };

    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...formData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      newSections.forEach((sec, idx) => sec.order = idx);
      
      setFormData(prev => ({
        ...prev,
        sections: newSections
      }));
    }
  };

  const updateSection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

    const addSubsection = (sectionIndex: number) => {
    const newSub: LandingSubsection = { id: `sub-${Date.now()}`, title: 'Nuevo Título', content: 'Nueva descripción.', imageUrl: '', authorRole: '', imageRadius: 0 };
    const newSections = [...formData.sections];
    newSections[sectionIndex].subsections = [...(newSections[sectionIndex].subsections || []), newSub];
    setFormData(prev => ({ ...prev, sections: newSections }));
  };

  const removeSubsection = (sectionIndex: number, subIndex: number) => {
    const newSections = [...formData.sections];
    if (newSections[sectionIndex]?.subsections) {
        newSections[sectionIndex].subsections = newSections[sectionIndex].subsections!.filter((_, i) => i !== subIndex);
        setFormData(prev => ({ ...prev, sections: newSections }));
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="text-lg">Cargando configuración...</div>
        </div>
    );
  }
  
  const testimonialsSection = formData.sections.find(s => s.type === 'testimonials') || null;
  const testimonialsSectionIndex = formData.sections.findIndex(s => s.type === 'testimonials');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Landing Pública</h1>
          <p className="text-muted-foreground">Edita la configuración de la página principal</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Ocultar Vista Previa' : 'Vista Previa'}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const defaultConfigValues = getDefaultConfig();
              setFormData(prev => ({
                ...prev,
                sections: defaultConfigValues.sections
              }));
              toast({
                title: "Secciones por defecto",
                description: "Se han cargado las secciones por defecto",
              });
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Cargar Secciones por Defecto
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="sections">Secciones</TabsTrigger>
              <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            <TabsContent value="hero" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Configuración del Hero
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroTitle">Título Principal</Label>
                      <Input
                        id="heroTitle"
                        value={formData.heroTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroTitle: e.target.value }))}
                        placeholder="Título principal de la landing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroSubtitle">Subtítulo</Label>
                      <Input
                        id="heroSubtitle"
                        value={formData.heroSubtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                        placeholder="Subtítulo descriptivo"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="heroContent">Contenido Adicional (HTML)</Label>
                    <Suspense fallback={<div className="h-32 w-full bg-muted rounded-md animate-pulse" />}>
                      <RichTextEditor
                        value={formData.heroContent || ''}
                        onChange={(value) => {
                          // Evitar guardar un string vacío que solo contiene <p><br></p>
                          const cleanValue = value === '<p><br></p>' ? '' : value;
                          setFormData(prev => ({ ...prev, heroContent: cleanValue }));
                        }}
                      />
                    </Suspense>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="heroButtonText">Texto del Botón</Label>
                      <Input
                        id="heroButtonText"
                        value={formData.heroButtonText}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroButtonText: e.target.value }))}
                        placeholder="¡Comenzar ahora!"
                      />
                    </div>
                    <div>
                      <Label htmlFor="heroButtonUrl">URL del Botón</Label>
                      <Input
                        id="heroButtonUrl"
                        value={formData.heroButtonUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, heroButtonUrl: e.target.value }))}
                        placeholder="#contact"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="heroBackgroundColor">Color de Fondo</Label>
                      <div className="flex gap-2">
                        <Input
                          id="heroBackgroundColor"
                          type="color"
                          value={formData.heroBackgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroBackgroundColor: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.heroBackgroundColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroBackgroundColor: e.target.value }))}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="heroTextColor">Color de Texto</Label>
                      <div className="flex gap-2">
                        <Input
                          id="heroTextColor"
                          type="color"
                          value={formData.heroTextColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroTextColor: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.heroTextColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroTextColor: e.target.value }))}
                          placeholder="#1f2937"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="heroButtonColor">Color del Botón</Label>
                      <div className="flex gap-2">
                        <Input
                          id="heroButtonColor"
                          type="color"
                          value={formData.heroButtonColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroButtonColor: e.target.value }))}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={formData.heroButtonColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroButtonColor: e.target.value }))}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Secciones de Contenido
                    </span>
                    <Button onClick={() => addSection('features')} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Sección
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.sections.filter(s => s.type !== 'testimonials').map((section, index) => (
                    <Card key={section.id} className="border-2">
                       <CardHeader className="pb-3 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Sección {section.order + 1}</Badge>
                            <Select
                              value={section.type}
                              onValueChange={(value) => updateSection(index, 'type', value)}
                            >
                              <SelectTrigger className="w-40 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="features">Características</SelectItem>
                                <SelectItem value="services">Servicios</SelectItem>
                                <SelectItem value="about">Sobre Nosotros</SelectItem>
                                <SelectItem value="contact">Contacto</SelectItem>
                                <SelectItem value="testimonials">Testimonios</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={section.isActive}
                              onCheckedChange={(checked) => updateSection(index, 'isActive', checked)}
                              title={section.isActive ? 'Ocultar sección' : 'Mostrar sección'}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              title="Mover arriba"
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                               className="h-8 w-8"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === formData.sections.length - 1}
                              title="Mover abajo"
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeSection(index)}
                              title="Eliminar sección"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                            <Label>Título</Label>
                            <Input
                                value={section.title}
                                onChange={(e) => updateSection(index, 'title', e.target.value)}
                                placeholder="Título de la sección"
                            />
                            </div>
                            <div>
                                <Label>Subtítulo</Label>
                                <Input
                                value={section.subtitle}
                                onChange={(e) => updateSection(index, 'subtitle', e.target.value)}
                                placeholder="Subtítulo opcional"
                                />
                            </div>
                        </div>
                         <div>
                            <Label>Contenido Adicional (HTML)</Label>
                            <Suspense fallback={<div className="h-32 w-full bg-muted rounded-md animate-pulse" />}>
                               <RichTextEditor
                                value={section.content || ''}
                                onChange={(value) => {
                                  const cleanValue = value === '<p><br></p>' ? '' : value;
                                  updateSection(index, 'content', cleanValue);
                                }}
                               />
                            </Suspense>
                        </div>
                         {/* Gestión de Subsecciones */}
                        <Separator />
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <Label className="font-semibold">Subsecciones (Columnas/Tarjetas)</Label>
                            <Button size="xs" variant="outline" onClick={() => addSubsection(index)}>
                              <Plus className="w-3 h-3 mr-1" /> Añadir
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {section.subsections?.map((sub, subIdx) => {
                              const subsectionId = sub.id;
                              const previewUrl = pendingFiles[subsectionId]
                                ? URL.createObjectURL(pendingFiles[subsectionId]!)
                                : sub.imageUrl || "https://placehold.co/100x100.png?text=IMG";

                              return (
                                <div key={sub.id} className="p-3 border rounded-md bg-background space-y-2">
                                  <div className="flex justify-between items-center">
                                      <span className="text-xs font-medium text-muted-foreground">Tarjeta {subIdx + 1}</span>
                                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeSubsection(index, subIdx)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <Input value={sub.title} onChange={(e) => updateSubsection(index, subIdx, 'title', e.target.value)} placeholder="Título de la tarjeta" />
                                    <RichTextEditor value={sub.content} onChange={(value) => updateSubsection(index, subIdx, 'content', value || '')} placeholder="Contenido de la tarjeta" />
                                  </div>
                                  <div>
                                    <Label>Imagen</Label>
                                     <div className="flex items-center gap-2">
                                          <Image src={previewUrl} alt="Vista previa" width={64} height={64} className="rounded-md border object-cover h-16 w-16" />
                                          <Button variant="outline" asChild size="sm">
                                              <label htmlFor={`sub-img-${sub.id}`} className="cursor-pointer">
                                                  <UploadCloud className="mr-2 h-4 w-4"/>
                                                  Seleccionar
                                                  <input id={`sub-img-${sub.id}`} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelection(e, subsectionId)}/>
                                              </label>
                                          </Button>
                                          {pendingFiles[subsectionId] && (
                                              <Button size="sm" onClick={() => handleSubsectionImageUpload(index, subIdx)} disabled={uploading[subsectionId]}>
                                                  {uploading[subsectionId] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                                                  Subir
                                              </Button>
                                          )}
                                      </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="testimonials">
                 <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Gestión de Testimonios
                        </span>
                    </CardTitle>
                    </CardHeader>
                    <CardContent>
                    {testimonialsSection ? (
                        <div className="space-y-4">
                        {(testimonialsSection.subsections || []).map((sub, subIdx) => (
                            <Card key={sub.id} className="p-4 relative overflow-visible bg-background border">
                            <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => {
                                const newSubs = testimonialsSection.subsections!.filter((_, i) => i !== subIdx);
                                updateSection(testimonialsSectionIndex, 'subsections', newSubs);
                            }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4">
                                <div className="space-y-2">
                                <Label>Imagen del Autor</Label>
                                <div className="relative mx-auto" style={{ width: `${64 + (sub.imageRadius || 0)}px`, height: `${64 + (sub.imageRadius || 0)}px` }}>
                                    <Image 
                                        src={sub.imageUrl || "https://placehold.co/100x100.png?text=Autor"}
                                        alt="Vista previa de autor"
                                        fill
                                        className="object-cover border-4 border-white shadow-lg"
                                        style={{ borderRadius: `50%` }}
                                    />
                                </div>
                                <Button variant="outline" asChild size="sm" className="w-full mt-2">
                                    <label htmlFor={`sub-img-${sub.id}`} className="cursor-pointer">
                                        {uploading[sub.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                                        {uploading[sub.id] ? "Subiendo..." : "Subir Imagen"}
                                        <input 
                                        id={`sub-img-${sub.id}`}
                                        type="file"
                                        className="hidden"
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={(e) => handleFileSelection(e, sub.id)}
                                        disabled={uploading[sub.id]}
                                        />
                                    </label>
                                    </Button>
                                    {pendingFiles[sub.id] && (
                                        <Button size="sm" onClick={() => handleSubsectionImageUpload(testimonialsSectionIndex, subIdx)} disabled={uploading[sub.id]}>
                                            <UploadCloud className="mr-2 h-4 w-4"/> Subir
                                        </Button>
                                    )}
                                <div className="space-y-1 mt-2">
                                    <Label>Radio del Círculo</Label>
                                    <Slider
                                        value={[sub.imageRadius || 0]}
                                        max={64}
                                        step={1}
                                        onValueChange={(value) => updateSubsection(testimonialsSectionIndex, subIdx, 'imageRadius', value[0])}
                                    />
                                </div>
                                </div>
                                <div className="space-y-4">
                                <div className="space-y-1">
                                    <Label>Nombre del Autor</Label>
                                <Input
                                    value={sub.title}
                                    onChange={e => updateSubsection(testimonialsSectionIndex, subIdx, 'title', e.target.value)}
                                    placeholder={'Nombre del Autor'}
                                />
                                </div>
                                <div className="space-y-1">
                                    <Label>Cargo/Empresa del Autor</Label>
                                <Input
                                    value={sub.authorRole || ''}
                                    onChange={e => updateSubsection(testimonialsSectionIndex, subIdx, 'authorRole', e.target.value)}
                                    placeholder="Cargo/Empresa del Autor"
                                />
                                </div>
                                <div className="space-y-1">
                                    <Label>Cita del Testimonio</Label>
                                <RichTextEditor
                                    value={sub.content}
                                    onChange={value => updateSubsection(testimonialsSectionIndex, subIdx, 'content', value || '')}
                                    placeholder={'Cita del testimonio...'}
                                />
                                </div>
                                </div>
                            </div>
                            </Card>
                        ))}
                        <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                            const newSub = { id: `sub-${Date.now()}`, title: '', content: '', imageUrl: '', authorRole: '', imageRadius: 0 };
                            updateSection(testimonialsSectionIndex, 'subsections', [...(testimonialsSection.subsections || []), newSub]);
                        }}>
                            <Plus className="mr-2 h-4 w-4"/>
                            Añadir Testimonio
                        </Button>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg">
                        <p>Para gestionar testimonios, primero añade una sección de tipo "Testimonios" en la pestaña de Secciones.</p>
                        <Button className="mt-4" onClick={() => addSection('testimonials')}>Habilitar Sección de Testimonios</Button>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </TabsContent>


            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Configuración SEO
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">Título SEO</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seo.title}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { ...prev.seo, title: e.target.value }
                      }))}
                      placeholder="Título para motores de búsqueda"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">Descripción SEO</Label>
                    <RichTextEditor
                      value={formData.seo.description}
                      onChange={(value) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { ...prev.seo, description: value }
                      }))}
                      placeholder="Descripción para motores de búsqueda"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoKeywords">Palabras Clave</Label>
                    <Input
                      id="seoKeywords"
                      value={formData.seo.keywords.join(', ')}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { 
                          ...prev.seo, 
                          keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                        }
                      }))}
                      placeholder="palabra1, palabra2, palabra3"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vista previa en tiempo real */}
        <div className={`sticky top-6 ${previewMode ? 'block' : 'hidden'} lg:block`}>
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-y-auto max-h-[80vh] bg-white">
                    <div 
                        className="text-center py-12 px-4"
                        style={{ 
                        backgroundColor: formData.heroBackgroundColor,
                        color: formData.heroTextColor
                        }}
                    >
                        <h1 className="text-4xl font-bold mb-4">{formData.heroTitle}</h1>
                        <p className="text-xl mb-6">{formData.heroSubtitle}</p>
                         {formData.heroContent && <div className="text-base max-w-3xl mx-auto mb-8 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formData.heroContent }} />}
                        <button
                        className="px-8 py-3 rounded-lg font-semibold"
                        style={{ backgroundColor: formData.heroButtonColor, color: '#ffffff' }}
                        >
                        {formData.heroButtonText}
                        </button>
                    </div>

                    {formData.sections.filter(s => s.isActive).map((section, index) => (
                        <div
                        key={index}
                        className="py-12 px-4"
                        style={{ 
                            backgroundColor: section.backgroundColor,
                            color: section.textColor
                        }}
                        >
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                            {section.subtitle && (
                            <p className="text-xl mb-6">{section.subtitle}</p>
                            )}
                            {section.content && <div className="text-base max-w-3xl mx-auto mb-8 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: section.content }} />}
                            {section.buttonText && <button
                            className="px-6 py-2 rounded-lg font-semibold"
                            style={{ backgroundColor: section.buttonColor, color: '#ffffff' }}
                            >
                            {section.buttonText}
                            </button>}
                        </div>

                        {section.subsections && section.subsections.length > 0 && section.type !== 'testimonials' && (
                            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            {section.subsections.map(sub => (
                                <div key={sub.id} className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center text-center text-gray-800">
                                {sub.imageUrl && <Image src={sub.imageUrl} alt={sub.title} width={80} height={80} className="mb-4 w-20 h-20 object-cover rounded-full" />}
                                <h4 className="font-bold text-lg mb-2">{sub.title}</h4>
                                <div className="text-sm" dangerouslySetInnerHTML={{ __html: sub.content }}/>
                                </div>
                            ))}
                            </div>
                        )}
                        
                        {section.type === 'testimonials' && section.subsections && section.subsections.length > 0 && (
                            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                                {section.subsections.map(sub => (
                                    <Card key={sub.id} className="bg-white/80 backdrop-blur-sm text-gray-800">
                                        <CardContent className="p-6 text-center">
                                            <div className="relative mx-auto mb-4" style={{ width: `${64 + (sub.imageRadius || 0)}px`, height: `${64 + (sub.imageRadius || 0)}px` }}>
                                                <Image 
                                                    src={sub.imageUrl || 'https://placehold.co/100x100.png'} 
                                                    alt={sub.title}
                                                    fill
                                                    className="object-cover border-4 border-white shadow-lg"
                                                    style={{ borderRadius: `50%` }}
                                                />
                                            </div>
                                            <div className="text-lg italic mb-4" dangerouslySetInnerHTML={{ __html: sub.content }}/>
                                            <p className="font-bold text-primary">{sub.title}</p>
                                            {sub.authorRole && <p className="text-sm text-muted-foreground">{sub.authorRole}</p>}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                        </div>
                    ))}
                </div>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
