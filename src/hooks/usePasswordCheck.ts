/**
 * Hook per verificare se una password è stata compromessa
 * usando l'API Have I Been Pwned (HIBP) con k-anonymity
 */

export const checkPasswordCompromised = async (password: string): Promise<{ compromised: boolean; count: number }> => {
  try {
    // Genera hash SHA-1 della password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Prendi i primi 5 caratteri (k-anonymity)
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    // Chiedi all'API HIBP
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true' // Aggiunge padding per privacy
      }
    });
    
    if (!response.ok) {
      console.error('HIBP API error:', response.status);
      return { compromised: false, count: 0 }; // In caso di errore, non bloccare
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // Cerca il nostro suffix nella lista
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const count = parseInt(countStr.trim(), 10);
        return { compromised: true, count };
      }
    }
    
    return { compromised: false, count: 0 };
  } catch (error) {
    console.error('Error checking password:', error);
    return { compromised: false, count: 0 }; // In caso di errore, non bloccare
  }
};

// Validazione robusta della password
export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 12) {
    return { valid: false, message: 'La password deve essere di almeno 12 caratteri' };
  }
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!hasUppercase) {
    return { valid: false, message: 'La password deve contenere almeno una lettera maiuscola' };
  }
  if (!hasLowercase) {
    return { valid: false, message: 'La password deve contenere almeno una lettera minuscola' };
  }
  if (!hasNumber) {
    return { valid: false, message: 'La password deve contenere almeno un numero' };
  }
  if (!hasSpecial) {
    return { valid: false, message: 'La password deve contenere almeno un carattere speciale (!@#$%^&*...)' };
  }
  
  return { valid: true, message: '' };
};
