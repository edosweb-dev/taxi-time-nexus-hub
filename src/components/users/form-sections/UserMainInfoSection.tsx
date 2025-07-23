import React from 'react';
import { Control } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { UserNameFields } from '../form-fields';

interface UserMainInfoSectionProps {
  control: Control<any>;
  isEditing: boolean;
}

export function UserMainInfoSection({ control, isEditing }: UserMainInfoSectionProps) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <CardTitle className="card-title flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Informazioni Principali
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserNameFields control={control} isEditing={isEditing} />
      </CardContent>
    </Card>
  );
}