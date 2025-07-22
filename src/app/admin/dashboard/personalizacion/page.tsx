"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const defaultStyles = {
  primary_color: '#FF6600',
  secondary_color: '#FFF6F0',
  text_color: '#222222',
  price_color: '#FF6600',
  font_family: 'sans-serif',
  font_size: 16,
  layout_style: 'list',
  show_images: true,
  show_ratings: true,
  show_whatsapp_button: true,
  spacing: 16,
};

const fontOptions = [
  { label: 'Sans Serif (Moderna)', value: 'sans-serif' },
  { label: 'Serif (Tradicional)', value: 'serif' },
  { label: 'Cursiva/Manuscrita', value: 'cursive' },
];

const layoutOptions = [
  { label: 'Lista vertical', value: 'list' },
  { label: 'Tarjetas tipo grid', value: 'grid' },
  { label: 'Galería visual', value: 'gallery' },
];

const RESTAURANT_ID = 'websapmax';

export default function PersonalizacionMenuPage() {
  const [styles, setStyles] = useState(defaultStyles);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Cargar configuración al montar
  useEffect(() => {
    const fetchStyles = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'menu_styles', RESTAURANT_ID);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setStyles({ ...defaultStyles, ...snap.data() });
        }
      } catch (e) {
        toast({ title: 'Error al cargar configuración', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    fetchStyles();
    // eslint-disable-next-line
  }, []);

  const handleChange = (key: string, value: any) => {
    setStyles(prev => ({ ...prev, [key]: value }));
  };

  const handleRestore = () => {
    setStyles(defaultStyles);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const ref = doc(db, 'menu_styles', RESTAURANT_ID);
      await setDoc(ref, { ...styles, restaurant_id: RESTAURANT_ID });
      toast({ title: '¡Personalización guardada!', description: 'Los cambios se aplicaron correctamente.' });
    } catch (e) {
      toast({ title: 'Error al guardar', description: 'Intenta de nuevo.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Vista previa simple (puedes mejorarla luego)
  const Preview = () => (
    <div
      className={`rounded-lg shadow-md p-4 ${previewMode === 'mobile' ? 'max-w-xs mx-auto' : 'w-full'}`}
      style={{
        background: styles.secondary_color,
        color: styles.text_color,
        fontFamily: styles.font_family,
        fontSize: styles.font_size,
        gap: styles.spacing,
      }}
    >
      <h2 style={{ color: styles.primary_color, fontWeight: 700, fontSize: styles.font_size + 4 }}>Nuestro Menú</h2>
      <div className={styles.layout_style === 'grid' ? 'grid grid-cols-2 gap-4' : styles.layout_style === 'gallery' ? 'flex gap-4 overflow-x-auto' : 'flex flex-col gap-4'}>
        {[1,2,3].map(i => (
          <div key={i} className="rounded-lg p-3 shadow-sm bg-white flex flex-wrap items-center gap-4" style={{ background: styles.secondary_color }}>
            {styles.show_images && <div className="w-16 h-16 bg-gray-200 rounded-md" />}
            <div className="flex-1 min-w-0">
              <div className="font-bold" style={{ color: styles.text_color }}>Plato de ejemplo {i}</div>
              <div className="text-sm opacity-70">Descripción breve del plato.</div>
              <div className="mt-1 font-semibold" style={{ color: styles.price_color }}>$25.000</div>
              {styles.show_ratings && <div className="text-yellow-500 text-xs">★★★★★</div>}
            </div>
            {styles.show_whatsapp_button && (
              <div className="w-full flex md:justify-end mt-2">
                <Button size="sm" style={{ background: styles.primary_color, color: '#fff' }} className="w-full md:w-auto">WhatsApp</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-3xl font-bold mb-2 text-primary">Personalización del Menú</h1>
      <p className="mb-6 text-muted-foreground">Ajusta los colores, tipografía y estilo visual de tu menú digital según la identidad de tu restaurante. Visualiza los cambios en tiempo real antes de guardar.</p>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Controles */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Opciones de diseño</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="font-semibold">Colores personalizados</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="text-xs">Color principal</span>
                  <Input type="color" value={styles.primary_color} onChange={e => handleChange('primary_color', e.target.value)} />
                </div>
                <div>
                  <span className="text-xs">Color secundario</span>
                  <Input type="color" value={styles.secondary_color} onChange={e => handleChange('secondary_color', e.target.value)} />
                </div>
                <div>
                  <span className="text-xs">Color de texto</span>
                  <Input type="color" value={styles.text_color} onChange={e => handleChange('text_color', e.target.value)} />
                </div>
                <div>
                  <span className="text-xs">Color de precios</span>
                  <Input type="color" value={styles.price_color} onChange={e => handleChange('price_color', e.target.value)} />
                </div>
              </div>
            </div>
            <div>
              <label className="font-semibold">Tipografía</label>
              <div className="flex flex-wrap gap-2 mt-2 min-w-0">
                {fontOptions.map(opt => (
                  <Button key={opt.value} variant={styles.font_family === opt.value ? 'default' : 'outline'} onClick={() => handleChange('font_family', opt.value)} className="whitespace-nowrap truncate max-w-[140px]">{opt.label}</Button>
                ))}
              </div>
              <div className="flex gap-4 mt-4 items-center">
                <span className="text-xs">Tamaño</span>
                <Slider min={12} max={24} step={1} value={[styles.font_size]} onValueChange={v => handleChange('font_size', v[0])} className="w-32" />
                <span className="text-xs">{styles.font_size}px</span>
              </div>
              <div className="flex gap-4 mt-4 items-center">
                <span className="text-xs">Espaciado</span>
                <Slider min={8} max={32} step={1} value={[styles.spacing]} onValueChange={v => handleChange('spacing', v[0])} className="w-32" />
                <span className="text-xs">{styles.spacing}px</span>
              </div>
            </div>
            <div>
              <label className="font-semibold">Estilo del menú</label>
              <div className="flex gap-2 mt-2">
                {layoutOptions.map(opt => (
                  <Button key={opt.value} variant={styles.layout_style === opt.value ? 'default' : 'outline'} onClick={() => handleChange('layout_style', opt.value)}>{opt.label}</Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Switch checked={styles.show_images} onCheckedChange={v => handleChange('show_images', v)} />
                  <span className="text-xs">Mostrar imágenes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={styles.show_ratings} onCheckedChange={v => handleChange('show_ratings', v)} />
                  <span className="text-xs">Mostrar valoraciones</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={styles.show_whatsapp_button} onCheckedChange={v => handleChange('show_whatsapp_button', v)} />
                  <span className="text-xs">Botón WhatsApp</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button type="button" onClick={handleSave} disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Button>
              <Button type="button" variant="outline" onClick={handleRestore} disabled={loading}>Restaurar diseño por defecto</Button>
            </div>
          </CardContent>
        </Card>
        {/* Vista previa */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Vista previa dinámica</CardTitle>
            <Tabs value={previewMode} onValueChange={v => setPreviewMode(v as 'desktop' | 'mobile')}>
              <TabsList>
                <TabsTrigger value="desktop">Escritorio</TabsTrigger>
                <TabsTrigger value="mobile">Móvil</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Preview />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 