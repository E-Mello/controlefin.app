// Path: app/responsive-page.tsx

"use client";

import { getContas, deleteConta } from "@/actions/contas";
import TransactionList from "@/components/transaction-list";
import TransactionForm from "@/components/transaction-form";
import Reports from "@/components/reports";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { GetContasResponse } from "@/types/contas";

export default function ResponsivePage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<GetContasResponse>([]);

  // Busca inicial de transações do backend
  useEffect(() => {
    getContas().then(setTransactions);
  }, []);

  // Callback para exclusão
  const handleDelete = async (id: string) => {
    await deleteConta(id);
    // Recarrega os dados do servidor
    const updated = await getContas();
    setTransactions(updated);
    router.refresh();
  };

  // Callback para criação/edição
  const handleAddOrEdit = async () => {
    const updated = await getContas();
    setTransactions(updated);
    router.refresh();
  };

  return (
    <main className="container mx-auto px-3 py-3 md:p-6">
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Livro Caixa</TabsTrigger>
          <TabsTrigger value="add">Novo</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={() => {
              /* se quiser navegar para aba “add” com dados de edição,
                 pode setar um estado `editingTransaction` aqui */
              router.refresh();
            }}
            activeTab="list"
          />
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <TransactionForm
            onAddTransaction={handleAddOrEdit}
            editingTransaction={null}
            onCancelEdit={handleAddOrEdit}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Reports transactions={transactions} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
