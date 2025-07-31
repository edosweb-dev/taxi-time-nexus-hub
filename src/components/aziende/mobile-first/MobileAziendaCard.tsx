import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MapPin, Users, Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import { Azienda } from "@/lib/types";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-4">
        {/* Header with company name and actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Building2 className="h-4 w-4 text-primary shrink-0" />
            <h3 
              className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 cursor-pointer"
              onClick={onView}
            >
              {azienda.nome}
            </h3>
          </div>
          
          {/* Actions dropdown for mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-3 w-3 mr-2" />
                Visualizza
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-3 w-3 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-3 w-3 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* P.IVA Badge */}
        <Badge variant="secondary" className="text-xs mb-3">
          P.IVA: {azienda.partita_iva}
        </Badge>
        
        {/* Contact info - optimized for mobile */}
        <div className="space-y-2 mb-3">
          {azienda.email && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate">{azienda.email}</span>
            </div>
          )}
          {azienda.telefono && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 shrink-0" />
              <span>{azienda.telefono}</span>
            </div>
          )}
          {azienda.citta && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{azienda.citta}</span>
            </div>
          )}
        </div>
        
        {/* Referenti - tap friendly */}
        <div 
          className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors py-1"
          onClick={onReferentiClick}
        >
          <Users className="h-3 w-3 shrink-0" />
          <span>{referentiCount} referenti</span>
        </div>
        
        {/* No contact info message */}
        {!azienda.email && !azienda.telefono && !azienda.citta && (
          <p className="text-xs text-muted-foreground italic mt-2">
            Informazioni di contatto non disponibili
          </p>
        )}
      </CardContent>
    </Card>
  );
}