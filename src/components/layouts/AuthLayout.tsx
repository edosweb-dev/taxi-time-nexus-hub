
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-taxitime-50">
      <div className="w-full max-w-md p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
