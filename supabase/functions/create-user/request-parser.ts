
import { validRoles } from "./constants.ts";
import { RequestParseResult, UserData } from "./types.ts";

export async function parseRequestBody(req: Request): Promise<RequestParseResult> {
  try {
    // Assicurati che la richiesta sia clonata prima di leggere il corpo
    const clonedReq = req.clone();
    const rawText = await clonedReq.text();
    console.log("Edge function: Raw request body:", rawText);
    
    if (!rawText || rawText.trim() === '') {
      console.error("Edge function: Corpo della richiesta vuoto");
      return { 
        userData: null, 
        error: 'Corpo della richiesta vuoto' 
      };
    }
    
    let userData: UserData;
    try {
      userData = JSON.parse(rawText);
    } catch (parseError) {
      console.error("Edge function: Errore nel parsing dei dati JSON:", parseError);
      console.error("Edge function: Testo ricevuto:", rawText);
      return { 
        userData: null, 
        error: 'Dati utente non validi: formato JSON non corretto' 
      };
    }
    
    // Validate required fields
    if (!userData.email || !userData.first_name || !userData.last_name || !userData.role) {
      console.error("Edge function: Campi obbligatori mancanti:", userData);
      return { 
        userData: null, 
        error: 'Campi obbligatori mancanti',
        details: {
          email: userData.email ? '✓' : '✗',
          first_name: userData.first_name ? '✓' : '✗',
          last_name: userData.last_name ? '✓' : '✗',
          role: userData.role ? '✓' : '✗'
        }
      };
    }
    
    // Validate role
    if (!validRoles.includes(userData.role)) {
      console.error(`Edge function: Ruolo non valido: ${userData.role}`);
      return { 
        userData: null, 
        error: 'Ruolo non valido',
        details: { valid_roles: validRoles.join(', ') }
      };
    }
    
    console.log("Edge function: Dati utente ricevuti:", userData);
    return { userData, error: null };
  } catch (e) {
    console.error("Edge function: Errore nel leggere il corpo della richiesta:", e);
    return { 
      userData: null, 
      error: 'Errore nella lettura dei dati' 
    };
  }
}
