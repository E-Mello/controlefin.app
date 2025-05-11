// Path: components/transaction-list.tsx

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
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
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => void
  onEdit: (transaction: Transaction) => void
  activeTab: string
}

export default function TransactionList({ transactions, onDelete, onEdit, activeTab }: TransactionListProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())
  const [monthFilter, setMonthFilter] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, "0"))
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [sortColumn, setSortColumn] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [activeTypeTab, setActiveTypeTab] = useState<string>("all")
  const [prevActiveTab, setPrevActiveTab] = useState<string>(activeTab)

  // Resetar para o mês atual quando o usuário navegar para a tab
  useEffect(() => {
    // Verificar se o usuário acabou de navegar para a tab Livro Caixa
    if (activeTab === "list" && prevActiveTab !== "list") {
      resetToCurrentMonth()
    }

    // Atualizar o estado anterior
    setPrevActiveTab(activeTab)
  }, [activeTab, prevActiveTab])

  // Inicializar com o mês atual ao carregar o componente
  useEffect(() => {
    resetToCurrentMonth()
  }, [])

  // Modificar a função resetToCurrentMonth para garantir que o ano atual seja selecionado e exibido
  // e adicionar um toast para informar o usuário sobre a mudança

  // Localizar a função resetToCurrentMonth e substituí-la por:
  const resetToCurrentMonth = () => {
    const now = new Date()
    const currentYear = now.getFullYear().toString()
    const currentMonth = (now.getMonth() + 1).toString().padStart(2, "0")

    setYearFilter(currentYear)
    setMonthFilter(currentMonth)
    setTypeFilter("all")
    setActiveTypeTab("all")
    setSearch("")

    // Definir o intervalo de datas para o mês atual
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setStartDate(firstDayOfMonth.toISOString().split("T")[0])
    setEndDate(lastDayOfMonth.toISOString().split("T")[0])

    // Mostrar toast informando o usuário
    const monthNames = [
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
    ]

    toast({
      title: "Filtros atualizados",
      description: `Exibindo lançamentos de ${monthNames[now.getMonth()]} de ${currentYear}.`,
      duration: 2000,
    })
  }

  // Atualizar datas quando o mês ou ano mudar
  useEffect(() => {
    if (yearFilter !== "all" && monthFilter !== "all") {
      const year = Number.parseInt(yearFilter)
      const month = Number.parseInt(monthFilter) - 1 // JavaScript months are 0-indexed

      const firstDayOfMonth = new Date(year, month, 1)
      const lastDayOfMonth = new Date(year, month + 1, 0)

      setStartDate(firstDayOfMonth.toISOString().split("T")[0])
      setEndDate(lastDayOfMonth.toISOString().split("T")[0])
    }
  }, [yearFilter, monthFilter])

  // Estado para o diálogo de confirmação de exclusão
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null)

  // Função para confirmar exclusão
  const confirmDelete = (transaction: Transaction) => {
    setTransactionToDelete(transaction)
    setDeleteDialogOpen(true)
  }

  // Função para executar a exclusão após confirmação
  const handleDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete.id)
      toast({
        title: "Lançamento excluído",
        description: `${transactionToDelete.description} foi removido com sucesso.`,
        variant: "default",
        duration: 2000, // 2 segundos
      })
      setDeleteDialogOpen(false)
      setTransactionToDelete(null)
    }
  }

  // Função para editar transação
  const handleEdit = (transaction: Transaction) => {
    onEdit(transaction)
    toast({
      title: "Editando lançamento",
      description: "Preencha o formulário para atualizar os detalhes do lançamento.",
      variant: "default",
      duration: 2000, // 2 segundos
    })
  }

  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Obter anos disponíveis nas transações
  const availableYears = [...new Set(transactions.map((t) => new Date(t.date).getFullYear().toString()))].sort(
    (a, b) => Number.parseInt(b) - Number.parseInt(a),
  )

  // Filtrar por tipo de transação com base na aba ativa
  const getFilteredByType = (transactions: Transaction[]) => {
    if (activeTypeTab === "income") {
      return transactions.filter((t) => t.type === "income")
    } else if (activeTypeTab === "expense") {
      return transactions.filter((t) => t.type === "expense")
    } else {
      return transactions.filter((t) => (typeFilter === "all" ? true : t.type === typeFilter))
    }
  }

  const filteredTransactions = transactions
    .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => {
      // Filtro por ano
      if (yearFilter === "all") return true
      return new Date(t.date).getFullYear().toString() === yearFilter
    })
    .filter((t) => {
      // Filtro por mês
      if (monthFilter === "all") return true
      return (new Date(t.date).getMonth() + 1).toString().padStart(2, "0") === monthFilter
    })
    .filter((t) => {
      // Filtro por intervalo de datas
      if (!startDate && !endDate) return true

      const transactionDate = new Date(t.date)
      let result = true

      if (startDate) {
        const start = new Date(startDate)
        result = result && transactionDate >= start
      }

      if (endDate) {
        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999) // Incluir o dia final completo
        result = result && transactionDate <= end
      }

      return result
    })

  // Aplicar filtro por tipo após outros filtros
  const typeFilteredTransactions = getFilteredByType(filteredTransactions)

  // Modificar a lógica de ordenação para usar os estados de ordenação
  const sortedTransactions = [...typeFilteredTransactions].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1

    switch (sortColumn) {
      case "date":
        return direction * (new Date(a.date).getTime() - new Date(b.date).getTime())
      case "createdAt":
        return direction * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      case "description":
        return direction * a.description.localeCompare(b.description)
      case "type":
        return direction * a.type.localeCompare(b.type)
      case "amount":
        return direction * (a.amount - b.amount)
      default:
        return 0
    }
  })

  // Calcular totais para o resumo
  const totalIncome = typeFilteredTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = typeFilteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  // Obter nome do mês atual
  const getMonthName = (monthNumber: string) => {
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
    ]
    return monthFilter === "all" ? "Todos os meses" : months[Number.parseInt(monthNumber) - 1]
  }

  return (
    <>
      <div className="space-y-4">
        {/* Cabeçalho com título e resumo */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Livro Caixa</h2>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-400">Entradas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
              <ArrowUpCircle className="h-8 w-8 text-green-500" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-400">Saídas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-br ${balance >= 0 ? "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800" : "from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800"}`}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${balance >= 0 ? "text-blue-800 dark:text-blue-400" : "text-amber-800 dark:text-amber-400"}`}
                >
                  Saldo
                </p>
                <p className={`text-2xl font-bold ${balance >= 0 ? "text-blue-600" : "text-amber-600"}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${balance >= 0 ? "bg-blue-100 text-blue-500 dark:bg-blue-900/30" : "bg-amber-100 text-amber-500 dark:bg-amber-900/30"}`}
              >
                {balance >= 0 ? "+" : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e barra de pesquisa */}
        {/* Melhorar a responsividade dos filtros e da barra de pesquisa
        Substituir o bloco de filtros e barra de pesquisa por: */}
        <div className="flex flex-col gap-4 items-start justify-between">
          <div className="flex flex-col w-full gap-2">
            <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="income">Entradas</TabsTrigger>
                <TabsTrigger value="expense">Saídas</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap gap-2 w-full">
              <div className="w-[calc(50%-4px)] md:w-36">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger id="year-filter" className="h-9">
                    <SelectValue placeholder="Ano">{yearFilter}</SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                    <SelectItem value="all">Todos os anos</SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-[calc(50%-4px)] md:w-40">
                <Select value={monthFilter} onValueChange={setMonthFilter} disabled={yearFilter === "all"}>
                  <SelectTrigger id="month-filter" className="h-9">
                    <SelectValue placeholder="Mês">
                      {monthFilter === "all"
                        ? "Todos os meses"
                        : [
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
                          ][Number.parseInt(monthFilter) - 1]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    <SelectItem value="01">Janeiro</SelectItem>
                    <SelectItem value="02">Fevereiro</SelectItem>
                    <SelectItem value="03">Março</SelectItem>
                    <SelectItem value="04">Abril</SelectItem>
                    <SelectItem value="05">Maio</SelectItem>
                    <SelectItem value="06">Junho</SelectItem>
                    <SelectItem value="07">Julho</SelectItem>
                    <SelectItem value="08">Agosto</SelectItem>
                    <SelectItem value="09">Setembro</SelectItem>
                    <SelectItem value="10">Outubro</SelectItem>
                    <SelectItem value="11">Novembro</SelectItem>
                    <SelectItem value="12">Dezembro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={resetToCurrentMonth}
                className="h-9 w-full md:w-auto mt-1 md:mt-0"
                title="Selecionar ano e mês atuais"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Mês Atual
              </Button>
            </div>
          </div>

          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar lançamentos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
        </div>

        {/* Modificar a exibição do período selecionado para destacar o ano e mês */}
        {/* Localizar o bloco de código que exibe o período e substituí-lo por: */}
        {(yearFilter !== "all" || monthFilter !== "all") && (
          <div className="text-sm text-muted-foreground flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>
              Período: {yearFilter === "all" ? "Todos os anos" : yearFilter}
              {yearFilter !== "all" && " - "}
              {yearFilter !== "all" && getMonthName(monthFilter)}
              {yearFilter === new Date().getFullYear().toString() &&
                monthFilter === (new Date().getMonth() + 1).toString().padStart(2, "0") && (
                  <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Mês atual</span>
                )}
            </span>
          </div>
        )}

        {/* Tabela de lançamentos */}
        {/* Melhorar a responsividade da tabela de transações
        Substituir o bloco da tabela por: */}
        {sortedTransactions.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 w-[100px]"
                          onClick={() => toggleSort("date")}
                        >
                          <div className="flex items-center">
                            Data
                            <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleSort("description")}
                        >
                          <div className="flex items-center">
                            Descrição
                            <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead
                          className="cursor-pointer hover:bg-muted/50 text-right w-[100px]"
                          onClick={() => toggleSort("amount")}
                        >
                          <div className="flex items-center justify-end">
                            Valor
                            <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="w-[80px] text-center">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium text-xs md:text-sm">
                            {formatDate(transaction.date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-xs md:text-sm truncate max-w-[150px] md:max-w-none">
                                {transaction.description}
                              </span>
                              <Badge
                                variant={transaction.type === "income" ? "success" : "destructive"}
                                className="w-fit mt-1 text-xs"
                              >
                                {transaction.type === "income" ? "Entrada" : "Saída"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium text-xs md:text-sm ${
                              transaction.type === "income" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center space-x-0 md:space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(transaction)}
                                className="h-7 w-7 md:h-8 md:w-8"
                              >
                                <Pencil className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => confirmDelete(transaction)}
                                className="h-7 w-7 md:h-8 md:w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row justify-between text-xs md:text-sm text-muted-foreground py-2 px-4 border-t gap-2">
              <div>
                Total: {sortedTransactions.length} {sortedTransactions.length === 1 ? "lançamento" : "lançamentos"}
              </div>
              <div>
                Ordenado por:{" "}
                {sortColumn === "date"
                  ? "Data"
                  : sortColumn === "description"
                    ? "Descrição"
                    : sortColumn === "amount"
                      ? "Valor"
                      : "Data"}{" "}
                ({sortDirection === "asc" ? "crescente" : "decrescente"})
              </div>
            </CardFooter>
          </Card>
        ) : (
          <Card className="bg-muted/40">
            <CardContent className="flex flex-col items-center justify-center py-8 md:py-10">
              <p className="text-muted-foreground text-center mb-2 text-sm md:text-base">
                Nenhum lançamento encontrado.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground text-center mb-4">
                Tente ajustar os filtros ou adicione novos lançamentos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Diálogo de confirmação de exclusão */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" /> Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir o lançamento <strong>{transactionToDelete?.description}</strong> no valor de{" "}
              <strong>{transactionToDelete ? formatCurrency(transactionToDelete.amount) : ""}</strong>.
              <br />
              <br />
              Esta ação não pode ser desfeita. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
