import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';

// This component is now deprecated - functionality moved to SpeseList
// Keeping file to avoid import errors, but it's no longer used
export function SpeseDipendentiList() {
  return null;
}
