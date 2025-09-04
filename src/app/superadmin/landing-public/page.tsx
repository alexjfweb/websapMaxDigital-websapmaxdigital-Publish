
"use client";

import React, { useState, useEffect, ChangeEvent, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from "@/hooks/use-toast";
import { useSession } from '@/contexts/session-context';
import { landingConfigService } from '@/services/landing-config-service';
import type { LandingSection, LandingConfig } from '@/services/landing-config-service';
import { 
  Save, 
  Eye, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Palette,
  Type,
  Settings,
  Globe,
  Loader2,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { ImageUploader } from '@/components/ui/image-uploader';

export default function LandingPublicPage() {
  const { currentUser } = useSession();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<LandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);

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
  
  const updateSubsection = (sectionIndex: number, subIndex: number, field: string, value: any) => {
    const newFormData = JSON.parse(JSON.stringify(formData));
    if (newFormData.sections?.[sectionIndex]?.subsections?.[subIndex]) {
      newFormData.sections[sectionIndex].subsections[subIndex][field] = value;
    }
    setFormData(newFormData);
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
  
  const addSubsection = (sectionIndex: number) => {
    const newSub = { id: `sub-${Date.now()}`, title: 'Nueva Subsección', content: 'Contenido...', imageUrl: '' };
    const newSections = JSON.parse(JSON.stringify(formData!.sections));
    if (!newSections[sectionIndex].subsections) {
      newSections[sectionIndex].subsections = [];
    }
    newSections[sectionIndex].subsections.push(newSub);
    setFormData(prev => prev ? { ...prev, sections: newSections } : null);
  };

  const removeSubsection = (sectionIndex: number, subIndex: number) => {
    const newSections = JSON.parse(JSON.stringify(formData!.sections));
    newSections[sectionIndex].subsections.splice(subIndex, 1);
    setFormData(prev => prev ? { ...prev, sections: newSections } : null);
  };


  if (isLoading || !formData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center"><Skeleton className="h-10 w-64"/><div className="flex gap-2"><Skeleton className="h-10 w-24"/><Skeleton className="h-10 w-32"/></div></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card><div className="sticky top-6"><Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card></div></div>
      </div>
    );
  }

  if (isError) {
      return (<div className="flex flex-col items-center justify-center h-64 text-destructive-foreground bg-destructive/80 rounded-lg p-8"><AlertCircle className="h-12 w-12 mb-4"/><h2 className="text-2xl font-bold">Error al Cargar la Configuración</h2><p>No se pudo obtener la configuración de la landing page. Por favor, recarga la página o contacta a soporte.</p></div>)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold">Editor Landing</h1><p className="text-muted-foreground">Edita el contenido de la página principal</p></div>
        <div className="flex gap-2"><Button onClick={handleSave} disabled={isSaving}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Save className="w-4 h-4 mr-2" />}{isSaving ? 'Guardando...' : 'Guardar Cambios'}</Button></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Columna de Edición */}
        <div className="space-y-6">
            {/* SEO and Hero Card */}
            <Card>
                <CardHeader><CardTitle>Configuración General y SEO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Type className="w-5 h-5" />Sección Hero</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="heroTitle">Título Principal</Label><Input id="heroTitle" value={formData.heroTitle} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroTitle: e.target.value }) : null)} placeholder="Título principal de la landing"/></div><div><Label htmlFor="heroSubtitle">Subtítulo</Label><Input id="heroSubtitle" value={formData.heroSubtitle} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroSubtitle: e.target.value }) : null)} placeholder="Subtítulo descriptivo"/></div></div>
                        <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="heroButtonText">Texto del Botón</Label><Input id="heroButtonText" value={formData.heroButtonText} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroButtonText: e.target.value }) : null)} placeholder="¡Comenzar ahora!"/></div><div><Label htmlFor="heroButtonUrl">URL del Botón</Label><Input id="heroButtonUrl" value={formData.heroButtonUrl} onChange={(e) => setFormData(prev => prev ? ({ ...prev, heroButtonUrl: e.target.value }) : null)} placeholder="#contact"/></div></div>
                    </CardContent></Card>

                     <Card><CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Globe className="w-5 h-5" />SEO</CardTitle></CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div><Label htmlFor="seoTitle">Título SEO</Label><Input id="seoTitle" value={formData.seo.title} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, title: e.target.value } }) : null)} placeholder="Título para motores de búsqueda"/></div>
                        <div><Label htmlFor="seoDescription">Descripción SEO</Label><Textarea id="seoDescription" value={formData.seo.description} onChange={(e) => setFormData(prev => prev ? ({ ...prev, seo: { ...prev.seo, description: e.target.value } }) : null)} placeholder="Descripción para motores de búsqueda" rows={3}/></div>
                    </CardContent></Card>
                </CardContent>
            </Card>

            {/* Sections Editor */}
            {formData.sections.map((section, index) => (
                <Card key={section.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Sección {index + 1}: {section.title}</CardTitle>
                         <div className="flex items-center gap-2">
                             <Switch checked={section.isActive} onCheckedChange={(checked) => updateSection(index, 'isActive', checked)} title="Activar/Desactivar Sección"/>
                            <Button variant="ghost" size="icon" onClick={() => moveSection(index, 'up')} disabled={index === 0}><MoveUp className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => moveSection(index, 'down')} disabled={index === formData.sections.length - 1}><MoveDown className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeSection(index)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Título</Label><Input value={section.title} onChange={(e) => updateSection(index, 'title', e.target.value)} placeholder="Título de la sección"/></div>
                            <div><Label>Subtítulo</Label><Input value={section.subtitle} onChange={(e) => updateSection(index, 'subtitle', e.target.value)} placeholder="Subtítulo opcional"/></div>
                        </div>
                        <div><Label>Contenido</Label><Textarea value={section.content} onChange={(e) => updateSection(index, 'content', e.target.value)} placeholder="Contenido de la sección" rows={3}/></div>
                        
                        <Label>Subsecciones</Label>
                        <div className="space-y-3">
                        {(section.subsections || []).map((sub, subIdx) => (
                            <Card key={sub.id} className="p-3 relative bg-muted/50">
                                <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => removeSubsection(index, subIdx)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Input value={sub.title} onChange={e => updateSubsection(index, subIdx, 'title', e.target.value)} placeholder="Título de la subsección"/>
                                        <Textarea value={sub.content} onChange={e => updateSubsection(index, subIdx, 'content', e.target.value)} placeholder="Contenido de la subsección" rows={3}/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Imagen</Label>
                                        <ImageUploader
                                            currentImageUrl={sub.imageUrl}
                                            onUploadSuccess={(url) => updateSubsection(index, subIdx, 'imageUrl', url)}
                                            onRemoveImage={() => updateSubsection(index, subIdx, 'imageUrl', '')}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                        <Button size="sm" variant="outline" onClick={() => addSubsection(index)}>
                            <Plus className="mr-2 h-4 w-4"/>Agregar subsección
                        </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
             <Button variant="outline" onClick={addSection}><Plus className="w-4 h-4 mr-2" />Agregar Nueva Sección</Button>
        </div>

        {/* Columna de Vista Previa */}
        <div className="sticky top-6">
            <Card>
                <CardHeader>
                    <CardTitle>Vista Previa en Tiempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-y-auto max-h-[80vh] bg-white">
                        <div className="text-center py-8 px-4" style={{ backgroundColor: formData.heroBackgroundColor, color: formData.heroTextColor}}>
                            <h1 className="text-2xl font-bold mb-2">{formData.heroTitle}</h1>
                            <p className="text-sm mb-4">{formData.heroSubtitle}</p>
                            <button className="px-4 py-2 rounded text-sm font-semibold" style={{ backgroundColor: formData.heroButtonColor, color: '#ffffff' }}>
                                {formData.heroButtonText}
                            </button>
                        </div>
                        {formData.sections.filter(s => s.isActive).map((section) => (
                            <div key={section.id} className="py-6 px-4 border-t" style={{ backgroundColor: section.backgroundColor, color: section.textColor}}>
                                <div className="max-w-4xl mx-auto text-center">
                                    <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                                    {section.subtitle && (<p className="text-base mb-4">{section.subtitle}</p>)}
                                    <p className="text-sm mb-6">{section.content}</p>
                                </div>
                                {(section.subsections || []).length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                                    {section.subsections.map(sub => (
                                    <div key={sub.id} className="bg-background/80 rounded-lg shadow p-3 text-center flex flex-col items-center">
                                        {sub.imageUrl && (
                                            <div className="relative w-full h-24 mb-2">
                                                <Image src={sub.imageUrl} alt={sub.title || 'Sub-section image'} fill style={{objectFit: 'cover'}} className="rounded-md"/>
                                            </div>
                                        )}
                                        <h4 className="font-bold text-base mb-1" style={{color: section.textColor === '#ffffff' ? '#1f2937' : section.textColor}}>{sub.title}</h4>
                                        <p className="text-xs" style={{color: section.textColor === '#ffffff' ? '#6b7280' : ''}}>{sub.content}</p>
                                    </div>
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

