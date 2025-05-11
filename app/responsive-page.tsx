"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TransactionForm from "@/components/transaction-form"
import TransactionList from "@/components/transaction-list"
import Reports from "@/components/reports"
import { generateMockData } from "@/lib/mock-data"
import { Toaster } from "@/components/ui/toaster"
import type { Transaction } from "@/lib/types"

export default function ResponsivePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [activeTab, setActiveTab] = useState("list")

  // Carregar transações do localStorage ao iniciar
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions")
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    } else {
      // Adicionar dados de exemplo
      const mockData = generateMockData()
      setTransactions(mockData)
      localStorage.setItem("transactions", JSON.stringify(mockData))
    }
  }, [])

  // Salvar transações no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions))
  }, [transactions])

  const addTransaction = (transaction: Transaction) => {
    if (editingTransaction) {
      // Atualizar transação existente
      setTransactions(
        transactions.map((t) => (t.id === transaction.id ? { ...transaction, createdAt: t.createdAt } : t)),
      )
      setEditingTransaction(null)
    } else {
      // Adicionar nova transação
      setTransactions([...transactions, transaction])
    }

    // Voltar para a aba de listagem após salvar
    setActiveTab("list")
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
    if (editingTransaction && editingTransaction.id === id) {
      setEditingTransaction(null)
    }
  }

  const editTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setActiveTab("add")
  }

  return (
    <main className="container mx-auto px-3 py-3 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Livro Caixa</TabsTrigger>
          <TabsTrigger value="add">{editingTransaction ? "Editar" : "Novo"}</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
            onEdit={editTransaction}
            activeTab={activeTab}
          />
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <TransactionForm
            onAddTransaction={addTransaction}
            editingTransaction={editingTransaction}
            onCancelEdit={() => {
              setEditingTransaction(null)
              setActiveTab("list")
            }}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Reports transactions={transactions} />
        </TabsContent>
      </Tabs>

      <Toaster />
    </main>
  )
}
