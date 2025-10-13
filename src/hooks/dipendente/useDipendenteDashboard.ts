import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  getServiziOggi,
  getStatisticheMese,
  getUltimoStipendio,
  getTurniSettimana,
  type ServizioOggi,
  type StatsMese,
  type UltimoStipendio,
  type TurnoSettimana
} from "@/lib/api/dipendente/dashboard";

export function useServiziOggi() {
  const { user } = useAuth();
  
  return useQuery<ServizioOggi[]>({
    queryKey: ['servizi-oggi', user?.id],
    queryFn: () => getServiziOggi(user!.id),
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true
  });
}

export function useStatisticheMese() {
  const { user } = useAuth();
  
  return useQuery<StatsMese>({
    queryKey: ['statistiche-mese', user?.id],
    queryFn: () => getStatisticheMese(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUltimoStipendio() {
  const { user } = useAuth();
  
  return useQuery<UltimoStipendio | null>({
    queryKey: ['ultimo-stipendio', user?.id],
    queryFn: () => getUltimoStipendio(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTurniSettimana() {
  const { user, profile } = useAuth();
  
  return useQuery<TurnoSettimana[]>({
    queryKey: ['turni-settimana', user?.id],
    queryFn: () => getTurniSettimana(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true
  });
}

/**
 * Combined hook for dashboard data
 */
export function useDipendenteDashboard() {
  const serviziOggi = useServiziOggi();
  const statisticheMese = useStatisticheMese();
  const ultimoStipendio = useUltimoStipendio();
  const turniSettimana = useTurniSettimana();

  return {
    serviziOggi,
    statisticheMese,
    ultimoStipendio,
    turniSettimana,
    isLoading: 
      serviziOggi.isLoading || 
      statisticheMese.isLoading || 
      ultimoStipendio.isLoading || 
      turniSettimana.isLoading,
    isError: 
      serviziOggi.isError || 
      statisticheMese.isError || 
      ultimoStipendio.isError || 
      turniSettimana.isError
  };
}
