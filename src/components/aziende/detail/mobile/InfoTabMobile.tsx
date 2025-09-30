import { Building2, Mail, Phone, MapPin, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Azienda } from '@/lib/types';

interface InfoTabMobileProps {
  azienda: Azienda;
}

export function InfoTabMobile({ azienda }: InfoTabMobileProps) {
  return (
    <div className="space-y-4">
      {/* Card Info Principali */}
      <div className="mobile-card">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          Informazioni Principali
        </h3>
        <div className="space-y-3">
          <div className="service-info">
            <span className="text-xs text-muted-foreground w-20">Nome</span>
            <span className="text-sm font-medium">{azienda.nome}</span>
          </div>
          <div className="service-info">
            <span className="text-xs text-muted-foreground w-20">P.IVA</span>
            <Badge variant="outline" className="font-mono">{azienda.partita_iva}</Badge>
          </div>
          {azienda.indirizzo && (
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 flex-shrink-0 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm">{azienda.indirizzo}</p>
                {azienda.citta && (
                  <p className="text-xs text-muted-foreground mt-0.5">{azienda.citta}</p>
                )}
              </div>
            </div>
          )}
          {azienda.telefono && (
            <a 
              href={`tel:${azienda.telefono}`}
              className="service-info text-primary hover:underline"
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm">{azienda.telefono}</span>
            </a>
          )}
        </div>
      </div>

      {/* Card Contatti */}
      {(azienda.email || (azienda.emails && azienda.emails.length > 0)) && (
        <div className="mobile-card">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4 text-blue-500" />
            Contatti
          </h3>
          <div className="space-y-3">
            {azienda.email && (
              <a 
                href={`mailto:${azienda.email}`}
                className="flex items-center gap-2 text-sm text-primary hover:underline break-all"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                {azienda.email}
              </a>
            )}
            {azienda.emails?.map((email, i) => (
              <a 
                key={i}
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary break-all"
              >
                <Mail className="h-4 w-4 flex-shrink-0" />
                {email}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Card Fatturazione */}
      {(azienda.sdi || azienda.pec) && (
        <div className="mobile-card">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-amber-500" />
            Fatturazione Elettronica
          </h3>
          <div className="space-y-3">
            {azienda.sdi && (
              <div className="service-info">
                <span className="text-xs text-muted-foreground w-16">SDI</span>
                <Badge variant="outline" className="font-mono">{azienda.sdi}</Badge>
              </div>
            )}
            {azienda.pec && (
              <div className="service-info">
                <span className="text-xs text-muted-foreground w-16">PEC</span>
                <span className="text-sm break-all">{azienda.pec}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
