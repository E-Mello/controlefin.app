// Path: components/transaction-form.tsx

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle2, ArrowLeft } from "lucide-react"
import type { Transaction, TransactionType } from "@/lib/types"
import DateInput from "./date-input"

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void
  editingTransaction: Transaction | null
  onCancelEdit: () => void
}

export default function TransactionForm({ onAddTransaction, editingTransaction, onCancelEdit }: TransactionFormProps) {
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [formattedAmount, setFormattedAmount] = useState("")
  const [type, setType] = useState<TransactionType>("income")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [id, setId] = useState<string>("")
  const [errors, setErrors] = useState<{
    description?: string
    amount?: string
    date?: string
  }>({})

  // Preencher o formulário quando estiver editando
  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.description)

      // Formatar o valor para exibição no formato brasileiro
      const formattedValue = editingTransaction.amount.toString().replace(".", ",")
      setFormattedAmount(formattedValue)
      setAmount(editingTransaction.amount.toString())

      setType(editingTransaction.type)
      setDate(new Date(editingTransaction.date).toISOString().split("T")[0])
      setId(editingTransaction.id)
    } else {
      resetForm()
    }
  }, [editingTransaction])

  const resetForm = () => {
    setDescription("")
    setAmount("")
    setFormattedAmount("")
    setType("income")
    setDate(new Date().toISOString().split("T")[0])
    setId("")
    setErrors({})
  }

  // Manipular mudanças no campo de valor
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Permitir apenas números, vírgula e ponto
    const cleanValue = inputValue.replace(/[^\d,.]/g, "")

    // Atualizar o valor formatado para exibição
    setFormattedAmount(cleanValue)

    // Converter para número apenas quando necessário (ao salvar)
    if (cleanValue) {
      // Converter para formato que pode ser parseado para número
      const numericValue = cleanValue.replace(/\./g, "").replace(",", ".")
      setAmount(numericValue)
    } else {
      setAmount("")
    }
  }

  const validateForm = (): boolean => {
    const newErrors: {
      description?: string
      amount?: string
      date?: string
    } = {}

    if (!description.trim()) {
      newErrors.description = "A descrição é obrigatória"
    }

    if (!amount) {
      newErrors.amount = "O valor é obrigatório"
    } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Informe um valor válido maior que zero"
    }

    if (!date) {
      newErrors.date = "A data é obrigatória"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Erro ao salvar",
        description: "Por favor, corrija os campos destacados.",
        variant: "destructive",
        duration: 2000, // 2 segundos
      })
      return
    }

    const transaction: Transaction = {
      id: id || uuidv4(),
      description,
      amount: Number.parseFloat(amount),
      type,
      date: new Date(date).toISOString(),
      createdAt: id ? new Date(editingTransaction!.createdAt).toISOString() : new Date().toISOString(),
    }

    onAddTransaction(transaction)

    // Mostrar mensagem de sucesso
    toast({
      title: editingTransaction ? "Lançamento atualizado" : "Lançamento adicionado",
      description: editingTransaction
        ? `${description} foi atualizado com sucesso.`
        : `${description} foi adicionado com sucesso.`,
      variant: "default",
      duration: 2000, // 2 segundos
    })

    resetForm()
  }

  // Função para lidar com a mudança da data
  const handleDateChange = (value: string) => {
    setDate(value)
  }

  return (
    <Card>
      {/* Modificar o CardHeader para incluir o botão de voltar quando estiver editando */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {editingTransaction ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-amber-500" />
                Editar Lançamento
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Novo Lançamento
              </>
            )}
          </CardTitle>
          {editingTransaction && (
            <Button variant="ghost" size="icon" onClick={onCancelEdit} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Voltar</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} id="transaction-form" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <RadioGroup
              id="type"
              value={type}
              onValueChange={(value) => setType(value as TransactionType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">
                  Entrada
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">
                  Saída
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className={errors.description ? "text-red-500" : ""}>
              Descrição {errors.description && <span className="text-xs">({errors.description})</span>}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Aluguel, etc."
              className={errors.description ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className={errors.amount ? "text-red-500" : ""}>
              Valor (R$) {errors.amount && <span className="text-xs">({errors.amount})</span>}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <Input
                id="amount"
                value={formattedAmount}
                onChange={handleAmountChange}
                placeholder="0,00"
                className={`pl-10 ${errors.amount ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                inputMode="decimal"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Digite o valor usando vírgula como separador decimal (ex: 1000,00)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className={errors.date ? "text-red-500" : ""}>
              Data {errors.date && <span className="text-xs">({errors.date})</span>}
            </Label>
            <DateInput
              id="date"
              value={date}
              onChange={handleDateChange}
              className={errors.date ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
          </div>
        </form>
      </CardContent>
      {/* Modificar o CardFooter para tornar o botão Cancelar mais visível */}
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-2">
        {editingTransaction && (
          <Button variant="outline" onClick={onCancelEdit} className="w-full sm:w-auto order-2 sm:order-1">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          form="transaction-form"
          className={`w-full sm:w-auto order-1 sm:order-2 ${editingTransaction ? "bg-amber-500 hover:bg-amber-600" : ""}`}
        >
          {editingTransaction ? "Atualizar" : "Adicionar"}
        </Button>
      </CardFooter>
    </Card>
  )
}
