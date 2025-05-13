
import { useState, useEffect } from "react";
import { useServizi } from "@/hooks/useServizi";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Servizio } from "@/lib/types/servizi";

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

  const handleNavigateToNewServizio = () => {
    navigate("/nuovo-servizio");
  };

  // Function to handle switching to calendar view
  const handleShowCalendarView = () => {
    // This will be called from the header
    // Implementation will be in ServiziContent
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
    handleNavigateToNewServizio,
    handleShowCalendarView,
  };
}
