"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import BancolombiaIcon from "@/components/icons/bancolombia-icon";
import NequiIcon from "@/components/icons/nequi-icon";
import DaviplataIcon from "@/components/icons/daviplata-icon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertTriangle, CreditCard, XCircle, Save, UploadCloud } from "lucide-react";
import { storageService } from "@/services/storage-service";
import { getDb } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/contexts/session-context";

interface PaymentMethodsState {
  daviplata: boolean;
  cash: boolean;
  bancolombia: boolean;
  nequi: boolean;
  mercadopago: boolean;
  stripe: boolean;
}

interface FormState {
  daviplataNumber: string;
  bancolombiaQRUrl?: string;
  nequiNumber: string;
  nequiQRUrl?: string;
  daviplataQRUrl?: string;
  mercadopagoEmail: string;
  stripePublic: string;
  stripeSecret: string;
}

interface FileState {
    daviplataQRFile: File | null;
    bancolombiaQRFile: File | null;
    nequiQRFile: File | null;
}

export default function PaymentsPage() {
  const { currentUser } = useSession();
  const companyId = currentUser?.companyId;

  const { toast } = useToast();
  const [methods, setMethods] = useState<PaymentMethodsState>({
    daviplata: true,
    cash: true,
    bancolombia: false,
    nequi: false,
    mercadopago: false,
    stripe: false,
  });
  const [form, setForm] = useState<FormState>({
    daviplataNumber: "",
    bancolombiaQRUrl: "",
    nequiNumber: "",
    nequiQRUrl: "",
    daviplataQRUrl: "",
    mercadopagoEmail: "",
    stripePublic: "",
    stripeSecret: "",
  });
  const [files, setFiles] = useState<FileState>({
    daviplataQRFile: null,
    bancolombiaQRFile: null,
    nequiQRFile: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchPaymentConfig() {
      if (!companyId) {
        setLoading(false);
        return;
      }
      try {
        const db = getDb();
        const docRef = doc(db, 'payment_configs', companyId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.methods) setMethods(data.methods);
          if (data.form) setForm(data.form);
        }
      } catch (error) {
        toast({ title: "Error", description: "No se pudo cargar la configuración de pagos.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    fetchPaymentConfig();
  }, [toast, companyId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: inputFiles } = e.target;
    if (inputFiles && inputFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: inputFiles[0] }));
    }
  };

  const handleSave = async () => {
    if (!companyId) {
        toast({ title: "Error", description: "No se pudo identificar la compañía.", variant: "destructive" });
        return;
    }
    setSaving(true);
    try {
        let updatedForm = { ...form };

        if (files.daviplataQRFile) {
            if (form.daviplataQRUrl) await storageService.deleteFile(form.daviplataQRUrl);
            updatedForm.daviplataQRUrl = await storageService.uploadFile(files.daviplataQRFile, `qrs/${companyId}/daviplata`);
        }
        if (files.bancolombiaQRFile) {
            if (form.bancolombiaQRUrl) await storageService.deleteFile(form.bancolombiaQRUrl);
            updatedForm.bancolombiaQRUrl = await storageService.uploadFile(files.bancolombiaQRFile, `qrs/${companyId}/bancolombia`);
        }
        if (files.nequiQRFile) {
            if (form.nequiQRUrl) await storageService.deleteFile(form.nequiQRUrl);
            updatedForm.nequiQRUrl = await storageService.uploadFile(files.nequiQRFile, `qrs/${companyId}/nequi`);
        }

        const configToSave = { methods, form: updatedForm };
        const db = getDb();
        const docRef = doc(db, 'payment_configs', companyId);
        await setDoc(docRef, configToSave, { merge: true });

        setForm(updatedForm); // Update local form state with new URLs
        setFiles({ daviplataQRFile: null, bancolombiaQRFile: null, nequiQRFile: null }); // Clear file inputs

        toast({ title: 'Guardado', description: 'La configuración de pagos se ha guardado correctamente.' });
    } catch (error) {
        console.error("Error saving payment config:", error);
        toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" });
    } finally {
        setSaving(false);
    }
  };
  
  if (loading) {
    return (
       <div className="space-y-8">
        <h1 className="text-3xl font-bold text-primary">{'Métodos de pago'}</h1>
        <p className="text-lg text-muted-foreground mb-6">{'Descripción de la sección'}</p>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({length: 4}).map((_, i) => (
             <Card key={i}><CardContent className="p-6"><Skeleton className="h-24 w-full"/></CardContent></Card>
          ))}
        </div>
        <div className="flex justify-end mt-8"><Skeleton className="h-10 w-24"/></div>
      </div>
    );
  }

  return (
    <>
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
              <Switch checked={methods.daviplata} onCheckedChange={() => setMethods(prev => ({ ...prev, daviplata: !prev.daviplata }))} />
            </CardHeader>
            <CardContent>
              {methods.daviplata && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" htmlFor="daviplataNumber">{'Número de teléfono'}</label>
                  <Input id="daviplataNumber" name="daviplataNumber" type="text" placeholder={'(310) 123-4567'} value={form.daviplataNumber} onChange={(e) => setForm({...form, daviplataNumber: e.target.value})} />
                  <label className="text-xs font-medium" htmlFor="daviplataQRFile">{'QR'}</label>
                  <Input id="daviplataQRFile" name="daviplataQRFile" type="file" accept="image/*" onChange={handleFileChange} />
                  {(files.daviplataQRFile || form.daviplataQRUrl) && (
                    <img src={files.daviplataQRFile ? URL.createObjectURL(files.daviplataQRFile) : form.daviplataQRUrl} alt="QR Daviplata" className="h-16 mt-2 rounded border"/>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Contra entrega */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-medium">{'Contra entrega'}</CardTitle>
              <Switch checked={methods.cash} onCheckedChange={() => setMethods(prev => ({...prev, cash: !prev.cash}))} />
            </CardHeader>
          </Card>
          {/* QR Bancolombia */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                <BancolombiaIcon className="h-6 w-6" />
                <CardTitle className="text-base font-medium">{'Bancolombia'}</CardTitle>
              </div>
              <Switch checked={methods.bancolombia} onCheckedChange={() => setMethods(prev => ({...prev, bancolombia: !prev.bancolombia}))} />
            </CardHeader>
            <CardContent>
              {methods.bancolombia && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" htmlFor="bancolombiaQRFile">{'QR'}</label>
                  <Input id="bancolombiaQRFile" name="bancolombiaQRFile" type="file" accept="image/*" onChange={handleFileChange} />
                   {(files.bancolombiaQRFile || form.bancolombiaQRUrl) && (
                    <img src={files.bancolombiaQRFile ? URL.createObjectURL(files.bancolombiaQRFile) : form.bancolombiaQRUrl} alt="QR Bancolombia" className="h-16 mt-2 rounded border"/>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Nequi */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <NequiIcon className="h-6 w-6" />
                <CardTitle className="text-base font-medium">{'Nequi'}</CardTitle>
              </div>
              <Switch checked={methods.nequi} onCheckedChange={() => setMethods(prev => ({...prev, nequi: !prev.nequi}))} />
            </CardHeader>
            <CardContent>
              {methods.nequi && (
                <div className="space-y-2">
                  <label className="text-xs font-medium" htmlFor="nequiNumber">{'Número'}</label>
                  <Input id="nequiNumber" name="nequiNumber" type="text" placeholder={'(310) 123-4567'} value={form.nequiNumber} onChange={(e) => setForm({...form, nequiNumber: e.target.value})} />
                  <label className="text-xs font-medium" htmlFor="nequiQRFile">{'QR'}</label>
                  <Input id="nequiQRFile" name="nequiQRFile" type="file" accept="image/*" onChange={handleFileChange} />
                  {(files.nequiQRFile || form.nequiQRUrl) && (
                    <img src={files.nequiQRFile ? URL.createObjectURL(files.nequiQRFile) : form.nequiQRUrl} alt="QR Nequi" className="h-16 mt-2 rounded border"/>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end mt-8">
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Guardando...' : <><Save className="mr-2 h-4 w-4" /> {'Guardar'}</>}
          </Button>
        </div>
      </div>
    </>
  );
}
