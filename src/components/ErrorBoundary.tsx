"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

// El componente de Fallback se define aquí mismo
const ErrorFallback = ({ reset }: { reset: () => void }) => (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-background">
        <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full border border-destructive/20">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-destructive mb-2">Error al Cargar la Aplicación</h1>
            <p className="text-card-foreground mb-4">
                Hubo un problema al cargar una parte de la aplicación. Esto puede deberse a un problema de red temporal o de permisos.
            </p>
            <Button onClick={reset} className="w-full">
                Intentar de Nuevo
            </Button>
        </div>
    </div>
);


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service like Sentry
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }
  
  private handleReset = () => {
      this.setState({ hasError: false });
  }

  public render() {
    if (this.state.hasError) {
      // Renderiza el Fallback UI con un botón para reintentar
      return <ErrorFallback reset={this.handleReset} />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
