import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { format, startOfWeek, endOfWeek } from "date-fns";
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
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  return useQuery<StatsMese>({
    queryKey: ['stats-mese', user?.id, month, year],
    queryFn: () => getStatisticheMese(user!.id, month, year),
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
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useTurniSettimana() {
  const { user } = useAuth();
  const now = new Date();
  const startWeek = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const endWeek = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
  
  return useQuery<TurnoSettimana[]>({
    queryKey: ['turni-settimana', user?.id, startWeek, endWeek],
    queryFn: () => getTurniSettimana(user!.id, startWeek, endWeek),
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
