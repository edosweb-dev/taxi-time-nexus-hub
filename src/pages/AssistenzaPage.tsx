
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Link } from "react-router-dom";

export default function AssistenzaPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("La tua richiesta è stata inviata. Ti contatteremo al più presto.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-xl border-taxitime-100">
        <CardHeader className="space-y-1 flex items-center justify-center pb-0">
          <div className="flex justify-center mb-6 mt-2">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-28 w-28 object-contain"
            />
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-5 pt-4">
            <div className="text-center mb-4">
              <h2 className="text-xl font-medium text-taxitime-800">Richiedi Assistenza</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Compila il modulo per richiedere supporto
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Messaggio</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="bg-background min-h-[100px]"
                placeholder="Descrivi il problema riscontrato..."
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-taxitime-600 hover:bg-taxitime-700" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Invio in corso...
                </>
              ) : (
                <>
                  <HelpCircle className="mr-2 h-4 w-4" /> Invia richiesta
                </>
              )}
            </Button>
            
            <Button 
              asChild
              variant="link" 
              size="sm" 
              className="text-taxitime-600 hover:text-taxitime-800"
            >
              <Link to="/login">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Torna al login
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
