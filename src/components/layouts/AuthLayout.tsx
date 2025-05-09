
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-tr from-taxitime-800 to-taxitime-600 p-4">
      <div className="flex justify-center mb-8">
        <img 
          src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
          alt="Taxitime Logo" 
          className="h-32 w-32 object-contain drop-shadow-md"
        />
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        {children}
      </div>
    </div>
  );
}
