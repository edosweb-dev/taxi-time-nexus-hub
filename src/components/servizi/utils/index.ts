
export * from './statusUtils';
export * from './userUtils';
export * from './groupingUtils';

// Utility per verificare se un'immagine è vuota o invalida
export const isImageEmpty = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      // Se l'immagine è troppo piccola, considerala vuota
      if (img.width < 10 || img.height < 10) {
        resolve(true);
        return;
      }
      
      try {
        // Crea un canvas per analizzare i pixel
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          // Campiona alcuni punti dell'immagine per efficienza
          const totalPixels = img.width * img.height;
          const sampleSize = Math.min(1000, totalPixels);
          const xStep = Math.max(1, Math.floor(img.width / Math.sqrt(sampleSize)));
          const yStep = Math.max(1, Math.floor(img.height / Math.sqrt(sampleSize)));
          
          let nonWhitePixels = 0;
          
          // Scansiona l'immagine a intervalli regolari
          for (let x = 0; x < img.width; x += xStep) {
            for (let y = 0; y < img.height; y += yStep) {
              const pixel = ctx.getImageData(x, y, 1, 1).data;
              // Se il pixel non è bianco (255,255,255) e non è trasparente
              if ((pixel[0] < 250 || pixel[1] < 250 || pixel[2] < 250) && pixel[3] > 10) {
                nonWhitePixels++;
                // Se troviamo abbastanza pixel non bianchi, l'immagine non è vuota
                if (nonWhitePixels > 5) {
                  resolve(false);
                  return;
                }
              }
            }
          }
          
          // Se abbiamo trovato meno di 5 pixel non bianchi, l'immagine è probabilmente vuota
          resolve(nonWhitePixels <= 5);
        } else {
          // Se non possiamo analizzare, presumiamo che sia valida
          resolve(false);
        }
      } catch (e) {
        console.error("Errore nell'analisi dell'immagine:", e);
        // In caso di errore, presumiamo che sia valida
        resolve(false);
      }
    };
    
    img.onerror = () => {
      // Se l'immagine non può essere caricata, è invalida
      resolve(true);
    };
    
    img.src = url;
    
    // Timeout se l'immagine non carica entro 3 secondi
    setTimeout(() => resolve(true), 3000);
  });
};
