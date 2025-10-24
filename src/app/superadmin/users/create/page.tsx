"use client";

// Esta página se ha eliminado. La lógica de creación ahora está en un modal
// dentro de /superadmin/users/page.tsx. Este archivo se puede borrar.
// Se mantiene un componente vacío para evitar errores de compilación
// si hay alguna referencia temporal.

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function DeprecatedCreateUserPage() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/superadmin/users');
    }, [router]);
    
    return (
        <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Redirigiendo a la nueva página de usuarios...</p>
        </div>
    );
}
