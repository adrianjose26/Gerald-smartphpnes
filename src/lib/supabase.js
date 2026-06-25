// =========================================================
//  Cliente de Supabase
//  ---------------------------------------------------------
//  La URL y la "publishable key" son públicas (seguras de incluir en
//  la app). La seguridad real la dan las políticas RLS de la tabla:
//  cada usuario solo ve y edita SUS propios datos.
// =========================================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vlsivvswrjgezubdfxai.supabase.co'
const SUPABASE_KEY = 'sb_publishable_cbIN4gOXr1ERrkhgyZgJwQ_SVuyP68z'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true, // mantiene la sesión iniciada en el dispositivo
    autoRefreshToken: true,
  },
})
