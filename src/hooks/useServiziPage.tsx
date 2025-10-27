
import { useState } from "react";
import { useServizi } from "@/hooks/useServizi";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

export function useServiziPage() {
  const navigate = useNavigate();
  const { servizi, isLoading, error, refetch } = useServizi();
  const { users } = useUsers();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  // Check if user is admin or socio
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Navigation handlers
  const handleNavigateToDetail = (id: string) => {
    navigate(`/servizi/${id}`);
  };

  return {
    servizi,
    isLoading,
    error,
    users,
    isAdminOrSocio,
    isMobile,
    refetch,
    handleNavigateToDetail,
    profile,
  };
}
