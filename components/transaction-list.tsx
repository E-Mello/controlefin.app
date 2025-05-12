// Path: components/transaction-list.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Pencil,
  Trash2,
  AlertCircle,
  Search,
  ArrowDownUp,
  ArrowUpCircle,
  ArrowDownCircle,
  BookOpen,
  Calendar,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import { Conta } from "@/types/contas";

interface TransactionListProps {
  transactions: Conta[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Conta) => void;
  activeTab: string;
}

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
  activeTab,
}: TransactionListProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "A Receber" | "A Pagar">(
    "all"
  );
  const [yearFilter, setYearFilter] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [monthFilter, setMonthFilter] = useState<string>(
    (new Date().getMonth() + 1).toString().padStart(2, "0")
  );
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<
    "vencimento" | "emissao" | "descricao" | "tipo" | "valor"
  >("vencimento");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeTypeTab, setActiveTypeTab] = useState<
    "all" | "income" | "expense"
  >("all");
  const [prevActiveTab, setPrevActiveTab] = useState<string>(activeTab);

  // Reset to current month on tab change
  useEffect(() => {
    if (activeTab === "list" && prevActiveTab !== "list") {
      resetToCurrentMonth();
    }
    setPrevActiveTab(activeTab);
  }, [activeTab, prevActiveTab]);

  // Initialize filters on mount
  useEffect(() => {
    resetToCurrentMonth();
  }, []);

  const resetToCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear().toString();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    setYearFilter(y);
    setMonthFilter(m);
    setTypeFilter("all");
    setActiveTypeTab("all");
    setSearch("");
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(first.toISOString().split("T")[0]);
    setEndDate(last.toISOString().split("T")[0]);
    const months = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    toast({
      title: "Filtros atualizados",
      description: `Exibindo lançamentos de ${months[now.getMonth()]} de ${y}.`,
      duration: 2000,
    });
  };

  // Update date range when year/month change
  useEffect(() => {
    if (yearFilter !== "all" && monthFilter !== "all") {
      const yy = parseInt(yearFilter);
      const mm = parseInt(monthFilter) - 1;
      const first = new Date(yy, mm, 1);
      const last = new Date(yy, mm + 1, 0);
      setStartDate(first.toISOString().split("T")[0]);
      setEndDate(last.toISOString().split("T")[0]);
    }
  }, [yearFilter, monthFilter]);

  // Deletion dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Conta | null>(null);

  const confirmDelete = (tx: Conta) => {
    setToDelete(tx);
    setDeleteDialogOpen(true);
  };
  const handleDelete = () => {
    if (toDelete) {
      onDelete(toDelete.id);
      toast({
        title: "Lançamento excluído",
        description: `${toDelete.descricao} removido.`,
        variant: "default",
        duration: 2000,
      });
      setDeleteDialogOpen(false);
      setToDelete(null);
    }
  };

  const handleEdit = (tx: Conta) => {
    onEdit(tx);
    toast({
      title: "Editando lançamento",
      description: "Atualize os detalhes no formulário.",
      variant: "default",
      duration: 2000,
    });
  };

  const toggleSort = (col: typeof sortColumn) => {
    if (sortColumn === col) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Available years
  const availableYears = Array.from(
    new Set(
      transactions.map((t) =>
        new Date(t.data_vencimento).getFullYear().toString()
      )
    )
  ).sort((a, b) => parseInt(b) - parseInt(a));

  // Filter by type tab
  const filterByTab = (arr: Conta[]) => {
    if (activeTypeTab === "income")
      return arr.filter((t) => t.tipo === "A Receber");
    if (activeTypeTab === "expense")
      return arr.filter((t) => t.tipo === "A Pagar");
    return arr.filter((t) =>
      typeFilter === "all" ? true : t.tipo === typeFilter
    );
  };

  // Combined filters
  const filtered = filterByTab(
    transactions
      .filter((t) => t.descricao.toLowerCase().includes(search.toLowerCase()))
      .filter((t) =>
        yearFilter === "all"
          ? true
          : new Date(t.data_vencimento).getFullYear().toString() === yearFilter
      )
      .filter((t) =>
        monthFilter === "all"
          ? true
          : (new Date(t.data_vencimento).getMonth() + 1)
              .toString()
              .padStart(2, "0") === monthFilter
      )
      .filter((t) => {
        const dt = new Date(t.data_vencimento);
        let ok = true;
        if (startDate) ok = ok && dt >= new Date(startDate);
        if (endDate) {
          const e = new Date(endDate);
          e.setHours(23, 59, 59, 999);
          ok = ok && dt <= e;
        }
        return ok;
      })
  );

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    switch (sortColumn) {
      case "vencimento":
        return (
          dir *
          (new Date(a.data_vencimento).getTime() -
            new Date(b.data_vencimento).getTime())
        );
      case "emissao":
        return (
          dir *
          (new Date(a.data_emissao).getTime() -
            new Date(b.data_emissao).getTime())
        );
      case "descricao":
        return dir * a.descricao.localeCompare(b.descricao);
      case "tipo":
        return dir * a.tipo.localeCompare(b.tipo);
      case "valor":
        return dir * (a.valor - b.valor);
    }
  });

  // Totals
  const totalIn = sorted
    .filter((t) => t.tipo === "A Receber")
    .reduce((s, t) => s + t.valor, 0);
  const totalOut = sorted
    .filter((t) => t.tipo === "A Pagar")
    .reduce((s, t) => s + t.valor, 0);
  const balance = totalIn - totalOut;

  const getMonthName = (m: string) => {
    const ms = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    return m === "all" ? "Todos" : ms[parseInt(m) - 1];
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Livro Caixa</h2>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIn)}
                </p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800">Saídas</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOut)}
                </p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>
          <Card
            className={balance >= 0 ? "border-blue-200" : "border-amber-200"}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    balance >= 0 ? "text-blue-800" : "text-amber-800"
                  }`}
                >
                  Saldo
                </p>
                <p
                  className={`text-2xl font-bold ${
                    balance >= 0 ? "text-blue-600" : "text-amber-600"
                  }`}
                >
                  {formatCurrency(balance)}
                </p>
              </div>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  balance >= 0 ? "bg-blue-100" : "bg-amber-100"
                }`}
              >
                {balance >= 0 ? "+" : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <Tabs
            value={activeTypeTab}
            onValueChange={setActiveTypeTab}
            className="w-full md:w-1/3"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="income">Entradas</TabsTrigger>
              <TabsTrigger value="expense">Saídas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="h-9 w-24">
                <SelectValue>{yearFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableYears.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={monthFilter}
              onValueChange={setMonthFilter}
              disabled={yearFilter === "all"}
            >
              <SelectTrigger className="h-9 w-24">
                <SelectValue>{getMonthName(monthFilter)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                  const mm = m.toString().padStart(2, "0");
                  return (
                    <SelectItem key={mm} value={mm}>
                      {getMonthName(mm)}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={resetToCurrentMonth}
              className="h-9"
            >
              <Calendar className="h-4 w-4 mr-1" /> Mês Atual
            </Button>
          </div>

          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Period display */}
        {(yearFilter !== "all" || monthFilter !== "all") && (
          <p className="text-sm text-muted-foreground">
            Período: {yearFilter === "all" ? "Todos anos" : yearFilter}
            {yearFilter !== "all" && ` - ${getMonthName(monthFilter)}`}
          </p>
        )}

        {/* Table */}
        {sorted.length > 0 ? (
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => toggleSort("vencimento")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Vencimento
                        <ArrowDownUp className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("emissao")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Emissão
                        <ArrowDownUp className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("descricao")}
                      className="cursor-pointer"
                    >
                      Descrição
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("valor")}
                      className="cursor-pointer text-right"
                    >
                      Valor
                    </TableHead>
                    <TableHead className="text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="font-medium">
                        {formatDate(tx.data_vencimento)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatDate(tx.data_emissao)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="truncate max-w-xs">
                            {tx.descricao}
                          </span>
                          <Badge
                            variant={
                              tx.tipo === "A Receber"
                                ? "success"
                                : "destructive"
                            }
                            className="mt-1"
                          >
                            {tx.tipo === "A Receber" ? "Entrada" : "Saída"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          tx.tipo === "A Receber"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.tipo === "A Receber" ? "+" : "-"}{" "}
                        {formatCurrency(tx.valor)}
                      </TableCell>
                      <TableCell className="flex justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(tx)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(tx)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between text-sm text-muted-foreground">
              <span>
                Total: {sorted.length} lançamento{sorted.length !== 1 && "s"}
              </span>
              <span>Saldo: {formatCurrency(balance)}</span>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-muted/40">
            <CardContent className="py-10 text-center text-muted-foreground">
              Nenhum lançamento encontrado.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Excluir <strong>{toDelete?.descricao}</strong> (
              {formatCurrency(toDelete?.valor || 0)})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
