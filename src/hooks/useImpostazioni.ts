
import { useQuery } from '@tanstack/react-query';
import { getImpostazioni } from '@/lib/api/impostazioni/getImpostazioni';

export const useImpostazioni = () => {
  const { data: impostazioni, isLoading, error } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
  });

  return {
    impostazioni,
    isLoading,
    error,
  };
};
