
"use client";

import React, { useState, useEffect, ChangeEvent } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useLandingConfig, useDefaultConfig } from '@/hooks/use-landing-config';
import { LandingSection, LandingConfig } from '@/services/landing-config-service';
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

export default function LandingPublicPage() {
  const { config, isLoading, updateConfig } = useLandingConfig();
  const defaultConfig = useDefaultConfig();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<LandingConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState('hero');
  const [previewMode, setPreviewMode] = useState(false);

  // Sincronizar con la configuración de Firebase
  useEffect(() => {
    if (config) {
      setFormData({
        ...defaultConfig, // Asegura que todos los campos por defecto estén presentes
        ...config,
        sections: config.sections.map(s => ({
          ...s,
          subsections: s.subsections || []
        })),
        seo: { ...defaultConfig.seo, ...config.seo }
      });
    }
  }, [config, defaultConfig]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Directamente usamos la función de SWR que ya maneja la lógica de actualización
      await updateConfig({
        ...formData
      });
      
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

    // --- Validación del archivo ---
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
    // --- Fin de la validación ---

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
    const newSection: Omit<LandingSection, 'id'> = {
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
      sections: [...prev.sections, { ...newSection, id: `section-${Date.now()}` }]
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
      newSections[index].order = index;
      newSections[newIndex].order = newIndex;
      
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
              const defaultConfig = useDefaultConfig();
              setFormData(prev => ({
                ...prev,
                sections: defaultConfig.sections
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
            <Save className="w-4 h-4 mr-2" />
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
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="preview">Vista Previa</TabsTrigger>
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
                          className="w-16 h-10"
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
                          className="w-16 h-10"
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
                          className="w-16 h-10"
                        />
                        <Input
                          value={formData.heroButtonColor}
                          onChange={(e) => setFormData(prev => ({ ...prev, heroButtonColor: e.target.value }))}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="heroAnimation">Animación</Label>
                    <Select
                      value={formData.heroAnimation}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, heroAnimation: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fadeIn">Fade In</SelectItem>
                        <SelectItem value="slideUp">Slide Up</SelectItem>
                        <SelectItem value="slideLeft">Slide Left</SelectItem>
                        <SelectItem value="slideRight">Slide Right</SelectItem>
                        <SelectItem value="zoomIn">Zoom In</SelectItem>
                        <SelectItem value="none">Sin Animación</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Button onClick={addSection} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Sección
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.sections.map((section, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Sección {index + 1}</Badge>
                            <Select
                              value={section.type}
                              onValueChange={(value) => updateSection(index, 'type', value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hero">Hero</SelectItem>
                                <SelectItem value="features">Características</SelectItem>
                                <SelectItem value="testimonials">Testimonios</SelectItem>
                                <SelectItem value="contact">Contacto</SelectItem>
                                <SelectItem value="about">Acerca de</SelectItem>
                                <SelectItem value="services">Servicios</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={section.isActive}
                              onCheckedChange={(checked) => updateSection(index, 'isActive', checked)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === formData.sections.length - 1}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSection(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
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
                          <Label>Contenido</Label>
                          <Textarea
                            value={section.content}
                            onChange={(e) => updateSection(index, 'content', e.target.value)}
                            placeholder="Contenido de la sección"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Texto del Botón</Label>
                            <Input
                              value={section.buttonText}
                              onChange={(e) => updateSection(index, 'buttonText', e.target.value)}
                              placeholder="Ver más"
                            />
                          </div>
                          <div>
                            <Label>URL del Botón</Label>
                            <Input
                              value={section.buttonUrl}
                              onChange={(e) => updateSection(index, 'buttonUrl', e.target.value)}
                              placeholder="#section"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Color de Fondo</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={section.backgroundColor}
                                onChange={(e) => updateSection(index, 'backgroundColor', e.target.value)}
                                className="w-12 h-8"
                              />
                              <Input
                                value={section.backgroundColor}
                                onChange={(e) => updateSection(index, 'backgroundColor', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Color de Texto</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={section.textColor}
                                onChange={(e) => updateSection(index, 'textColor', e.target.value)}
                                className="w-12 h-8"
                              />
                              <Input
                                value={section.textColor}
                                onChange={(e) => updateSection(index, 'textColor', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Color del Botón</Label>
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={section.buttonColor}
                                onChange={(e) => updateSection(index, 'buttonColor', e.target.value)}
                                className="w-12 h-8"
                              />
                              <Input
                                value={section.buttonColor}
                                onChange={(e) => updateSection(index, 'buttonColor', e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Animación</Label>
                          <Select
                            value={section.animation}
                            onValueChange={(value) => updateSection(index, 'animation', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fadeIn">Fade In</SelectItem>
                              <SelectItem value="slideUp">Slide Up</SelectItem>
                              <SelectItem value="slideLeft">Slide Left</SelectItem>
                              <SelectItem value="slideRight">Slide Right</SelectItem>
                              <SelectItem value="zoomIn">Zoom In</SelectItem>
                              <SelectItem value="none">Sin Animación</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Media (Imagen/Video) */}
                        <div className="grid grid-cols-3 gap-4 items-end">
                          <div>
                            <Label>Tipo de Media</Label>
                            <Select
                              value={section.mediaType || 'none'}
                              onValueChange={value => updateSection(index, 'mediaType', value === 'none' ? null : value)}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Ninguno</SelectItem>
                                <SelectItem value="image">Imagen</SelectItem>
                                <SelectItem value="video">Video</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>URL de Media</Label>
                            <Input
                              value={section.mediaUrl || ''}
                              onChange={e => updateSection(index, 'mediaUrl', e.target.value)}
                              placeholder="https://..."
                              disabled={!section.mediaType || section.mediaType === 'none'}
                            />
                          </div>
                          <div>
                            <Label>Posición de Media</Label>
                            <Select
                              value={section.mediaPosition || 'left'}
                              onValueChange={value => updateSection(index, 'mediaPosition', value)}
                              disabled={!section.mediaType || section.mediaType === 'none'}
                            >
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="left">Izquierda</SelectItem>
                                <SelectItem value="right">Derecha</SelectItem>
                                <SelectItem value="top">Arriba</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* SubSecciones (Cards/Columnas) */}
                        <div className="mt-6">
                          <Label className="mb-2 block font-semibold">Subsecciones</Label>
                          <div className="space-y-4">
                            {section.subsections && section.subsections.length > 0 && section.subsections.map((sub, subIdx) => (
                              <Card key={sub.id} className="p-3 relative overflow-visible">
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
                                    <Textarea
                                      value={sub.content}
                                      onChange={e => updateSubsection(index, subIdx, 'content', e.target.value)}
                                      placeholder="Contenido de la subsección"
                                      rows={3}
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
                            <Button size="sm" variant="outline" onClick={() => {
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
                    <Textarea
                      id="seoDescription"
                      value={formData.seo.description}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { ...prev.seo, description: e.target.value }
                      }))}
                      placeholder="Descripción para motores de búsqueda"
                      rows={3}
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

                  <div>
                    <Label htmlFor="ogTitle">Título Open Graph</Label>
                    <Input
                      id="ogTitle"
                      value={formData.seo.ogTitle || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { ...prev.seo, ogTitle: e.target.value }
                      }))}
                      placeholder="Título para redes sociales"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ogDescription">Descripción Open Graph</Label>
                    <Textarea
                      id="ogDescription"
                      value={formData.seo.ogDescription || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { ...prev.seo, ogDescription: e.target.value }
                      }))}
                      placeholder="Descripción para redes sociales"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ogImage">Imagen Open Graph</Label>
                    <Input
                      id="ogImage"
                      value={formData.seo.ogImage || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        seo: { ...prev.seo, ogImage: e.target.value }
                      }))}
                      placeholder="URL de la imagen para redes sociales"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vista Previa de la Landing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div 
                      className="text-center py-12"
                      style={{ 
                        backgroundColor: formData.heroBackgroundColor,
                        color: formData.heroTextColor
                      }}
                    >
                      <h1 className="text-4xl font-bold mb-4">{formData.heroTitle}</h1>
                      <p className="text-xl mb-8">{formData.heroSubtitle}</p>
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
                          <p className="mb-8">{section.content}</p>
                          <button
                            className="px-6 py-2 rounded-lg font-semibold"
                            style={{ backgroundColor: section.buttonColor, color: '#ffffff' }}
                          >
                            {section.buttonText}
                          </button>
                        </div>

                        {/* Media Preview */}
                        {section.mediaType && section.mediaType !== 'none' && section.mediaUrl && (
                          <div className={`mb-6 w-full flex justify-center ${section.mediaPosition === 'top' ? 'order-first' : section.mediaPosition === 'left' ? 'md:flex-row flex-col' : 'md:flex-row-reverse flex-col'}`}> 
                            {section.mediaType === 'image' ? (
                              <img src={section.mediaUrl} alt="media" className="rounded-lg max-w-xs w-full h-auto object-cover" />
                            ) : (
                              <video src={section.mediaUrl} controls className="rounded-lg max-w-xs w-full h-auto object-cover" />
                            )}
                          </div>
                        )}

                        {/* Subsecciones Preview */}
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            {section.subsections.map(sub => (
                              <div key={sub.id} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                                {sub.imageUrl && <img src={sub.imageUrl} alt="sub" className="mb-2 w-20 h-20 object-cover rounded-full" />}
                                <h4 className="font-bold text-lg mb-1">{sub.title}</h4>
                                <p className="text-sm text-center">{sub.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="py-12 px-4 bg-gray-100">
                      <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-8">Planes de Suscripción</h2>
                        <p className="text-gray-600 mb-8">Esta sección es fija y no se puede editar</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">Plan Básico</h3>
                            <p className="text-gray-600 mb-4">$29/mes</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">Plan Profesional</h3>
                            <p className="text-gray-600 mb-4">$59/mes</p>
                          </div>
                          <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-xl font-bold mb-2">Plan Empresarial</h3>
                            <p className="text-gray-600 mb-4">$99/mes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Vista previa en tiempo real */}
        {previewMode && (
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa en Tiempo Real</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div 
                    className="text-center py-8 px-4"
                    style={{ 
                      backgroundColor: formData.heroBackgroundColor,
                      color: formData.heroTextColor
                    }}
                  >
                    <h1 className="text-2xl font-bold mb-2">{formData.heroTitle}</h1>
                    <p className="text-sm mb-4">{formData.heroSubtitle}</p>
                    <button
                      className="px-4 py-2 rounded text-sm font-semibold"
                      style={{ backgroundColor: formData.heroButtonColor, color: '#ffffff' }}
                    >
                      {formData.heroButtonText}
                    </button>
                  </div>

                  {formData.sections.filter(s => s.isActive).slice(0, 2).map((section, index) => (
                    <div
                      key={index}
                      className="py-6 px-4 border-t"
                      style={{ 
                        backgroundColor: section.backgroundColor,
                        color: section.textColor
                      }}
                    >
                      <h3 className="text-lg font-bold mb-2">{section.title}</h3>
                      {section.subtitle && (
                        <p className="text-sm mb-2">{section.subtitle}</p>
                      )}
                      <p className="text-xs mb-3">{section.content}</p>
                      <button
                        className="px-3 py-1 rounded text-xs font-semibold"
                        style={{ backgroundColor: section.buttonColor, color: '#ffffff' }}
                      >
                        {section.buttonText}
                      </button>
                    </div>
                  ))}

                  <div className="py-6 px-4 border-t bg-gray-50">
                    <h3 className="text-lg font-bold mb-4 text-center">Planes de Suscripción</h3>
                    <p className="text-xs text-gray-500 text-center mb-4">Sección fija (no editable)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
