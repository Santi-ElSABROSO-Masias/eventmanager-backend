import { createClient } from '@supabase/supabase-js';
import { env } from './env';

const supabaseUrl = process.env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_KEY || env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_KEY || '';

console.log('[Supabase Config] Inicializando cliente:', {
  url: supabaseUrl ? 'Configurada' : 'FALTANTE',
  key: supabaseKey ? (supabaseKey.length > 20 ? 'Presente (Longitud OK)' : 'Presente (Corta)') : 'FALTANTE'
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Credenciales de Supabase no encontradas en el Backend.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
