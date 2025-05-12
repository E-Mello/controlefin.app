// Path: app/responsive-page.tsx

"use client";

import { getContas, deleteConta } from "@/actions/contas";
import TransactionList from "@/components/transaction-list";
import TransactionForm from "@/components/transaction-form";
import Reports from "@/components/reports";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { GetContasResponse, CreateContaResponse } from "@/types/contas";

export default function ResponsivePage() {
  const router = useRouter();

  // lista de transações
  const [transactions, setTransactions] = useState<GetContasResponse>([]);
  // transação que estamos editando (ou null pra criar nova)
  const [editingTransaction, setEditingTransaction] =
    useState<CreateContaResponse | null>(null);
  // aba ativa: "list" | "add" | "reports"
  const [tabValue, setTabValue] = useState<"list" | "add" | "reports">("list");

  // carrega no mount e sempre que tabValue volta pra list
  const fetchData = async () => {
    const dados = await getContas();
    setTransactions(dados);
  };
  useEffect(() => {
    fetchData();
  }, []);

  // excluir
  const handleDelete = async (id: string) => {
    await deleteConta(id);
    await fetchData();
    router.refresh();
  };

  // editar: seta a transação e vai para aba "add"
  const handleEdit = (tx: CreateContaResponse) => {
    setEditingTransaction(tx);
    setTabValue("add");
  };

  // callback ao criar ou atualizar: limpa edição e volta pra list
  const handleAddOrEdit = async () => {
    await fetchData();
    setEditingTransaction(null);
    setTabValue("list");
    router.refresh();
  };

  // cancelar edição volta pra list
  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setTabValue("list");
  };

  // handler to ensure value is of correct type
  const handleTabValueChange = (value: string) => {
    if (value === "list" || value === "add" || value === "reports") {
      setTabValue(value);
    }
  };

  return (
    <main className="container mx-auto px-3 py-3 md:p-6">
      <Tabs
        value={tabValue}
        onValueChange={handleTabValueChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Livro Caixa</TabsTrigger>
          <TabsTrigger value="add">
            {editingTransaction ? "Editar" : "Novo"}
          </TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            onEdit={handleEdit}
            activeTab="list"
          />
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <TransactionForm
            onAddTransaction={handleAddOrEdit}
            editingTransaction={editingTransaction}
            onCancelEdit={handleCancelEdit}
          />
        </TabsContent>

        <TabsContent value="reports" className="mt-4">
          <Reports transactions={transactions} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
