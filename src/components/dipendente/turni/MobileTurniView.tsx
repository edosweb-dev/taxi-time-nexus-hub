import { useState } from 'react';
import { MobileShiftDayView } from '@/components/shifts/mobile/MobileShiftDayView';
import { useTurniMese } from '@/hooks/dipendente/useTurniMese';
import { Shift } from '@/lib/utils/turniHelpers';
import { useAuth } from '@/contexts/AuthContext';

interface MobileTurniViewProps {
  onNewTurno: () => void;
  onTurnoClick: (turno: Shift) => void;
}

export function MobileTurniView({ onNewTurno, onTurnoClick }: MobileTurniViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const { data: turni = [], isLoading } = useTurniMese(year, month);

  const { profile } = useAuth();
  
  return (
    <MobileShiftDayView
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      shifts={turni}
      isLoading={isLoading}
      onEditShift={onTurnoClick}
      onAddShift={onNewTurno}
      showAddButton={true}
      showUserInfo={false}
      filterUserId={profile?.id}
    />
  );
}
