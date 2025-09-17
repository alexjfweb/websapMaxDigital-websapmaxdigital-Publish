
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
import { useToast } from '@/hooks/use-toast';
import { useLandingConfig } from '@/hooks/use-landing-config';
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
  Loader2
} from 'lucide-react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/ui/rich-text-editor'), { ssr: false });


// Función para obtener la configuración por defecto
const getDefaultConfig = (): LandingConfig => ({
  id: 'main',
  heroTitle: 'Título Hero por Defecto',
  heroSubtitle: 'Subtítulo por defecto.',
  heroContent: '',
  heroButtonText: 'Comenzar',
  heroButtonUrl: '#',
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
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<LandingConfig>(getDefaultConfig());
  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState(false);

  // Sincronizar con la configuración de Firebase
  useEffect(() => {
    if (landingConfig) {
      setFormData({
        ...getDefaultConfig(), // Asegura que todos los campos por defecto estén presentes
        ...landingConfig,
        sections: (landingConfig.sections || []).map(s => ({
          ...s,
          subsections: s.subsections || []
        })),
        seo: { ...getDefaultConfig().seo, ...(landingConfig.seo || {}) }
      });
    }
  }, [landingConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig(formData);
      
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
      setSaving(false);
    }
  };

  const handleSubsectionImageUpload = async (e: ChangeEvent<HTMLInputElement>, sectionIndex: number, subIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        description: "La imagen no puede pesar más de 5MB antes de la compresión.",
        variant: "destructive",
      });
      return;
    }

    const subsectionId = formData.sections[sectionIndex].subsections![subIndex].id;
    setUploading(prev => ({ ...prev, [subsectionId]: true }));

    try {
      toast({ title: "Comprimiendo imagen...", description: "Este proceso puede tardar unos segundos." });
      const imageUrl = await storageService.compressAndUploadFile(file, `subsections/`);
      
      updateSubsection(sectionIndex, subIndex, 'imageUrl', imageUrl);

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido y comprimido correctamente.",
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Cargando configuración...</div>
      </div>
    );
  }

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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="sections">Secciones</TabsTrigger>
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
                        onChange={(value) => setFormData(prev => ({ ...prev, heroContent: value }))}
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
                    <Button onClick={addSection} size="sm" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Sección
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.sections.map((section, index) => (
                    <Card key={section.id} className="border-2">
                      <CardHeader className="pb-3 bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Sección {index + 1}</Badge>
                            <Select
                              value={section.type}
                              onValueChange={(value) => updateSection(index, 'type', value)}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="features">Características</SelectItem>
                                <SelectItem value="services">Servicios</SelectItem>
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
                                onChange={(value) => updateSection(index, 'content', value)}
                               />
                            </Suspense>
                        </div>
                        
                        <div className="mt-6">
                          <Label className="mb-2 block font-semibold">Subsecciones (Columnas/Tarjetas)</Label>
                          <div className="space-y-4">
                            {(section.subsections || []).map((sub, subIdx) => (
                              <Card key={sub.id} className="p-3 relative overflow-visible bg-background">
                                <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => {
                                  const newSubs = section.subsections!.filter((_, i) => i !== subIdx);
                                  updateSection(index, 'subsections', newSubs);
                                }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Input
                                      value={sub.title}
                                      onChange={e => updateSubsection(index, subIdx, 'title', e.target.value)}
                                      placeholder="Título de la subsección"
                                    />
                                     <RichTextEditor
                                      value={sub.content}
                                      onChange={value => updateSubsection(index, subIdx, 'content', value)}
                                      placeholder="Contenido de la subsección"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Imagen</Label>
                                    <div className="flex items-center gap-2">
                                      <Image 
                                        src={sub.imageUrl || "https://placehold.co/100x100.png?text=Sub"}
                                        alt="Vista previa de subsección"
                                        width={64}
                                        height={64}
                                        className="rounded-md border object-cover h-16 w-16"
                                      />
                                      <Button variant="outline" asChild size="sm">
                                        <label htmlFor={`sub-img-${sub.id}`} className="cursor-pointer">
                                          {uploading[sub.id] ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <UploadCloud className="mr-2 h-4 w-4"/>}
                                          {uploading[sub.id] ? "Subiendo..." : "Subir"}
                                          <input 
                                            id={`sub-img-${sub.id}`}
                                            type="file"
                                            className="hidden"
                                            accept="image/png, image/jpeg, image/jpg, image/webp"
                                            onChange={(e) => handleSubsectionImageUpload(e, index, subIdx)}
                                            disabled={uploading[sub.id]}
                                          />
                                        </label>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                            <Button size="sm" variant="outline" className="mt-2" onClick={() => {
                              const newSub = { id: `sub-${Date.now()}`, title: '', content: '', imageUrl: '' };
                              updateSection(index, 'subsections', [...(section.subsections || []), newSub]);
                            }}><Plus className="mr-2 h-4 w-4"/>Agregar subsección</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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

                        {section.subsections && section.subsections.length > 0 && (
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

    
