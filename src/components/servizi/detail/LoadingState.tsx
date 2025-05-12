
export function LoadingState() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      <span className="ml-2">Caricamento servizio...</span>
    </div>
  );
}
