'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function LevantarPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [moedas, setMoedas] = useState(0)
  const [saldoEuro, setSaldoEuro] = useState(0)
  const [contactoPagamento, setContactoPagamento] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

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
        const calculatedSaldo = data.moedas / 10000
        setSaldoEuro(calculatedSaldo)
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePedirLevantamento = async () => {
    if (!userId) return

    // Verificar se saldo é suficiente
    if (saldoEuro < 5) {
      setMessage('Saldo insuficiente')
      setMessageType('error')
      return
    }

    if (!contactoPagamento.trim()) {
      setMessage('Por favor, insira o contacto de pagamento')
      setMessageType('error')
      return
    }

    try {
      // Criar nova linha na tabela levantamentos
      const { error: levantamentoError } = await supabase
        .from('levantamentos')
        .insert({
          userId: userId,
          valor: saldoEuro,
          moedas_usadas: moedas,
          contacto_pagamento: contactoPagamento,
          data: new Date().toISOString(),
          estado: 'pendente'
        })

      if (levantamentoError) throw levantamentoError

      // Atualizar users: zerar moedas e saldo_euro
      const { error: updateError } = await supabase
        .from('users')
        .update({
          moedas: 0,
          saldo_euro: 0
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setMessage('Pedido enviado!')
      setMessageType('success')
      setMoedas(0)
      setSaldoEuro(0)
      setContactoPagamento('')

      // Redirecionar para home após 2 segundos
      setTimeout(() => {
        router.push('/home')
      }, 2000)

    } catch (error) {
      console.error('Erro ao criar pedido de levantamento:', error)
      setMessage('Erro ao processar pedido. Tente novamente.')
      setMessageType('error')
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
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-4 bg-gradient-to-br from-orange-400 to-red-600">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Levantar €
          </h1>
          
          <div className="space-y-3 text-center">
            <p className="text-2xl font-semibold text-gray-700">
              Saldo atual: <span className="text-green-600">{saldoEuro.toFixed(2)} €</span>
            </p>
            <p className="text-lg text-gray-600">
              Mínimo para levantar: 5€
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="contacto" className="text-gray-700 font-semibold">
                Contacto de Pagamento
              </Label>
              <Input
                id="contacto"
                type="text"
                placeholder="Email, telefone ou IBAN"
                value={contactoPagamento}
                onChange={(e) => setContactoPagamento(e.target.value)}
                className="w-full"
              />
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 text-white font-bold py-6 text-lg"
              onClick={handlePedirLevantamento}
            >
              Pedir levantamento
            </Button>

            {message && (
              <div className={`p-4 rounded-lg text-center font-semibold ${
                messageType === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <Button 
              variant="outline"
              className="w-full"
              onClick={() => router.push('/home')}
            >
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
