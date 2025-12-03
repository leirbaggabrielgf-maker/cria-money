'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEntrar = async () => {
    setLoading(true)

    const username = input.trim()
    if (!username) {
      alert('Escreve um nome para entrar')
      setLoading(false)
      return
    }

    // 1) tentar buscar o utilizador, mas SEM erro se não existir
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', username)
      .maybeSingle() // não rebenta se não houver linhas

    if (fetchError) {
      console.error('Erro ao buscar usuário:', fetchError)
      alert('Erro ao verificar usuário')
      setLoading(false)
      return
    }

    let user = data

    // 2) se não existir, criar novo utilizador
    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: username,
          moedas: 0,
          saldo_euro: 0,
          nivel: 1,
          ultimo_login: null,
        })
        .select()
        .maybeSingle()

      if (insertError) {
        console.error('Erro ao criar usuário:', insertError)
        alert('Erro ao criar utilizador')
        setLoading(false)
        return
      }

      user = newUser
    }

    // 3) aqui já tens sempre um user válido
    console.log('Login OK, user:', user)

    // Guardar user no localStorage e ir para a Home
    localStorage.setItem('userIdLogado', username)
    router.push('/home')

    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-gradient-to-br from-purple-500 to-pink-600">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-5xl font-bold text-center text-gray-800">
          CRIA PLAY
        </h1>
        
        <p className="text-center text-gray-600 text-lg">
          Escreve o teu email ou nome
        </p>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Email ou nome"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
            className="w-full h-12 text-lg"
            disabled={loading}
          />

          <Button
            onClick={handleEntrar}
            disabled={loading}
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
          >
            {loading ? 'A entrar...' : 'Entrar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
