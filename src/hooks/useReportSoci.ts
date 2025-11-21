import { useQuery } from '@tanstack/react-query';
import { getReportSociData } from '@/lib/api/report-soci/getReportSociData';

export function useReportSoci(mese: number, anno: number) {
  return useQuery({
    queryKey: ['report-soci', mese, anno],
    queryFn: () => getReportSociData(mese, anno),
    staleTime: 5 * 60 * 1000,
  });
}
