
"use client";

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Upload, Plus } from 'lucide-react'
import { ImageUploader } from '@/components/ui/image-uploader';


interface Subsection {
  id: string
  title: string
  content: string
  image: string | null
}

interface LandingData {
  title: string
  subtitle: string
  description: string
  mainImage: string | null
  subsections: Subsection[]
}

export default function LandingPublicPage() {
  const [landingData, setLandingData] = useState<LandingData>({
    title: '',
    subtitle: '',
    description: '',
    mainImage: null,
    subsections: []
  })

  const handleInputChange = (field: keyof LandingData, value: string) => {
    setLandingData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateSubsection = (id: string, field: keyof Omit<Subsection, 'id'>, value: any) => {
    setLandingData(prev => {
      const newSections = prev.subsections.map(sub => {
        if (sub.id === id) {
          return { ...sub, [field]: value };
        }
        return sub;
      });
      return { ...prev, subsections: newSections };
    });
  };

  const addSubsection = () => {
    const newSubsection: Subsection = {
      id: Date.now().toString(),
      title: '',
      content: '',
      image: null
    }
    setLandingData(prev => ({
      ...prev,
      subsections: [...prev.subsections, newSubsection]
    }))
  }

  const removeSubsection = (id: string) => {
    setLandingData(prev => ({
      ...prev,
      subsections: prev.subsections.filter(sub => sub.id !== id)
    }))
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Editor Landing Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Panel de Edición */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contenido Principal</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título Principal</label>
                    <Input
                      value={landingData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ingresa el título principal"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subtítulo</label>
                    <Input
                      value={landingData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="Ingresa el subtítulo"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Descripción</label>
                    <Textarea
                      value={landingData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Describe tu negocio o servicio"
                      rows={3}
                    />
                  </div>
                  
                   <div>
                      <label className="block text-sm font-medium mb-2">Imagen Principal</label>
                       <ImageUploader 
                          currentImageUrl={landingData.mainImage || undefined}
                          onUploadSuccess={(url) => handleInputChange('mainImage', url)}
                          onRemoveImage={() => handleInputChange('mainImage', '')}
                       />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subsecciones */}
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Subsecciones</h2>
                  <Button onClick={addSubsection} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar subsección
                  </Button>
                </div>
                
                {landingData.subsections.map((subsection) => (
                  <Card key={subsection.id} className="mb-4 border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-medium text-gray-700">Subsección</h3>
                        <Button
                          onClick={() => removeSubsection(subsection.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <Input
                          value={subsection.title}
                          onChange={(e) => updateSubsection(subsection.id, 'title', e.target.value)}
                          placeholder="Título de la subsección"
                        />
                        
                        <Textarea
                          value={subsection.content}
                          onChange={(e) => updateSubsection(subsection.id, 'content', e.target.value)}
                          placeholder="Contenido de la subsección"
                          rows={2}
                        />
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Imagen</label>
                           <ImageUploader 
                              currentImageUrl={subsection.image || undefined}
                              onUploadSuccess={(url) => updateSubsection(subsection.id, 'image', url)}
                              onRemoveImage={() => updateSubsection(subsection.id, 'image', '')}
                           />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Vista Previa */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-center">Vista Previa</h2>
                
                <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
                  {/* Contenido Principal */}
                  <div className="text-center space-y-4">
                    {landingData.mainImage && (
                      <div className="mb-6">
                        <div className="relative w-full h-48 lg:h-64">
                          <img
                            src={landingData.mainImage}
                            alt="Imagen principal"
                            className="absolute inset-0 w-full h-full object-cover rounded-lg shadow-md"
                            style={{ display: 'block' }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {landingData.title && (
                      <h1 className="text-3xl font-bold text-gray-900">
                        {landingData.title}
                      </h1>
                    )}
                    
                    {landingData.subtitle && (
                      <h2 className="text-xl text-gray-600">
                        {landingData.subtitle}
                      </h2>
                    )}
                    
                    {landingData.description && (
                      <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        {landingData.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Subsecciones */}
                  {landingData.subsections.length > 0 && (
                    <div className="space-y-8 pt-8 border-t">
                      {landingData.subsections.map((subsection, index) => (
                        <div
                          key={subsection.id}
                          className={`flex flex-col ${
                            index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                          } gap-6 items-center`}
                        >
                          {subsection.image && (
                            <div className="w-full lg:w-1/2 flex-shrink-0">
                                <img
                                  src={subsection.image}
                                  alt={subsection.title || 'Imagen de subsección'}
                                  className="w-full h-40 object-cover rounded-lg shadow-md"
                                  style={{ display: 'block' }}
                                />
                            </div>
                          )}
                          
                          <div className={`w-full ${subsection.image ? 'lg:w-1/2' : 'lg:w-full'}`}>
                            {subsection.title && (
                              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                {subsection.title}
                              </h3>
                            )}
                            
                            {subsection.content && (
                              <p className="text-gray-700 leading-relaxed">
                                {subsection.content}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Estado vacío */}
                  {!landingData.title && !landingData.subtitle && !landingData.description && landingData.subsections.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <p>Comienza agregando contenido para ver la vista previa</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Button size="lg" className="px-8">
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  )
}
