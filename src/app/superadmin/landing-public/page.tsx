
"use client";

import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@/contexts/session-context';
import { landingConfigService } from '@/services/landing-config-service';
import type { LandingSection, LandingConfig } from '@/services/landing-config-service';
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
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingPublicPage() {
  const { currentUser } = useSession();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [subsectionFiles, setSubsectionFiles] = useState<Record<string, File | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      setIsLoading(true);
      setIsError(false);
      try {
        let config = await landingConfigService.getLandingConfig();
        if (!config) {
          console.log("No config found, creating one from default.");
          config = landingConfigService.getDefaultConfig();
          await landingConfigService.createLandingConfig(config, currentUser.id, currentUser.email);
        }
        
        const defaultConfig = landingConfigService.getDefaultConfig();
        setFormData({
          ...defaultConfig,
          ...config,
          sections: config.sections?.map(s => ({
            ...s,
            subsections: s.subsections || []
          })) || defaultConfig.sections,
          seo: { ...defaultConfig.seo, ...(config.seo || {}) }
        });

      } catch (err) {
        setIsError(true);
        toast({
          title: "Error al cargar configuración",
          description: "No se pudo obtener la configuración de la base de datos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    if(currentUser) {
        fetchConfig();
    }
  }, [currentUser, toast]);

  const handleSave = async () => {
    if (!formData) return;
    if (!currentUser) {
      toast({ title: "Error de autenticación", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      await landingConfigService.updateLandingConfig(formData, currentUser.id, currentUser.email);
      toast({
        title: "Éxito",
        description: "Configuración de la landing guardada correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelectionChange = (subsectionId: string, file: File | null) => {
    if (!subsectionId) {
        toast({ title: "Error", description: "ID de la subsección no definido. Guarda los cambios antes de subir la imagen.", variant: "destructive"});
        return;
    }
    setSubsectionFiles(prev => ({ ...prev, [subsectionId]: file }));
  };
  
  const handleSubsectionImageUpload = async (sectionIndex: number, subIndex: number) => {
      if (!formData) return;
  
      const subsectionId = formData.sections[sectionIndex].subsections![subIndex].id;
      if (!subsectionId) {
          toast({ title: "Error", description: "ID de la subsección no encontrado. Guarda la sección antes de subir la imagen.", variant: "destructive"});
          return;
      }
      
      const file = subsectionFiles[subsectionId];
  
      if (!file) {
          toast({ title: "Archivo no seleccionado", description: "Por favor, selecciona un archivo antes de subir.", variant: "destructive"});
          return;
      }
  
      setUploading(prev => ({ ...prev, [subsectionId]: true }));
      toast({ title: "Subiendo y optimizando imagen...", description: "Este proceso puede tardar unos segundos." });
  
      try {
          const imageUrl = await storageService.compressAndUploadFile(file);
          
          if (imageUrl) {
              updateSubsection(sectionIndex, subIndex, 'imageUrl', imageUrl);
              setSubsectionFiles(prev => ({...prev, [subsectionId]: null}));
              toast({ title: "Imagen subida", description: "La imagen se ha subido y actualizado correctamente." });
          } else {
              toast({ title: "Error de Subida", description: "La subida devolvió un resultado nulo.", variant: "destructive"});
          }
  
      } catch (error: any) {
          toast({ title: "Error de subida", description: error.message || "No se pudo subir la imagen.", variant: "destructive" });
      } finally {
          setUploading(prev => ({ ...prev, [subsectionId]: false }));
      }
  };
  
  const updateSubsection = (sectionIndex: number, subIndex: number, field: string, value: any) => {
    setFormData(prev => {
        if (!prev) return null;
        
        const newSections = JSON.parse(JSON.stringify(prev.sections)); // Deep copy
        
        if (newSections[sectionIndex] && newSections[sectionIndex].subsections && newSections[sectionIndex].subsections[subIndex]) {
            newSections[sectionIndex].subsections[subIndex][field] = value;
        }

        return {
            ...prev,
            sections: newSections,
        };
    });
  };


  const addSection = () => {
    const newSection: LandingSection = {
      id: `section-${Date.now()}`,
      type: 'features',
      title: 'Nueva Sección',
      subtitle: '',
      content: 'Contenido de la nueva sección',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      buttonColor: '#3b82f6',
      buttonText: 'Ver más',
      buttonUrl: '',
      imageUrl: '',
      order: formData?.sections.length || 0,
      isActive: true,
      animation: 'fadeIn',
      subsections: [],
    };

    setFormData(prev => prev ? ({ ...prev, sections: [...prev.sections, newSection] }) : null);
  };

  const removeSection = (index: number) => {
    setFormData(prev => prev ? ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }) : null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!formData) return;
    const newSections = [...formData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < newSections.length) {
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      newSections.forEach((s, i) => s.order = i); // Re-assign order
      setFormData(prev => prev ? ({ ...prev, sections: newSections }) : null);
    }
  };

  const updateSection = (index: number, field: string, value: any) => {
    setFormData(prev => {
        if (!prev) return null;
        return {
            ...prev,
            sections: prev.sections.map((section, i) => i === index ? { ...section, [field]: value } : section)
        }
    });
  };

  if (isLoading || !formData) {
    return (
      <div class="space-y-6">
        <div class="flex justify-between items-center"><Skeleton class="h-10 w-64"/><div class="flex gap-2"><Skeleton class="h-10 w-24"/><Skeleton class="h-10 w-32"/></div></div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><CardContent class="p-6"><Skeleton class="h-96 w-full" /></CardContent></Card><div class="sticky top-6"><Card><CardContent class="p-6"><Skeleton class="h-96 w-full" /></CardContent></Card></div></div>
      </div>
    );
  }

  if (isError) {
      return (<div class="flex flex-col items-center justify-center h-64 text-destructive-foreground bg-destructive/80 rounded-lg p-8"><AlertCircle class="h-12 w-12 mb-4"/><h2 class="text-2xl font-bold">Error al Cargar la Configuración</h2><p>No se pudo obtener la configuración de la landing page. Por favor, recarga la página o contacta a soporte.</p></div>)
  }

  return (
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div><h1 class="text-3xl font-bold">Landing Pública</h1><p class="text-muted-foreground">Edita la configuración de la página principal</p></div>
        <div class="flex gap-2"><Button variant="outline" onClick={() => setPreviewMode(!previewMode)}><Eye class="w-4 h-4 mr-2" />{previewMode ? 'Ocultar Vista Previa' : 'Vista Previa'}</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 class="mr-2 h-4 w-4 animate-spin"/> : <Save class="w-4 h-4 mr-2" />}{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button></div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList class="grid w-full grid-cols-4">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="sections">Secciones</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
            </TabsList>
            <TabsContent value="hero" class="space-y-4">
              <Card><CardHeader><CardTitle class="flex items-center gap-2"><Type class="w-5 h-5" />Configuración del Hero</CardTitle></CardHeader>
                <CardContent class="space-y-4">
                  <div class="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="heroTitle">Título Principal</Label><Input id="heroTitle" value={formData.heroTitle} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroTitle: e.target.value }) : null)} placeholder="Título principal de la landing"/></div>
                    <div><Label htmlFor="heroSubtitle">Subtítulo</Label><Input id="heroSubtitle" value={formData.heroSubtitle} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroSubtitle: e.target.value }) : null)} placeholder="Subtítulo descriptivo"/></div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div><Label htmlFor="heroButtonText">Texto del Botón</Label><Input id="heroButtonText" value={formData.heroButtonText} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroButtonText: e.target.value }) : null)} placeholder="¡Comenzar ahora!"/></div>
                    <div><Label htmlFor="heroButtonUrl">URL del Botón</Label><Input id="heroButtonUrl" value={formData.heroButtonUrl} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroButtonUrl: e.target.value }) : null)} placeholder="#contact"/></div>
                  </div>
                  <Separator />
                  <div class="grid grid-cols-3 gap-4">
                    <div><Label htmlFor="heroBackgroundColor">Color de Fondo</Label><div class="flex gap-2"><Input id="heroBackgroundColor" type="color" value={formData.heroBackgroundColor} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroBackgroundColor: e.target.value }) : null)} class="w-16 h-10"/><Input value={formData.heroBackgroundColor} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroBackgroundColor: e.target.value }) : null)} placeholder="#ffffff"/></div></div>
                    <div><Label htmlFor="heroTextColor">Color de Texto</Label><div class="flex gap-2"><Input id="heroTextColor" type="color" value={formData.heroTextColor} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroTextColor: e.target.value }) : null)} class="w-16 h-10"/><Input value={formData.heroTextColor} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroTextColor: e.target.value }) : null)} placeholder="#1f2937"/></div></div>
                    <div><Label htmlFor="heroButtonColor">Color del Botón</Label><div class="flex gap-2"><Input id="heroButtonColor" type="color" value={formData.heroButtonColor} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroButtonColor: e.target.value }) : null)} class="w-16 h-10"/><Input value={formData.heroButtonColor} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroButtonColor: e.target.value }) : null)} placeholder="#3b82f6"/></div></div>
                  </div>
                  <div><Label htmlFor="heroAnimation">Animación</Label><Select value={formData.heroAnimation} onValueChange={(value) => setFormData(prev => prev ? ({ ...prev, heroAnimation: value as any }) : null)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fadeIn">Fade In</SelectItem><SelectItem value="slideUp">Slide Up</SelectItem><SelectItem value="slideLeft">Slide Left</SelectItem><SelectItem value="slideRight">Slide Right</SelectItem><SelectItem value="zoomIn">Zoom In</SelectItem><SelectItem value="none">Sin Animación</SelectItem></SelectContent></Select></div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sections" class="space-y-4">
              <Card>
                <CardHeader><CardTitle class="flex items-center justify-between"><span class="flex items-center gap-2"><Settings class="w-5 h-5" />Secciones de Contenido</span><Button onClick={addSection} size="sm"><Plus class="w-4 h-4 mr-2" />Agregar Sección</Button></CardTitle></CardHeader>
                <CardContent class="space-y-4">
                  {formData.sections.map((section, index) => (
                    <Card key={section.id} class="border-2"><CardHeader class="pb-3"><div class="flex items-center justify-between"><div class="flex items-center gap-2"><Badge variant="outline">Sección {index + 1}</Badge><Select value={section.type} onValueChange={(value) => updateSection(index, 'type', value)}><SelectTrigger class="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hero">Hero</SelectItem><SelectItem value="features">Características</SelectItem><SelectItem value="testimonials">Testimonios</SelectItem><SelectItem value="contact">Contacto</SelectItem><SelectItem value="about">Acerca de</SelectItem><SelectItem value="services">Servicios</SelectItem></SelectContent></Select></div><div class="flex items-center gap-2"><Switch checked={section.isActive} onCheckedChange={(checked) => updateSection(index, 'isActive', checked)}/><Button variant="ghost" size="sm" onClick={() => moveSection(index, 'up')} disabled={index === 0}><MoveUp class="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => moveSection(index, 'down')} disabled={index === formData.sections.length - 1}><MoveDown class="w-4 h-4" /></Button><Button variant="ghost" size="sm" onClick={() => removeSection(index)}><Trash2 class="w-4 h-4" /></Button></div></div></CardHeader>
                      <CardContent class="space-y-4">
                        <div class="grid grid-cols-2 gap-4"><div><Label>Título</Label><Input value={section.title} onChange={(e) => updateSection(index, 'title', e.target.value)} placeholder="Título de la sección"/></div><div><Label>Subtítulo</Label><Input value={section.subtitle} onChange={(e) => updateSection(index, 'subtitle', e.target.value)} placeholder="Subtítulo opcional"/></div></div>
                        <div><Label>Contenido</Label><Textarea value={section.content} onChange={(e) => updateSection(index, 'content', e.target.value)} placeholder="Contenido de la sección" rows={3}/></div>
                        <div class="grid grid-cols-2 gap-4"><div><Label>Texto del Botón</Label><Input value={section.buttonText} onChange={(e) => updateSection(index, 'buttonText', e.target.value)} placeholder="Ver más"/></div><div><Label>URL del Botón</Label><Input value={section.buttonUrl} onChange={(e) => updateSection(index, 'buttonUrl', e.target.value)} placeholder="#section"/></div></div>
                        <div class="grid grid-cols-3 gap-4"><div><Label>Color de Fondo</Label><div class="flex gap-2"><Input type="color" value={section.backgroundColor} onChange={(e) => updateSection(index, 'backgroundColor', e.target.value)} class="w-12 h-8"/><Input value={section.backgroundColor} onChange={(e) => updateSection(index, 'backgroundColor', e.target.value)} class="flex-1"/></div></div><div><Label>Color de Texto</Label><div class="flex gap-2"><Input type="color" value={section.textColor} onChange={(e) => updateSection(index, 'textColor', e.target.value)} class="w-12 h-8"/><Input value={section.textColor} onChange={(e) => updateSection(index, 'textColor', e.target.value)} class="flex-1"/></div></div><div><Label>Color del Botón</Label><div class="flex gap-2"><Input type="color" value={section.buttonColor} onChange={(e) => updateSection(index, 'buttonColor', e.target.value)} class="w-12 h-8"/><Input value={section.buttonColor} onChange={(e) => updateSection(index, 'buttonColor', e.target.value)} class="flex-1"/></div></div></div>
                        <div><Label>Animación</Label><Select value={section.animation} onValueChange={(value) => updateSection(index, 'animation', value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fadeIn">Fade In</SelectItem><SelectItem value="slideUp">Slide Up</SelectItem><SelectItem value="slideLeft">Slide Left</SelectItem><SelectItem value="slideRight">Slide Right</SelectItem><SelectItem value="zoomIn">Zoom In</SelectItem><SelectItem value="none">Sin Animación</SelectItem></SelectContent></Select></div>
                        <div class="grid grid-cols-3 gap-4 items-end"><div><Label>Tipo de Media</Label><Select value={section.mediaType || 'none'} onValueChange={value => updateSection(index, 'mediaType', value === 'none' ? null : value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Ninguno</SelectItem><SelectItem value="image">Imagen</SelectItem><SelectItem value="video">Video</SelectItem></SelectContent></Select></div><div><Label>URL de Media</Label><Input value={section.mediaUrl || ''} onChange={e => updateSection(index, 'mediaUrl', e.target.value)} placeholder="https://..." disabled={!section.mediaType || section.mediaType === 'none'}/></div><div><Label>Posición de Media</Label><Select value={section.mediaPosition || 'left'} onValueChange={value => updateSection(index, 'mediaPosition', value)} disabled={!section.mediaType || section.mediaType === 'none'}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Izquierda</SelectItem><SelectItem value="right">Derecha</SelectItem><SelectItem value="top">Arriba</SelectItem></SelectContent></Select></div></div>
                        <div class="mt-6"><Label class="mb-2 block font-semibold">Subsecciones</Label><div class="space-y-4">
                            {(section.subsections || []).map((sub, subIdx) => (<Card key={sub.id} class="p-3 relative overflow-visible"><Button size="sm" variant="ghost" class="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => {const newSubs = section.subsections!.filter((_, i) => i !== subIdx); updateSection(index, 'subsections', newSubs);}}><Trash2 class="h-4 w-4 text-destructive" /></Button><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="space-y-2"><Input value={sub.title} onChange={e => updateSubsection(index, subIdx, 'title', e.target.value)} placeholder="Título de la subsección"/><Textarea value={sub.content} onChange={e => updateSubsection(index, subIdx, 'content', e.target.value)} placeholder="Contenido de la subsección" rows={3}/></div><div class="space-y-2"><Label>Imagen</Label><div class="flex items-center gap-2"><Image src={sub.imageUrl || "https://placehold.co/100x100.png?text=Sub"} alt="Vista previa de subsección" width={64} height={64} class="rounded-md border object-cover h-16 w-16" data-ai-hint="subsection image"/><label htmlFor={`sub-img-${sub.id}`} class="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"><UploadCloud class="mr-2 h-4 w-4"/>Seleccionar<input id={`sub-img-${sub.id}`} type="file" class="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={(e) => handleFileSelectionChange(sub.id, e.target.files ? e.target.files[0] : null)}/></label>{subsectionFiles[sub.id] && (<Button size="sm" onClick={() => handleSubsectionImageUpload(index, subIdx)} disabled={uploading[sub.id]}>{uploading[sub.id] ? <Loader2 class="mr-2 h-4 w-4 animate-spin"/> : null}Subir</Button>)}</div></div></div></Card>))}
                            <Button size="sm" variant="outline" onClick={() => {const newSub = { id: `sub-${Date.now()}`, title: '', content: '', imageUrl: '' }; updateSection(index, 'subsections', [...(section.subsections || []), newSub]);}}><Plus class="mr-2 h-4 w-4"/>Agregar subsección</Button></div></div>
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="seo" class="space-y-4">
              <Card><CardHeader><CardTitle class="flex items-center gap-2"><Globe class="w-5 h-5" />Configuración SEO</CardTitle></CardHeader>
                <CardContent class="space-y-4">
                  <div><Label htmlFor="seoTitle">Título SEO</Label><Input id="seoTitle" value={formData.seo.title} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, title: e.target.value } }) : null)} placeholder="Título para motores de búsqueda"/></div>
                  <div><Label htmlFor="seoDescription">Descripción SEO</Label><Textarea id="seoDescription" value={formData.seo.description} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, description: e.target.value } }) : null)} placeholder="Descripción para motores de búsqueda" rows={3}/></div>
                  <div><Label htmlFor="seoKeywords">Palabras Clave</Label><Input id="seoKeywords" value={formData.seo.keywords.join(', ')} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)} }) : null)} placeholder="palabra1, palabra2, palabra3"/></div>
                  <div><Label htmlFor="ogTitle">Título Open Graph</Label><Input id="ogTitle" value={formData.seo.ogTitle || ''} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, ogTitle: e.target.value } }) : null)} placeholder="Título para redes sociales"/></div>
                  <div><Label htmlFor="ogDescription">Descripción Open Graph</Label><Textarea id="ogDescription" value={formData.seo.ogDescription || ''} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, ogDescription: e.target.value } }) : null)} placeholder="Descripción para redes sociales" rows={3}/></div>
                  <div><Label htmlFor="ogImage">Imagen Open Graph</Label><Input id="ogImage" value={formData.seo.ogImage || ''} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, ogImage: e.target.value } }) : null)} placeholder="URL de la imagen para redes sociales"/></div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="preview" class="space-y-4">
              <Card><CardHeader><CardTitle>Vista Previa de la Landing</CardTitle></CardHeader>
                <CardContent><div class="border rounded-lg p-4 bg-gray-50"><div class="text-center py-12" style={{ backgroundColor: formData.heroBackgroundColor, color: formData.heroTextColor}}><h1 class="text-4xl font-bold mb-4">{formData.heroTitle}</h1><p class="text-xl mb-8">{formData.heroSubtitle}</p><button class="px-8 py-3 rounded-lg font-semibold" style={{ backgroundColor: formData.heroButtonColor, color: '#ffffff' }}>{formData.heroButtonText}</button></div>
                    {formData.sections.filter(s => s.isActive).map((section) => (<div key={section.id} class="py-12 px-4" style={{ backgroundColor: section.backgroundColor, color: section.textColor}}><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-4">{section.title}</h2>{section.subtitle && (<p class="text-xl mb-6">{section.subtitle}</p>)}<p class="mb-8">{section.content}</p><button class="px-6 py-2 rounded-lg font-semibold" style={{ backgroundColor: section.buttonColor, color: '#ffffff' }}>{section.buttonText}</button></div>
                        {section.mediaType && section.mediaType !== 'none' && section.mediaUrl && (<div class={`mb-6 w-full flex justify-center ${section.mediaPosition === 'top' ? 'order-first' : section.mediaPosition === 'left' ? 'md:flex-row flex-col' : 'md:flex-row-reverse flex-col'}`}> {section.mediaType === 'image' ? (<img src={section.mediaUrl} alt="media" class="rounded-lg max-w-xs w-full h-auto object-cover" />) : (<video src={section.mediaUrl} controls class="rounded-lg max-w-xs w-full h-auto object-cover" />)}</div>)}
                        {(section.subsections || []).length > 0 && (<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">{section.subsections.map(sub => (<div key={sub.id} class="bg-white rounded-lg shadow p-4 flex flex-col items-center">{sub.imageUrl && <img src={sub.imageUrl} alt="sub" class="mb-2 w-20 h-20 object-cover rounded-full" />}<h4 class="font-bold text-lg mb-1">{sub.title}</h4><p class="text-sm text-center">{sub.content}</p></div>))}</div>)}
                      </div>))}
                    <div class="py-12 px-4 bg-gray-100"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl font-bold mb-8">Planes de Suscripción</h2><p class="text-gray-600 mb-8">Esta sección es fija y no se puede editar</p><div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-xl font-bold mb-2">Plan Básico</h3><p class="text-gray-600 mb-4">$29/mes</p></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-xl font-bold mb-2">Plan Profesional</h3><p class="text-gray-600 mb-4">$59/mes</p></div><div class="bg-white p-6 rounded-lg shadow"><h3 class="text-xl font-bold mb-2">Plan Empresarial</h3><p class="text-gray-600 mb-4">$99/mes</p></div></div></div></div></div></CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        {previewMode && (
          <div class="sticky top-6">
            <Card><CardHeader><CardTitle>Vista Previa en Tiempo Real</CardTitle></CardHeader>
              <CardContent><div class="border rounded-lg overflow-hidden bg-white"><div class="text-center py-8 px-4" style={{ backgroundColor: formData.heroBackgroundColor, color: formData.heroTextColor}}><h1 class="text-2xl font-bold mb-2">{formData.heroTitle}</h1><p class="text-sm mb-4">{formData.heroSubtitle}</p><button class="px-4 py-2 rounded text-sm font-semibold" style={{ backgroundColor: formData.heroButtonColor, color: '#ffffff' }}>{formData.heroButtonText}</button></div>
                  {formData.sections.filter(s => s.isActive).slice(0, 2).map((section) => (<div key={section.id} class="py-6 px-4 border-t" style={{ backgroundColor: section.backgroundColor, color: section.textColor}}><h3 class="text-lg font-bold mb-2">{section.title}</h3>{section.subtitle && (<p class="text-sm mb-2">{section.subtitle}</p>)}<p class="text-xs mb-3">{section.content}</p><button class="px-3 py-1 rounded text-xs font-semibold" style={{ backgroundColor: section.buttonColor, color: '#ffffff' }}>{section.buttonText}</button></div>))}
                  <div class="py-6 px-4 border-t bg-gray-50"><h3 class="text-lg font-bold mb-4 text-center">Planes de Suscripción</h3><p class="text-xs text-gray-500 text-center mb-4">Sección fija (no editable)</p></div></div></CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
