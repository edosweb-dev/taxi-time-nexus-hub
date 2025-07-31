import { Button } from "@/components/ui/button";
import { Building2, Phone, Mail, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Azienda } from "@/lib/types";
import { MobileTable, MobileTableItem } from "@/components/mobile/MobileTable";

interface MobileAziendaTableProps {
  aziende: Azienda[];
  referentiByAzienda: Record<string, any[]>;
  onView: (azienda: Azienda) => void;
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onReferentiClick: (azienda: Azienda) => void;
}

export function MobileAziendaTable({
  aziende,
  referentiByAzienda,
  onView,
  onEdit,
  onDelete,
  onReferentiClick,
}: MobileAziendaTableProps) {
  const tableItems: MobileTableItem[] = aziende.map((azienda) => {
    const referentiCount = referentiByAzienda[azienda.id]?.length || 0;
    
    // Prepare contact details
    const contactDetails = [];
    if (azienda.email) {
      contactDetails.push({
        icon: <Mail className="h-3 w-3" />,
        label: "Email",
        value: azienda.email
      });
    }
    if (azienda.telefono) {
      contactDetails.push({
        icon: <Phone className="h-3 w-3" />,
        label: "Telefono", 
        value: azienda.telefono
      });
    }
    
    return {
      id: azienda.id,
      primary: azienda.nome,
      secondary: `P.IVA: ${azienda.partita_iva}`,
      status: {
        label: `${referentiCount} referenti`,
        variant: referentiCount > 0 ? "default" : "warning" as "default" | "destructive" | "success" | "warning"
      },
      details: [
        ...contactDetails,
        {
          icon: <Users className="h-3 w-3" />,
          label: "Referenti",
          value: `${referentiCount}`,
          onClick: () => onReferentiClick(azienda)
        }
      ],
      actions: (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onView(azienda);
            }}
            className="h-7 w-7 p-0"
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(azienda);
            }}
            className="h-7 w-7 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(azienda);
            }}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    };
  });

  return (
    <MobileTable
      items={tableItems}
      onItemClick={(item) => {
        const azienda = aziende.find(a => a.id === item.id);
        if (azienda) onView(azienda);
      }}
      emptyMessage="Nessuna azienda trovata"
    />
  );
}