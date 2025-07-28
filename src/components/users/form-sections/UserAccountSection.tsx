import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Info } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { UserRoleField, UserPasswordFields } from '../form-fields';

interface UserAccountSectionProps {
  control: Control<any>;
  isEditing: boolean;
  defaultRole?: UserRole;
  hiddenRoles?: UserRole[];
}

export function UserAccountSection({ control, isEditing, defaultRole, hiddenRoles }: UserAccountSectionProps) {
  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-4">
        <CardTitle className="card-title flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-500" />
          Configurazioni Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UserRoleField 
          control={control} 
          hiddenRoles={hiddenRoles} 
          defaultRole={defaultRole}
        />
        
        
        <UserPasswordFields control={control} isEditing={isEditing} />
      </CardContent>
    </Card>
  );
}