'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [moedas, setMoedas] = useState(0)
  const [saldoEuro, setSaldoEuro] = useState(0)
  const [nivel, setNivel] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userIdLogado = typeof window !== 'undefined' ? localStorage.getItem('userIdLogado') : null
    
    if (!userIdLogado) {
      router.push('/')
      return
    }

    setUserId(userIdLogado)
    loadUserData(userIdLogado)
  }, [router])

  const loadUserData = async (userIdLogado: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userIdLogado)
        .single()

      if (error) throw error

      if (data) {
        setMoedas(data.moedas)
        setNivel(data.nivel)
        // Converter moedas para saldo_euro
        const calculatedSaldo = data.moedas / 10000
        setSaldoEuro(calculatedSaldo)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-gradient-to-br from-purple-500 to-pink-600">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Olá, {userId}
          </h1>
          
          <div className="space-y-3 text-center">
            <p className="text-xl font-semibold text-gray-700">
              Moedas: <span className="text-purple-600">{moedas}</span>
            </p>
            <p className="text-xl font-semibold text-gray-700">
              Saldo: <span className="text-green-600">{saldoEuro.toFixed(2)} €</span>
            </p>
            <p className="text-xl font-semibold text-gray-700">
              Nível: <span className="text-blue-600">{nivel}</span>
            </p>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              className="w-full bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white font-bold py-6 text-lg"
              onClick={() => router.push('/ganhar')}
            >
              Ganhar
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-400 to-indigo-600 hover:from-blue-500 hover:to-indigo-700 text-white font-bold py-6 text-lg"
              onClick={() => router.push('/loja')}
            >
              Loja
            </Button>
            
            <Button 
              className="w-full bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 text-white font-bold py-6 text-lg"
              onClick={() => router.push('/levantar')}
            >
              Levantar €
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
