import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Users, FileCheck, CreditCard, FileText, Trash2, ChevronRight } from "lucide-react";
import { Azienda } from "@/lib/types";

interface MobileAziendaCardProps {
  azienda: Azienda;
  referentiCount: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReferentiClick: () => void;
}

export function MobileAziendaCard({
  azienda,
  referentiCount,
  onView,
  onEdit,
  onDelete,
  onReferentiClick,
}: MobileAziendaCardProps) {
  return (
    <div className="mobile-card touch-feedback" onClick={onView}>
      {/* Header con nome e P.IVA */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base text-foreground break-words">
            {azienda.nome}
          </h3>
          <Badge variant="outline" className="mt-1 text-xs">
            P.IVA {azienda.partita_iva}
          </Badge>
        </div>
      </div>

      {/* Info contatti */}
      <div className="space-y-2 mb-3">
        {azienda.email && (
          <div className="service-info">
            <Mail className="service-info-icon" />
            <span className="truncate text-sm">{azienda.email}</span>
          </div>
        )}
        {azienda.telefono && (
          <div className="service-info">
            <Phone className="service-info-icon" />
            <span className="text-sm">{azienda.telefono}</span>
          </div>
        )}
        {azienda.citta && (
          <div className="service-info">
            <MapPin className="service-info-icon" />
            <span className="truncate text-sm">{azienda.citta}</span>
          </div>
        )}
      </div>

      {/* Status badges row */}
      <div className="flex flex-wrap gap-2 mb-3">
        {/* Firma digitale */}
        <Badge 
          variant={azienda.firma_digitale_attiva ? "success" : "secondary"}
          className="text-xs flex items-center gap-1"
        >
          <FileCheck className="h-3 w-3" />
          {azienda.firma_digitale_attiva ? 'Firma Attiva' : 'No Firma'}
        </Badge>

        {/* Provvigione */}
        {azienda.provvigione && (
          <Badge variant="secondary" className="text-xs px-2.5 py-1">
            <span className="font-medium">
              Provv. {azienda.provvigione_tipo === 'percentuale' 
                ? `${azienda.provvigione_valore}%` 
                : `€${azienda.provvigione_valore}`
              }
            </span>
          </Badge>
        )}

        {/* Fatturazione elettronica */}
        {(azienda.sdi || azienda.pec) && (
          <Badge variant="outline" className="text-xs flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {azienda.sdi ? 'SDI' : 'PEC'}
          </Badge>
        )}
      </div>

      {/* Referenti clickable */}
      {referentiCount > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReferentiClick();
          }}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors mb-3"
        >
          <div className="flex items-center gap-2 text-sm text-blue-900">
            <Users className="h-4 w-4" />
            <span className="font-medium">{referentiCount} referenti</span>
          </div>
          <ChevronRight className="h-4 w-4 text-blue-600" />
        </button>
      )}

      {/* Actions visibili */}
      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex-1 min-h-[44px]"
        >
          Modifica
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="min-h-[44px] px-3"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}