import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getServiziAssegnati, getAziendeForDipendente, ServiziFilters } from "@/lib/api/dipendente/servizi";

const PAGE_SIZE = 20;

export function useServiziAssegnati(filters: ServiziFilters) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['servizi-assegnati', user?.id, filters],
    queryFn: ({ pageParam = 0 }) => 
      getServiziAssegnati(user!.id, filters, pageParam, PAGE_SIZE),
    enabled: !!user?.id,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetched = allPages.reduce((sum, page) => sum + page.data.length, 0);
      if (totalFetched < lastPage.count) {
        return totalFetched;
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAziendeForDipendente() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['aziende-dipendente', user?.id],
    queryFn: () => getAziendeForDipendente(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
