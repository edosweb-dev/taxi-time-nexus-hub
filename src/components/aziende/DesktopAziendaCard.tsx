import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, MapPin, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Azienda } from "@/lib/types";

interface DesktopAziendaCardProps {
  azienda: Azienda;
  referentiCount: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReferentiClick: () => void;
}

export function DesktopAziendaCard({
  azienda,
  referentiCount,
  onView,
  onEdit,
  onDelete,
  onReferentiClick,
}: DesktopAziendaCardProps) {
  return (
    <Card className="group hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative overflow-hidden">
      <CardContent className="p-6">
        {/* Header with company name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 
                className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer"
                onClick={onView}
              >
                {azienda.nome}
              </h3>
              <Badge variant="secondary" className="text-xs mt-1">
                P.IVA: {azienda.partita_iva}
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Contact info */}
        <div className="space-y-3 mb-6">
          {azienda.email && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>{azienda.email}</span>
            </div>
          )}
          {azienda.telefono && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>{azienda.telefono}</span>
            </div>
          )}
          {azienda.citta && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{azienda.citta}</span>
            </div>
          )}
        </div>
        
        {/* Referenti */}
        <div 
          className="flex items-center gap-3 text-sm text-muted-foreground cursor-pointer hover:text-primary transition-colors py-2 px-3 -mx-3 rounded-lg hover:bg-primary/5 mb-6"
          onClick={onReferentiClick}
        >
          <Users className="h-4 w-4" />
          <span>{referentiCount} referenti</span>
        </div>
        
        {/* Action buttons - always visible on desktop */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onView}
            className="flex-1 hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <Eye className="h-4 w-4 mr-2" />
            Visualizza
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex-1 hover:bg-blue-500 hover:text-white transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Modifica
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onDelete}
            className="flex-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
        
        {/* No contact info message */}
        {!azienda.email && !azienda.telefono && !azienda.citta && (
          <p className="text-sm text-muted-foreground italic mb-4">
            Informazioni di contatto non disponibili
          </p>
        )}
      </CardContent>
    </Card>
  );
}