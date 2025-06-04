
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Link } from "react-router-dom";
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Verifica se abbiamo un token di reset valido
    const verifyResetToken = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (!token || type !== 'recovery') {
        console.log('[ResetPassword] Token mancante o tipo non valido');
        setIsValidToken(false);
        return;
      }
      
      try {
        // Verifica il token con Supabase
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery'
        });
        
        if (error) {
          console.error('[ResetPassword] Errore verifica token:', error);
          setIsValidToken(false);
        } else {
          console.log('[ResetPassword] Token valido, utente autenticato');
          setIsValidToken(true);
        }
      } catch (error) {
        console.error('[ResetPassword] Errore durante verifica token:', error);
        setIsValidToken(false);
      }
    };
    
    verifyResetToken();
  }, [searchParams]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }
    
    if (password.length < 6) {
      toast.error("La password deve contenere almeno 6 caratteri");
      return;
    }
    
    setLoading(true);
    
    try {
      console.log('[ResetPassword] Aggiornamento password in corso');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('[ResetPassword] Errore aggiornamento password:', error);
        toast.error(`Errore nell'aggiornamento della password: ${error.message}`);
        return;
      }
      
      console.log('[ResetPassword] Password aggiornata con successo');
      toast.success("Password aggiornata con successo! Ora puoi effettuare l'accesso.");
      
      // Logout per forzare un nuovo login con la nuova password
      await supabase.auth.signOut();
      
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      console.error('[ResetPassword] Errore imprevisto:', error);
      toast.error(`Errore imprevisto: ${error.message || 'Riprova più tardi'}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (isValidToken === null) {
    return (
      <AuthLayout>
        <Card className="w-full shadow-2xl border-taxitime-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="py-8">
            <div className="flex justify-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-taxitime-600 border-t-transparent"></span>
            </div>
            <p className="text-center mt-4 text-taxitime-700">Verifica del link in corso...</p>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }
  
  if (isValidToken === false) {
    return (
      <AuthLayout>
        <Card className="w-full shadow-2xl border-red-200 bg-white/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-medium text-center text-red-700">Link non valido</h2>
          </CardHeader>
          <CardContent className="py-4">
            <p className="text-center text-muted-foreground mb-4">
              Il link per il reset della password non è valido o è scaduto.
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              asChild
              variant="outline" 
              className="w-full"
            >
              <Link to="/login" className="flex items-center justify-center">
                <ArrowLeft className="mr-2 h-4 w-4" /> Torna al login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </AuthLayout>
    );
  }
  
  return (
    <AuthLayout>
      <Card className="w-full shadow-2xl border-taxitime-200 bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <h2 className="text-xl font-medium text-center text-taxitime-800">Imposta nuova password</h2>
          <p className="text-sm text-center text-muted-foreground mt-1">
            Inserisci la tua nuova password
          </p>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-taxitime-800 font-medium">Nuova Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white border-taxitime-200 focus-visible:ring-taxitime-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-taxitime-800 font-medium">Conferma Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white border-taxitime-200 focus-visible:ring-taxitime-500 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
            
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-sm text-red-600">Le password non coincidono</p>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 pb-8">
            <Button 
              type="submit" 
              className="w-full bg-taxitime-600 hover:bg-taxitime-700 text-white transition-colors text-base py-6" 
              disabled={loading || password !== confirmPassword || password.length < 6}
            >
              {loading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                  Aggiornamento in corso...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" /> Aggiorna password
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
