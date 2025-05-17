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
import { toast } from "sonner";
import { Conta } from "@/types/contas";
import { formatCurrency } from "@/lib/utils";

type FiltroTipo = "Todas" | "A Receber" | "A Pagar";

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
  const [activeTypeTab, setActiveTypeTab] = useState<FiltroTipo>("Todas");
  const [prevActiveTab, setPrevActiveTab] = useState<string>(activeTab);

  // Define qual propriedade usar para filtro/ordenação de data
  const dateKey = sortColumn === "emissao" ? "data_emissao" : "data_vencimento";

  // Função para formatar "YYYY-MM-DD" em "DD/MM/YYYY" sem fuso
  // no topo do arquivo, em vez da versão antiga:
  const formatISOtoBR = (iso: string) => {
    // pega só a parte da data (antes do 'T')
    const dateOnly = iso.split("T")[0];
    const [year, month, day] = dateOnly.split("-");
    return `${day}/${month}/${year}`;
  };

  // Reseta filtros para o mês corrente
  const resetToCurrentMonth = () => {
    const now = new Date();
    const y = now.getFullYear().toString();
    const m = (now.getMonth() + 1).toString().padStart(2, "0");
    setYearFilter(y);
    setMonthFilter(m);
    setActiveTypeTab("Todas");
    setSearch("");
    const first = `${y}-${m}-01`;
    const lastDay = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();
    const last = `${y}-${m}-${lastDay.toString().padStart(2, "0")}`;
    setStartDate(first);
    setEndDate(last);

    const meses = [
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
    toast(`Exibindo lançamentos de ${meses[now.getMonth()]} de ${y}.`);
  };

  // Efeitos de inicialização e troca de aba
  useEffect(() => {
    resetToCurrentMonth();
  }, []);

  useEffect(() => {
    if (activeTab === "list" && prevActiveTab !== "list") {
      resetToCurrentMonth();
    }
    setPrevActiveTab(activeTab);
  }, [activeTab, prevActiveTab]);

  // Atualiza intervalo sempre que ano ou mês mudam
  useEffect(() => {
    if (yearFilter !== "all" && monthFilter !== "all") {
      const first = `${yearFilter}-${monthFilter}-01`;
      const lastDay = new Date(
        parseInt(yearFilter),
        parseInt(monthFilter),
        0
      ).getDate();
      const last = `${yearFilter}-${monthFilter}-${lastDay
        .toString()
        .padStart(2, "0")}`;
      setStartDate(first);
      setEndDate(last);
    }
  }, [yearFilter, monthFilter]);

  // Exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Conta | null>(null);

  const confirmDelete = (tx: Conta) => {
    setToDelete(tx);
    setDeleteDialogOpen(true);
  };
  const handleDelete = () => {
    if (toDelete) {
      onDelete(toDelete.id);
      toast(`${toDelete.descricao} removido.`);
      setDeleteDialogOpen(false);
      setToDelete(null);
    }
  };

  // Edição
  const handleEdit = (tx: Conta) => {
    onEdit(tx);
    toast("Atualize os detalhes no formulário.");
  };

  // Controle de ordenação
  const toggleSort = (col: typeof sortColumn) => {
    if (sortColumn === col) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("asc");
    }
  };

  // Calcula anos disponíveis com base na chave dinâmica
  const availableYears = Array.from(
    new Set(
      transactions.map((t) =>
        new Date((t as any)[dateKey]).getFullYear().toString()
      )
    )
  ).sort((a, b) => parseInt(b) - parseInt(a));

  // Filtra por tipo
  const filterByTab = (arr: Conta[]) => {
    if (activeTypeTab === "A Receber")
      return arr.filter((t) => t.tipo === "A Receber");
    if (activeTypeTab === "A Pagar")
      return arr.filter((t) => t.tipo === "A Pagar");
    return arr;
  };

  // Aplica todos os filtros (busca, ano, mês, intervalo)
  const filtered = filterByTab(
    transactions
      .filter((t) => t.descricao.toLowerCase().includes(search.toLowerCase()))
      .filter((t) =>
        yearFilter === "all"
          ? true
          : new Date((t as any)[dateKey]).getFullYear().toString() ===
            yearFilter
      )
      .filter((t) =>
        monthFilter === "all"
          ? true
          : (new Date((t as any)[dateKey]).getMonth() + 1)
              .toString()
              .padStart(2, "0") === monthFilter
      )
      .filter((t) => {
        const dt = new Date((t as any)[dateKey]);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return dt >= start && dt <= end;
      })
  );

  // Ordena de acordo com a coluna selecionada
  const sorted = [...filtered].sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    if (sortColumn === "vencimento" || sortColumn === "emissao") {
      const ta = new Date((a as any)[dateKey]).getTime();
      const tb = new Date((b as any)[dateKey]).getTime();
      return dir * (ta - tb);
    }
    if (sortColumn === "descricao")
      return dir * a.descricao.localeCompare(b.descricao);
    if (sortColumn === "tipo") return dir * a.tipo.localeCompare(b.tipo);
    if (sortColumn === "valor") return dir * (a.valor - b.valor);
    return 0;
  });

  // Totais
  const totalIn = sorted
    .filter((t) => t.tipo === "A Receber")
    .reduce((sum, t) => sum + t.valor, 0);
  const totalOut = sorted
    .filter((t) => t.tipo === "A Pagar")
    .reduce((sum, t) => sum + t.valor, 0);
  const balance = totalIn - totalOut;

  // Nome curto de meses para o select
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
    return m === "all" ? "Todas" : ms[parseInt(m) - 1];
  };

  return (
    <>
      <div className="space-y-4">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Livro Caixa</h2>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-800">Entradas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIn)}
                </p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-800">Saídas</p>
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
            <CardContent className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm ${
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

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <Tabs
            value={activeTypeTab}
            onValueChange={(v) => setActiveTypeTab(v as FiltroTipo)}
            className="w-full md:w-1/3"
          >
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="Todas">Todas</TabsTrigger>
              <TabsTrigger value="A Receber">Entradas</TabsTrigger>
              <TabsTrigger value="A Pagar">Saídas</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-24 h-9">
                <SelectValue>{yearFilter}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
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
              <SelectTrigger className="w-24 h-9">
                <SelectValue>{getMonthName(monthFilter)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Array.from({ length: 12 }, (_, i) =>
                  (i + 1).toString().padStart(2, "0")
                ).map((m) => (
                  <SelectItem key={m} value={m}>
                    {getMonthName(m)}
                  </SelectItem>
                ))}
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

        {/* Tabela */}
        {sorted.length > 0 ? (
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      onClick={() => toggleSort("vencimento")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Vencimento <ArrowDownUp className="ml-1 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead
                      onClick={() => toggleSort("emissao")}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center">
                        Emissão <ArrowDownUp className="ml-1 h-3 w-3" />
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
                        {formatISOtoBR(tx.data_vencimento)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatISOtoBR(tx.data_emissao)}
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

      {/* Confirmação de exclusão */}
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
