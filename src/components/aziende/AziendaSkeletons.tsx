import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TableRow, TableCell } from '@/components/ui/table';

// Skeleton for card view
export const AziendaCardSkeleton = () => (
  <div className="animate-pulse bg-background rounded-lg border p-4 shadow-sm space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    
    <div className="space-y-2">
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    
    <div className="flex justify-between items-center pt-2">
      <Skeleton className="h-3 w-1/4" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded" />
        <Skeleton className="h-6 w-16 rounded" />
      </div>
    </div>
  </div>
);

// Skeleton for table row
export const AziendaTableSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton className="h-4 w-4" /></TableCell>
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      </div>
    </TableCell>
    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[140px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[90px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[110px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[70px]" /></TableCell>
    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
  </TableRow>
);

// Skeleton for list view on mobile
export const AziendaListSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 6 }).map((_, i) => (
      <AziendaCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for form sections
export const AziendaFormSkeleton = () => (
  <div className="space-y-6">
    {/* Main info card skeleton */}
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-[160px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>

    {/* Contact info card skeleton */}
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-[180px]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-[70px]" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Settings card skeleton */}
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-[140px]" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        ))}
      </div>
    </div>

    {/* Action buttons skeleton */}
    <div className="flex justify-end gap-3 pt-4 border-t">
      <Skeleton className="h-10 w-[80px]" />
      <Skeleton className="h-10 w-[120px]" />
    </div>
  </div>
);

// Skeleton for header section
export const AziendaHeaderSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[160px]" />
        <Skeleton className="h-4 w-[220px]" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-[80px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
  </div>
);

// Skeleton for search and filters
export const AziendaFiltersSkeletons = () => (
  <div className="flex items-center gap-4">
    <Skeleton className="h-10 w-[200px]" />
    <Skeleton className="h-10 w-[100px]" />
    <Skeleton className="h-10 w-[80px]" />
  </div>
);