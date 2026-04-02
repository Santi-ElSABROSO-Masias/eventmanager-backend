import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// 1. Detectar URL (prioridad VITE_ por posible copia de frontend)
const supabaseUrl = (process.env.VITE_SUPABASE_URL || env.SUPABASE_URL || process.env.SUPABASE_URL || '').trim();

// 2. Detectar Key con ALTA PRIORIDAD a SERVICE_ROLE (Administrador)
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_KEY || 
  env.SUPABASE_SERVICE_KEY || 
  env.SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  ''
).trim();

// 3. Log de Diagnóstico (Seguro: solo longitud y tipo)
const isServiceRole = supabaseKey.includes('service_role') || (supabaseKey.length > 200); // Las SERVICE_ROLE suelen ser más largas

console.log('[Supabase Config] 🔍 Iniciando cliente:', { 
  url: supabaseUrl ? 'OK' : 'FALTANTE', 
  tipo_llave: isServiceRole ? 'ADMIN (Bypass RLS ✅)' : 'LIMITADA (Sujeta a RLS ⚠️)',
  longitud_key: supabaseKey.length
});

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR CRÍTICO: No se encontraron credenciales de Supabase en el Backend.');
}

// 4. Crear el cliente
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});
