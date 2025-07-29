import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Profile } from '@/lib/types';
import { User, Mail, Phone, Users, ExternalLink } from 'lucide-react';
import { useAllPasseggeriByReferente } from '@/hooks/useReferentiPasseggeri';
import { useNavigate } from 'react-router-dom';

interface ReferentiDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenti: Profile[];
  aziendaNome: string;
}

export function ReferentiDialog({ open, onOpenChange, referenti, aziendaNome }: ReferentiDialogProps) {
  const navigate = useNavigate();
  const { data: passeggeriByReferente = {} } = useAllPasseggeriByReferente();

  const handleReferenteClick = (referente: Profile) => {
    navigate(`/referenti/${referente.id}`);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Referenti - {aziendaNome}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {referenti.length === 0 ? (
            <div className="text-center py-8">
              <User className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Nessun referente trovato per questa azienda
              </p>
            </div>
          ) : (
            referenti.map((referente) => {
              const numPasseggeri = passeggeriByReferente[referente.id]?.length || 0;
              
              return (
                <div 
                  key={referente.id} 
                  className="border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleReferenteClick(referente)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      {referente.first_name} {referente.last_name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {referente.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReferenteClick(referente);
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {referente.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{referente.email}</span>
                      </div>
                    )}
                    {referente.telefono && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{referente.telefono}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{numPasseggeri} passeggeri collegati</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}