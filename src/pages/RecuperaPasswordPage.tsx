import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Link } from "react-router-dom";

export default function RecuperaPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Se l'indirizzo email esiste nel sistema, riceverai istruzioni per reimpostare la password.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error("Si è verificato un errore. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout>
      <Card className="w-full shadow-2xl border-taxitime-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <h2 className="text-xl font-medium text-center text-taxitime-800">Recupera Password</h2>
          <p className="text-sm text-center text-muted-foreground mt-1">
            Inserisci la tua email per reimpostare la password
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-taxitime-800 font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nome@azienda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white border-taxitime-200 focus-visible:ring-taxitime-500"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 pb-8">
            <Button 
              type="submit" 
              className="w-full bg-taxitime-600 hover:bg-taxitime-700 text-white transition-colors text-base py-6" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Elaborazione in corso...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Invia istruzioni
                </>
              )}
            </Button>
            
            <Button 
              asChild
              variant="link" 
              size="sm" 
              className="text-taxitime-600 hover:text-taxitime-800 font-medium"
            >
              <Link to="/login" className="flex items-center">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Torna al login
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
