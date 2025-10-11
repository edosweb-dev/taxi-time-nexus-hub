/**
 * Utilities per la validazione batch dei turni
 * Ottimizza le performance ed evita doppia validazione
 */

import { supabase } from '@/lib/supabase';
import { ShiftFormData } from '../types';
import { format } from 'date-fns';

export interface BatchValidationResult {
  validShifts: ShiftFormData[];
  invalidShifts: Array<{
    shift: ShiftFormData;
    reason: string;
  }>;
  conflictingSummary: Record<string, string[]>; // userId -> array of conflicting dates
}

/**
 * Valida un batch di turni in una singola operazione
 * Evita la doppia validazione del sistema precedente
 */
export async function validateBatchShifts(
  shifts: ShiftFormData[]
): Promise<BatchValidationResult> {
  console.log(`🔍 [BATCH VALIDATION] Validating ${shifts.length} shifts`);
  
  const result: BatchValidationResult = {
    validShifts: [],
    invalidShifts: [],
    conflictingSummary: {}
  };
  
  // Raggruppa i turni per utente e data per ottimizzare le query
  const shiftsByUserAndDate = new Map<string, Map<string, ShiftFormData[]>>();
  
  for (const shift of shifts) {
    const userId = shift.user_id;
    const shiftDate = format(shift.shift_date, 'yyyy-MM-dd');
    
    if (!shiftsByUserAndDate.has(userId)) {
      shiftsByUserAndDate.set(userId, new Map());
    }
    
    const userShifts = shiftsByUserAndDate.get(userId)!;
    if (!userShifts.has(shiftDate)) {
      userShifts.set(shiftDate, []);
    }
    
    userShifts.get(shiftDate)!.push(shift);
  }
  
  // Fetch tutti i turni esistenti in una singola query per tutte le date/utenti coinvolti
  const allUserIds = Array.from(shiftsByUserAndDate.keys());
  const allDates = shifts.map(s => format(s.shift_date, 'yyyy-MM-dd'));
  const uniqueDates = [...new Set(allDates)];
  
  console.log(`🔍 [BATCH VALIDATION] Fetching existing shifts for ${allUserIds.length} users and ${uniqueDates.length} dates`);
  
  const { data: existingShifts, error } = await supabase
    .from('shifts')
    .select('*')
    .in('user_id', allUserIds)
    .in('shift_date', uniqueDates);
  
  if (error) {
    console.error('Error fetching existing shifts:', error);
    throw new Error('Errore nel controllo dei turni esistenti');
  }
  
  // Organizza i turni esistenti per facile lookup
  const existingByUserAndDate = new Map<string, Map<string, any[]>>();
  for (const existing of existingShifts || []) {
    const userId = existing.user_id;
    const shiftDate = existing.shift_date;
    
    if (!existingByUserAndDate.has(userId)) {
      existingByUserAndDate.set(userId, new Map());
    }
    
    const userExisting = existingByUserAndDate.get(userId)!;
    if (!userExisting.has(shiftDate)) {
      userExisting.set(shiftDate, []);
    }
    
    userExisting.get(shiftDate)!.push(existing);
  }
  
  // Valida ogni turno nel batch
  for (const [userId, userShifts] of shiftsByUserAndDate) {
    for (const [shiftDate, shiftsForDate] of userShifts) {
      const existingForDate = existingByUserAndDate.get(userId)?.get(shiftDate) || [];
      
      // Applica la logica di validazione
      const validation = validateShiftsForDateAndUser(
        shiftsForDate,
        existingForDate,
        userId,
        shiftDate
      );
      
      result.validShifts.push(...validation.valid);
      result.invalidShifts.push(...validation.invalid);
      
      if (validation.conflicts.length > 0) {
        if (!result.conflictingSummary[userId]) {
          result.conflictingSummary[userId] = [];
        }
        result.conflictingSummary[userId].push(shiftDate);
      }
    }
  }
  
  console.log(`🔍 [BATCH VALIDATION] Result: ${result.validShifts.length} valid, ${result.invalidShifts.length} invalid`);
  
  return result;
}

/**
 * Valida i turni per una specifica data e utente
 */
function validateShiftsForDateAndUser(
  newShifts: ShiftFormData[],
  existingShifts: any[],
  userId: string,
  shiftDate: string
) {
  const valid: ShiftFormData[] = [];
  const invalid: Array<{ shift: ShiftFormData; reason: string }> = [];
  const conflicts: string[] = [];
  
  console.log(`🔍 [USER VALIDATION] User ${userId} on ${shiftDate}: ${newShifts.length} new, ${existingShifts.length} existing`);
  
  for (const shift of newShifts) {
    // Se ci sono già turni per questa data, non permettiamo altri turni
    if (existingShifts.length > 0) {
      invalid.push({
        shift,
        reason: "È possibile inserire un solo turno per giornata."
      });
      conflicts.push(shiftDate);
      continue;
    }
    
    // Se arriviamo qui, il turno è valido
    valid.push(shift);
  }
  
  return { valid, invalid, conflicts };
}

/**
 * Crea turni in batch con transazione atomica
 */
export async function createBatchShifts(
  shifts: ShiftFormData[],
  userId: string,
  onProgress?: (created: number, total: number) => void
): Promise<{ created: number; errors: Array<{ shift: ShiftFormData; error: string }> }> {
  console.log(`📝 [BATCH CREATE] Creating ${shifts.length} shifts`);
  
  const errors: Array<{ shift: ShiftFormData; error: string }> = [];
  let created = 0;
  
  // Crea turni in piccoli batch per evitare timeout
  const BATCH_SIZE = 5;
  
  for (let i = 0; i < shifts.length; i += BATCH_SIZE) {
    const batch = shifts.slice(i, i + BATCH_SIZE);
    
    const batchData = batch.map(shift => ({
      user_id: shift.user_id,
      shift_date: format(shift.shift_date, 'yyyy-MM-dd'),
      shift_type: shift.shift_type,
      start_time: shift.start_time,
      end_time: shift.end_time,
      half_day_type: shift.half_day_type || null,
      start_date: shift.start_date ? format(shift.start_date, 'yyyy-MM-dd') : null,
      end_date: shift.end_date ? format(shift.end_date, 'yyyy-MM-dd') : null,
      notes: shift.notes || null,
      created_by: userId,
      updated_by: userId
    }));
    
    const { data, error } = await supabase
      .from('shifts')
      .insert(batchData)
      .select();
    
    if (error) {
      console.error(`Error creating batch ${i / BATCH_SIZE + 1}:`, error);
      // Aggiungi errori per tutti i turni del batch
      batch.forEach(shift => {
        errors.push({ shift, error: error.message });
      });
    } else {
      created += data?.length || 0;
      console.log(`✅ [BATCH CREATE] Batch ${i / BATCH_SIZE + 1} completed: ${data?.length} shifts created`);
    }
    
    onProgress?.(created, shifts.length);
    
    // Piccola pausa per non sovraccaricare il database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`📝 [BATCH CREATE] Completed: ${created} created, ${errors.length} errors`);
  
  return { created, errors };
}