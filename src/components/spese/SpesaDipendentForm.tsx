import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Plus } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';

const spesaSchema = z.object({
  importo: z
    .number({ required_error: "L'importo è obbligatorio" })
    .min(0.01, "L'importo deve essere maggiore di 0")
    .max(999999.99, "L'importo è troppo elevato"),
  causale: z
    .string({ required_error: "La causale è obbligatoria" })
    .min(3, "La causale deve contenere almeno 3 caratteri")
    .max(200, "La causale non può superare i 200 caratteri"),
  note: z
    .string()
    .max(500, "Le note non possono superare i 500 caratteri")
    .optional()
});

type SpesaFormData = z.infer<typeof spesaSchema>;

// This component is now deprecated - functionality moved to SpesaForm and SpesaModal
// Keeping file to avoid import errors, but it's no longer used
export function SpesaDipendentForm() {
  return null;
}
