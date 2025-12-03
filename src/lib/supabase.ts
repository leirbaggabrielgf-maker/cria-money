import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ Variáveis de ambiente do Supabase não configuradas!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓ Configurada' : '✗ Faltando')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✓ Configurada' : '✗ Faltando')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

export type User = {
  id: string
  moedas: number
  saldo_euro: number
  nivel: number
  ultimo_login: string
}
