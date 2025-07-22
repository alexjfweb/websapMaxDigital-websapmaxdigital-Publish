"use client";
import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BancolombiaIcon from "@/components/icons/bancolombia-icon";
import NequiIcon from "@/components/icons/nequi-icon";
import DaviplataIcon from "@/components/icons/daviplata-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, CreditCard, XCircle } from "lucide-react";

const initialMethods = {
  daviplata: true,
  cash: true,
  bancolombia: false,
  nequi: false,
  mercadopago: false,
  stripe: false,
};

export default function PaymentsPage() {
  const { toast } = useToast();
  const [methods, setMethods] = useState({
    daviplata: true,
    cash: true,
    bancolombia: false,
    nequi: false,
    mercadopago: false,
    stripe: false,
  });
  const [form, setForm] = useState({
    daviplataNumber: "",
    daviplataQR: null as File | null,
    bancolombiaQR: null as File | null,
    nequiNumber: "",
    nequiQR: null as File | null,
    mercadopagoEmail: "",
    stripePublic: "",
    stripeSecret: "",
  });
  const bancolombiaQRRef = useRef<HTMLInputElement>(null);
  const nequiQRRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState({
    daviplataNumber: "",
    daviplataQR: "",
    nequiNumber: "",
    nequiQR: "",
    bancolombiaQR: "",
  });
  const [openErrorModal, setOpenErrorModal] = useState<string | null>(null);
  const [openConfigModal, setOpenConfigModal] = useState<"mercadopago" | "stripe" | null>(null);
  const [modalErrors, setModalErrors] = useState({
    mercadopagoEmail: "",
    stripePublic: "",
    stripeSecret: "",
  });

  const handleToggle = (key: keyof typeof methods) => {
    setMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (files) {
      setForm((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = { daviplataNumber: "", daviplataQR: "", nequiNumber: "", nequiQR: "", bancolombiaQR: "" };
    let firstErrorKey = null;
    // Daviplata
    if (methods.daviplata) {
      if (!form.daviplataNumber.match(/^3\d{9}$/)) {
        newErrors.daviplataNumber = 'Número de teléfono inválido';
        if (!firstErrorKey) firstErrorKey = 'daviplataNumber';
      }
      if (!form.daviplataQR) {
        newErrors.daviplataQR = 'QR inválido';
        if (!firstErrorKey) firstErrorKey = 'daviplataQR';
      }
    }
    // Nequi
    if (methods.nequi) {
      if (!form.nequiNumber.match(/^3\d{9}$/)) {
        newErrors.nequiNumber = 'Número de teléfono inválido';
        if (!firstErrorKey) firstErrorKey = 'nequiNumber';
      }
      if (!form.nequiQR) {
        newErrors.nequiQR = 'QR inválido';
        if (!firstErrorKey) firstErrorKey = 'nequiQR';
      }
    }
    // Bancolombia
    if (methods.bancolombia && !form.bancolombiaQR) {
      newErrors.bancolombiaQR = 'QR inválido';
      if (!firstErrorKey) firstErrorKey = 'bancolombiaQR';
    }
    setErrors(newErrors);
    if (firstErrorKey) setOpenErrorModal(firstErrorKey);
    return Object.values(newErrors).every((e) => !e);
  };

  const handleSave = () => {
    if (!validate()) return;
    toast({
      title: 'Métodos de pago guardados',
      description: 'Los métodos de pago se han guardado correctamente',
      variant: "success",
    });
  };

  const validateMercadoPago = () => {
    let error = "";
    if (!form.mercadopagoEmail.match(/^\S+@\S+\.\S+$/)) {
      error = 'Correo electrónico inválido';
    }
    setModalErrors((prev) => ({ ...prev, mercadopagoEmail: error }));
    return !error;
  };

  const validateStripe = () => {
    let pubError = "";
    let secError = "";
    if (!form.stripePublic) pubError = 'Clave pública Stripe inválida';
    if (!form.stripeSecret) secError = 'Clave secreta Stripe inválida';
    setModalErrors((prev) => ({ ...prev, stripePublic: pubError, stripeSecret: secError }));
    return !pubError && !secError;
  };

  return (
    <>
      <Dialog open={!!openErrorModal} onOpenChange={() => setOpenErrorModal(null)}>
        <DialogContent className="animate-fade-in bg-red-50 border-red-200">
          <div className="flex flex-col items-center justify-center gap-2">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-2 animate-bounce" />
            <DialogHeader className="w-full text-center">
              <DialogTitle className="text-red-700">{'Error'}</DialogTitle>
              <DialogDescription className="text-red-600 font-medium">
                {openErrorModal && errors[openErrorModal]}
              </DialogDescription>
            </DialogHeader>
            <button
              onClick={() => setOpenErrorModal(null)}
              className="mt-4 px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
              autoFocus
            >
              {'Cerrar'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">{'Métodos de pago'}</h1>
        <p className="text-lg text-muted-foreground mb-6">{'Descripción de la sección'}</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Daviplata */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <DaviplataIcon className="h-6 w-6" />
                <CardTitle className="text-base font-medium">{'Daviplata'}</CardTitle>
              </div>
              <Switch checked={methods.daviplata} onCheckedChange={() => handleToggle('daviplata')} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{'Descripción de la opción'}</p>
              {methods.daviplata && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" htmlFor="daviplataNumber">{'Número de teléfono'}</label>
                  <Input
                    id="daviplataNumber"
                    name="daviplataNumber"
                    type="text"
                    placeholder={'(310) 123-4567'}
                    value={form.daviplataNumber}
                    onChange={handleInputChange}
                    maxLength={15}
                  />
                  {errors.daviplataNumber && <p className="text-xs text-red-500 mt-1">{errors.daviplataNumber}</p>}
                  <label className="text-xs font-medium" htmlFor="daviplataQR">{'QR'}</label>
                  <Input
                    id="daviplataQR"
                    name="daviplataQR"
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  {errors.daviplataQR && <p className="text-xs text-red-500 mt-1">{errors.daviplataQR}</p>}
                  {form.daviplataQR && (
                    <img
                      src={URL.createObjectURL(form.daviplataQR)}
                      alt="QR Daviplata"
                      className="h-16 mt-2 rounded border"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Contra entrega */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">{'Contra entrega'}</CardTitle>
              <Switch checked={methods.cash} onCheckedChange={() => handleToggle('cash')} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">{'Descripción de la opción'}</p>
            </CardContent>
          </Card>
          {/* QR Bancolombia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <BancolombiaIcon className="h-6 w-6" />
                <CardTitle className="text-base font-medium">{'Bancolombia'}</CardTitle>
              </div>
              <Switch checked={methods.bancolombia} onCheckedChange={() => handleToggle('bancolombia')} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{'Descripción de la opción'}</p>
              {methods.bancolombia && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" htmlFor="bancolombiaQR">{'QR'}</label>
                  <Input
                    id="bancolombiaQR"
                    name="bancolombiaQR"
                    type="file"
                    accept="image/*"
                    ref={bancolombiaQRRef}
                    onChange={handleInputChange}
                  />
                  {errors.bancolombiaQR && <p className="text-xs text-red-500 mt-1">{errors.bancolombiaQR}</p>}
                  {form.bancolombiaQR && (
                    <img
                      src={URL.createObjectURL(form.bancolombiaQR)}
                      alt="QR Bancolombia"
                      className="h-16 mt-2 rounded border"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Nequi (QR y número) */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <NequiIcon className="h-6 w-6" />
                <CardTitle className="text-base font-medium">{'Nequi'}</CardTitle>
              </div>
              <Switch checked={methods.nequi} onCheckedChange={() => handleToggle('nequi')} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{'Descripción de la opción'}</p>
              {methods.nequi && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" htmlFor="nequiNumber">{'Número'}</label>
                  <Input
                    id="nequiNumber"
                    name="nequiNumber"
                    type="text"
                    placeholder={'(310) 123-4567'}
                    value={form.nequiNumber}
                    onChange={handleInputChange}
                    maxLength={15}
                  />
                  {errors.nequiNumber && <p className="text-xs text-red-500 mt-1">{errors.nequiNumber}</p>}
                  <label className="text-xs font-medium" htmlFor="nequiQR">{'QR'}</label>
                  <Input
                    id="nequiQR"
                    name="nequiQR"
                    type="file"
                    accept="image/*"
                    ref={nequiQRRef}
                    onChange={handleInputChange}
                  />
                  {errors.nequiQR && <p className="text-xs text-red-500 mt-1">{errors.nequiQR}</p>}
                  {form.nequiQR && (
                    <img
                      src={URL.createObjectURL(form.nequiQR)}
                      alt="QR Nequi"
                      className="h-16 mt-2 rounded border"
                    />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Mercado Pago */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-base font-medium">{'Mercado Pago'}</CardTitle>
              </div>
              <Switch checked={methods.mercadopago} onCheckedChange={() => handleToggle('mercadopago')} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{'Descripción de la opción'}</p>
              {methods.mercadopago && (
                <Button variant="outline" onClick={() => setOpenConfigModal('mercadopago')}>{'Configurar'}</Button>
              )}
            </CardContent>
          </Card>
          {/* Stripe */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-base font-medium">{'Stripe'}</CardTitle>
              </div>
              <Switch checked={methods.stripe} onCheckedChange={() => handleToggle('stripe')} />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{'Descripción de la opción'}</p>
              {methods.stripe && (
                <Button variant="outline" onClick={() => setOpenConfigModal('stripe')}>{'Configurar'}</Button>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end mt-8">
          <Button onClick={handleSave}>{'Guardar'}</Button>
        </div>
      </div>
      {/* Modal Mercado Pago */}
      <Dialog open={openConfigModal === 'mercadopago'} onOpenChange={() => setOpenConfigModal(null)}>
        <DialogContent className="animate-fade-in bg-blue-50 border-blue-200">
          <div className="flex flex-col items-center justify-center gap-2">
            <CreditCard className="h-10 w-10 text-blue-600 mb-2 animate-bounce" />
            <DialogHeader className="w-full text-center">
              <DialogTitle className="text-blue-700">{'Configurar Mercado Pago'}</DialogTitle>
              <DialogDescription className="text-blue-600 font-medium">
                {'Descripción de la configuración'}
              </DialogDescription>
            </DialogHeader>
            <div className="w-full space-y-2 mt-2">
              <label className="text-xs font-medium" htmlFor="mercadopagoEmail">{'Correo electrónico'}</label>
              <Input
                id="mercadopagoEmail"
                name="mercadopagoEmail"
                type="email"
                placeholder={'(ejemplo@correo.com'}
                value={form.mercadopagoEmail}
                onChange={handleInputChange}
              />
              {modalErrors.mercadopagoEmail && <p className="text-xs text-red-500 mt-1">{modalErrors.mercadopagoEmail}</p>}
            </div>
            <div className="flex justify-end w-full mt-4 gap-2">
              <button
                onClick={() => setOpenConfigModal(null)}
                className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" /> {'Cerrar'}
              </button>
              <Button onClick={() => { if (validateMercadoPago()) setOpenConfigModal(null); }}>{'Guardar'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal Stripe */}
      <Dialog open={openConfigModal === 'stripe'} onOpenChange={() => setOpenConfigModal(null)}>
        <DialogContent className="animate-fade-in bg-purple-50 border-purple-200">
          <div className="flex flex-col items-center justify-center gap-2">
            <CreditCard className="h-10 w-10 text-purple-600 mb-2 animate-bounce" />
            <DialogHeader className="w-full text-center">
              <DialogTitle className="text-purple-700">{'Configurar Stripe'}</DialogTitle>
              <DialogDescription className="text-purple-600 font-medium">
                {'Descripción de la configuración'}
              </DialogDescription>
            </DialogHeader>
            <div className="w-full space-y-2 mt-2">
              <label className="text-xs font-medium" htmlFor="stripePublic">{'Clave pública'}</label>
              <Input
                id="stripePublic"
                name="stripePublic"
                type="text"
                placeholder={'(stripe_public_key'}
                value={form.stripePublic}
                onChange={handleInputChange}
              />
              {modalErrors.stripePublic && <p className="text-xs text-red-500 mt-1">{modalErrors.stripePublic}</p>}
              <label className="text-xs font-medium" htmlFor="stripeSecret">{'Clave secreta'}</label>
              <Input
                id="stripeSecret"
                name="stripeSecret"
                type="password"
                placeholder={'(stripe_secret_key'}
                value={form.stripeSecret}
                onChange={handleInputChange}
              />
              {modalErrors.stripeSecret && <p className="text-xs text-red-500 mt-1">{modalErrors.stripeSecret}</p>}
            </div>
            <div className="flex justify-end w-full mt-4 gap-2">
              <button
                onClick={() => setOpenConfigModal(null)}
                className="px-4 py-2 rounded bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition-colors flex items-center gap-1"
              >
                <XCircle className="h-4 w-4" /> {'Cerrar'}
              </button>
              <Button onClick={() => { if (validateStripe()) setOpenConfigModal(null); }}>{'Guardar'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 