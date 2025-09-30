import { Control } from 'react-hook-form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Building2, Phone, Settings } from 'lucide-react';
import { MobileInfoFields } from './form-sections/MobileInfoFields';
import { MobileContactFields } from './form-sections/MobileContactFields';
import { MobileSettingsFields } from './form-sections/MobileSettingsFields';

interface MobileAziendaFormSectionsProps {
  control: Control<any>;
}

export function MobileAziendaFormSections({ control }: MobileAziendaFormSectionsProps) {
  return (
    <Accordion 
      type="multiple" 
      defaultValue={['info']}
      className="w-full px-4 py-4 space-y-3"
    >
      <AccordionItem value="info" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-semibold">Informazioni Principali</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MobileInfoFields control={control} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="contacts" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">Contatti</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MobileContactFields control={control} />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="settings" className="border rounded-lg px-4 bg-card">
        <AccordionTrigger className="hover:no-underline py-4">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-amber-500" />
            <span className="font-semibold">Configurazioni</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pb-4 pt-2">
          <MobileSettingsFields control={control} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
