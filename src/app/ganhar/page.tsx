'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Gift, MousePointer, Eye, Music, MessageCircle, Download } from 'lucide-react'

type Tarefa = {
  id: string
  nome: string
  descricao: string
  moedas: number
  max_por_dia: number
  icon: any
}

export default function GanharPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [processando, setProcessando] = useState(false)

  const tarefas: Tarefa[] = [
    { id: 'T1', nome: 'Bónus diário', descricao: 'Recebe 200 moedas por dia', moedas: 200, max_por_dia: 1, icon: Gift },
    { id: 'T2', nome: 'Clique rápido', descricao: 'Ganha 10 moedas por clique', moedas: 10, max_por_dia: 100, icon: MousePointer },
    { id: 'T3', nome: 'Ver oferta', descricao: 'Vê uma oferta e ganha moedas', moedas: 50, max_por_dia: 10, icon: Eye },
    { id: 'T4', nome: 'Seguir TikTok', descricao: 'Segue no TikTok', moedas: 100, max_por_dia: 5, icon: Music },
    { id: 'T5', nome: 'Comentar vídeo', descricao: 'Comenta num vídeo', moedas: 75, max_por_dia: 8, icon: MessageCircle },
    { id: 'T6', nome: 'Instalar app parceira', descricao: 'Instala uma app parceira', moedas: 500, max_por_dia: 3, icon: Download },
  ]

  useEffect(() => {
    const userIdLogado = typeof window !== 'undefined' ? localStorage.getItem('userIdLogado') : null
    
    if (!userIdLogado) {
      router.push('/')
      return
    }

    setUserId(userIdLogado)
    setLoading(false)
  }, [router])

  const executarTarefa = async (tarefa: Tarefa) => {
    if (!userId || processando) return

    setProcessando(true)

    try {
      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      const hoje = new Date().toISOString().split('T')[0]

      // Lógica específica para T1 (Bónus diário)
      if (tarefa.id === 'T1') {
        if (userData.ultimo_login === hoje) {
          toast({
            title: "Já recebeste o teu bónus diário",
            variant: "destructive"
          })
          setProcessando(false)
          return
        }

        // Atualizar moedas e ultimo_login
        const novasMoedas = userData.moedas + tarefa.moedas
        const novoSaldo = novasMoedas / 10000

        const { error: updateError } = await supabase
          .from('users')
          .update({
            moedas: novasMoedas,
            saldo_euro: novoSaldo,
            ultimo_login: hoje
          })
          .eq('id', userId)

        if (updateError) throw updateError

        toast({
          title: "Bónus diário recebido!",
          description: `Ganhaste ${tarefa.moedas} moedas!`,
        })

        // Recarregar página após 1 segundo
        setTimeout(() => router.refresh(), 1000)
        return
      }

      // Lógica específica para T2 (Clique rápido)
      if (tarefa.id === 'T2') {
        // Contar quantas vezes T2 foi feita hoje
        const { data: historicoData, error: historicoError } = await supabase
          .from('historico_tarefas')
          .select('*')
          .eq('user_id', userId)
          .eq('tarefa_id', 'T2')
          .gte('data', hoje)

        if (historicoError) throw historicoError

        const vezesHoje = historicoData?.length || 0

        if (vezesHoje >= 100) {
          toast({
            title: "Limite diário atingido",
            description: "Já fizeste 100 cliques hoje!",
            variant: "destructive"
          })
          setProcessando(false)
          return
        }

        // Adicionar moedas
        const novasMoedas = userData.moedas + tarefa.moedas
        const novoSaldo = novasMoedas / 10000

        const { error: updateError } = await supabase
          .from('users')
          .update({
            moedas: novasMoedas,
            saldo_euro: novoSaldo
          })
          .eq('id', userId)

        if (updateError) throw updateError

        // Registrar no histórico
        await supabase
          .from('historico_tarefas')
          .insert({
            user_id: userId,
            tarefa_id: 'T2',
            data: new Date().toISOString()
          })

        toast({
          title: "Clique registado!",
          description: `Ganhaste ${tarefa.moedas} moedas! (${vezesHoje + 1}/100 hoje)`,
        })

        setTimeout(() => router.refresh(), 500)
        return
      }

      // Lógica genérica para outras tarefas (T3, T4, T5, T6)
      const { data: historicoData, error: historicoError } = await supabase
        .from('historico_tarefas')
        .select('*')
        .eq('user_id', userId)
        .eq('tarefa_id', tarefa.id)
        .gte('data', hoje)

      if (historicoError) throw historicoError

      const vezesHoje = historicoData?.length || 0

      if (vezesHoje >= tarefa.max_por_dia) {
        toast({
          title: "Limite diário desta tarefa.",
          variant: "destructive"
        })
        setProcessando(false)
        return
      }

      // Adicionar moedas
      const novasMoedas = userData.moedas + tarefa.moedas
      const novoSaldo = novasMoedas / 10000

      const { error: updateError } = await supabase
        .from('users')
        .update({
          moedas: novasMoedas,
          saldo_euro: novoSaldo
        })
        .eq('id', userId)

      if (updateError) throw updateError

      // Registrar no histórico
      await supabase
        .from('historico_tarefas')
        .insert({
          user_id: userId,
          tarefa_id: tarefa.id,
          data: new Date().toISOString()
        })

      toast({
        title: "Tarefa concluída!",
        description: `Ganhaste ${tarefa.moedas} moedas! (${vezesHoje + 1}/${tarefa.max_por_dia} hoje)`,
      })

      setTimeout(() => router.refresh(), 1000)

    } catch (error) {
      console.error('Erro ao executar tarefa:', error)
      toast({
        title: "Erro ao executar tarefa",
        description: "Tenta novamente mais tarde.",
        variant: "destructive"
      })
    } finally {
      setProcessando(false)
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          className="mb-6 text-white hover:bg-white/20"
          onClick={() => router.push('/home')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Ganhar Moedas
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tarefas.map((tarefa) => {
            const IconComponent = tarefa.icon
            return (
              <Card key={tarefa.id} className="shadow-xl hover:shadow-2xl transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <IconComponent className="h-6 w-6 text-purple-600" />
                    {tarefa.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">{tarefa.descricao}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-green-600">
                      +{tarefa.moedas} moedas
                    </span>
                    <span className="text-sm text-gray-500">
                      Máx: {tarefa.max_por_dia}/dia
                    </span>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    onClick={() => executarTarefa(tarefa)}
                    disabled={processando}
                  >
                    {processando ? 'Processando...' : 'Executar'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
