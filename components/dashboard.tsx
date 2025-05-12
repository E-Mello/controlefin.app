// Path: components/dashboard.tsx

"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TransactionForm from "./transaction-form";
import TransactionList from "./transaction-list";
import Reports from "./reports";
import Summary from "./summary";
import { Conta } from "@/types/contas";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Conta[]>([]);

  // Carregar transações do localStorage ao iniciar
  useEffect(() => {
    const savedTransactions = localStorage.getItem("transactions");
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Salvar transações no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Conta) => {
    setTransactions([...transactions, transaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <Summary transactions={transactions} />

      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="add">Adicionar</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
          />
        </TabsContent>

        <TabsContent value="add">
          <TransactionForm onAddTransaction={addTransaction} />
        </TabsContent>

        <TabsContent value="reports">
          <Reports transactions={transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
