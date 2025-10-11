import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface MobileShiftFormWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function MobileShiftFormWrapper({
  open,
  onOpenChange,
  title,
  description,
  children
}: MobileShiftFormWrapperProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] overflow-hidden shift-form flex flex-col">
          <DrawerHeader className="text-left px-4 py-2.5 border-b flex-shrink-0">
            <DrawerTitle className="flex items-center gap-2 text-lg">
              {title}
            </DrawerTitle>
            {description && (
              <DrawerDescription className="text-sm">
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
          {children}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] flex flex-col max-h-[90vh]">
        <DialogHeader className="space-y-2 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription>
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}