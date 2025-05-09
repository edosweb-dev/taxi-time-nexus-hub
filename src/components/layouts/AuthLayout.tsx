
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <div className="flex-1 flex flex-col justify-center items-center p-4 md:p-8">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
          <div className="mb-8 text-center">
            <div className="mb-2 flex justify-center">
              <div className="h-12 w-12 rounded-full taxitime-gradient flex items-center justify-center text-white text-xl font-bold">
                T
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">TAXITIME V2</h1>
            <p className="text-muted-foreground mt-1">
              Gestione servizi, utenti, turni e spese
            </p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
