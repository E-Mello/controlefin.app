"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { FileSpreadsheet, FileText, Filter } from "lucide-react"
import * as XLSX from "xlsx"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import ReportSummaryRow from "./reports-summary-row"
import ReportDetailSection from "./reports-detail-section"
import DateInput from "./date-input"

interface ReportsProps {
  transactions: Transaction[]
}

export default function Reports({ transactions }: ReportsProps) {
  const [reportType, setReportType] = useState<string>("monthly")

  // Inicializar filtros com o mês atual
  const [yearFilter, setYearFilter] = useState<string>(new Date().getFullYear().toString())
  const [monthFilter, setMonthFilter] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, "0"))
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [sortColumn, setSortColumn] = useState<string>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)

  // Adicione este useEffect logo após as declarações de estado
  useEffect(() => {
    // Definir o intervalo de datas para o mês atual
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    setStartDate(firstDayOfMonth.toISOString().split("T")[0])
    setEndDate(lastDayOfMonth.toISOString().split("T")[0])
  }, [])

  // Obter anos disponíveis nas transações
  const availableYears = [...new Set(transactions.map((t) => new Date(t.date).getFullYear().toString()))].sort(
    (a, b) => Number.parseInt(b) - Number.parseInt(a),
  )

  // Se não houver anos nas transações, adicionar o ano atual
  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear().toString())
  }

  // Filtrar transações por ano
  const getTransactionsByYear = () => {
    return transactions.filter((t) => new Date(t.date).getFullYear().toString() === yearFilter)
  }

  // Filtrar transações por mês e ano
  const getTransactionsByMonth = () => {
    return transactions.filter((t) => {
      const date = new Date(t.date)
      return (
        date.getFullYear().toString() === yearFilter &&
        (date.getMonth() + 1).toString().padStart(2, "0") === monthFilter
      )
    })
  }

  // Filtrar transações por intervalo de datas
  const getTransactionsByDateRange = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // Incluir o dia final completo

    return transactions.filter((t) => {
      const date = new Date(t.date)
      return date >= start && date <= end
    })
  }

  // Preparar dados para gráfico anual
  const prepareYearlyChartData = () => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

    const yearlyData = months.map((month, index) => {
      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date)
        return date.getFullYear().toString() === yearFilter && date.getMonth() === index
      })

      const income = monthTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

      const expense = monthTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

      return {
        name: month,
        entrada: income,
        saida: expense,
        saldo: income - expense,
      }
    })

    return yearlyData
  }

  // Preparar dados para gráfico de detalhamento mensal
  const prepareMonthlyDetailChartData = () => {
    const monthlyTransactions = getTransactionsByMonth()

    // Agrupar por tipo (entrada/saída)
    const incomeTotal = monthlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

    const expenseTotal = monthlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

    return [
      { name: "A Receber", valor: incomeTotal },
      { name: "A Pagar", valor: expenseTotal },
    ]
  }

  // Preparar dados para gráfico de detalhamento por período
  const prepareDateRangeDetailChartData = () => {
    const rangeTransactions = getTransactionsByDateRange()

    // Agrupar por tipo (entrada/saída)
    const incomeTotal = rangeTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)

    const expenseTotal = rangeTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)

    return [
      { name: "A Receber", valor: incomeTotal },
      { name: "A Pagar", valor: expenseTotal },
    ]
  }

  const yearlyTransactions = getTransactionsByYear()
  const monthlyTransactions = getTransactionsByMonth()
  const dateRangeTransactions = getTransactionsByDateRange()

  // Adicionar função para alternar ordenação
  const toggleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Função para ordenar transações
  const sortTransactions = (transactions: Transaction[]) => {
    return [...transactions].sort((a, b) => {
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
  }

  // Aplicar ordenação aos conjuntos de dados
  const sortedYearlyTransactions = sortTransactions(yearlyTransactions)
  const sortedMonthlyTransactions = sortTransactions(monthlyTransactions)
  const sortedDateRangeTransactions = sortTransactions(dateRangeTransactions)

  // Função para formatar valores com sinal e cor para PDF
  const formatValueWithSignAndColor = (doc: jsPDF, value: number, x: number, y: number) => {
    const formattedValue = formatCurrency(Math.abs(value))
    const prefix = value >= 0 ? "+" : "-"

    if (value >= 0) {
      doc.setTextColor(16, 185, 129) // Verde (#10b981)
      doc.text(`${prefix} ${formattedValue}`, x, y)
    } else {
      doc.setTextColor(239, 68, 68) // Vermelho (#ef4444)
      doc.text(`${prefix} ${formattedValue}`, x, y)
    }

    // Resetar a cor para preto
    doc.setTextColor(0, 0, 0)
  }

  // Exportar para Excel - Relatório Anual
  const exportYearlyToExcel = () => {
    // Preparar dados para exportação
    const exportData = sortedYearlyTransactions.map((t) => ({
      "Data Emissão": formatDate(t.createdAt),
      "Data Vencimento": formatDate(t.date),
      Descrição: t.description,
      Tipo: t.type === "income" ? "A Receber" : "A Pagar",
      Valor: t.type === "income" ? `+ ${formatCurrency(t.amount)}` : `- ${formatCurrency(t.amount)}`,
    }))

    // Adicionar resumo
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "--- RESUMO ---",
      Tipo: "",
      Valor: "",
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Total a Receber",
      Tipo: "",
      Valor: `+ ${formatCurrency(yearlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0))}`,
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Total a Pagar",
      Tipo: "",
      Valor: `- ${formatCurrency(yearlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0))}`,
    })

    const balance = yearlyTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Saldo",
      Tipo: "",
      Valor: balance >= 0 ? `+ ${formatCurrency(balance)}` : `- ${formatCurrency(Math.abs(balance))}`,
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: `Relatório Anual - ${yearFilter}`,
      Tipo: "",
      Valor: "",
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "",
      Tipo: "",
      Valor: "",
    })

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório Anual")

    // Gerar arquivo e download
    XLSX.writeFile(workbook, `relatorio-anual-${yearFilter}.xlsx`)
  }

  // Exportar para PDF - Relatório Anual
  const exportYearlyToPDF = () => {
    // Criar documento PDF no formato A4
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15 // Margem em mm
    const contentWidth = pageWidth - margin * 2

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

    // Função para verificar se precisa de nova página
    const checkForNewPage = (currentY: number, neededSpace: number): number => {
      if (currentY + neededSpace > pageHeight - margin) {
        doc.addPage()
        return margin + 10 // Retorna a posição Y inicial na nova página
      }
      return currentY
    }

    // Título
    doc.setFontSize(18)
    doc.setFont("helvetica", "bold")
    doc.text(`Relatório Anual - ${yearFilter}`, margin, margin + 5)

    let yPosition = margin + 15

    // Adicionar resumo
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    // Total a Receber (verde)
    const incomeTotal = yearlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
    doc.text("Total a Receber:", margin, yPosition)
    doc.setTextColor(16, 185, 129) // Verde (#10b981)
    doc.text(`+ ${formatCurrency(incomeTotal)}`, margin + 45, yPosition)

    yPosition += 8

    // Total a Pagar (vermelho)
    doc.setTextColor(0, 0, 0) // Resetar para preto
    doc.text("Total a Pagar:", margin, yPosition)
    doc.setTextColor(239, 68, 68) // Vermelho (#ef4444)
    const expenseTotal = yearlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)
    doc.text(`- ${formatCurrency(expenseTotal)}`, margin + 45, yPosition)

    yPosition += 8

    // Saldo (verde ou vermelho dependendo do valor)
    const balance = yearlyTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
    doc.setTextColor(0, 0, 0) // Resetar para preto
    doc.text("Saldo:", margin, yPosition)

    if (balance >= 0) {
      doc.setTextColor(16, 185, 129) // Verde
      doc.text(`+ ${formatCurrency(balance)}`, margin + 45, yPosition)
    } else {
      doc.setTextColor(239, 68, 68) // Vermelho
      doc.text(`- ${formatCurrency(Math.abs(balance))}`, margin + 45, yPosition)
    }

    yPosition += 15
    doc.setTextColor(0, 0, 0) // Resetar para preto

    // Agrupar transações por mês
    const transactionsByMonth: { [key: string]: Transaction[] } = {}

    // Inicializar todos os meses para garantir que apareçam mesmo vazios
    months.forEach((_, index) => {
      transactionsByMonth[index.toString().padStart(2, "0")] = []
    })

    // Preencher com as transações
    sortedYearlyTransactions.forEach((transaction) => {
      const month = new Date(transaction.date).getMonth().toString().padStart(2, "0")
      if (!transactionsByMonth[month]) {
        transactionsByMonth[month] = []
      }
      transactionsByMonth[month].push(transaction)
    })

    // Para cada mês, adicionar uma seção no PDF
    Object.keys(transactionsByMonth)
      .sort()
      .forEach((monthIndex) => {
        const monthTransactions = transactionsByMonth[monthIndex]
        if (monthTransactions.length === 0) return // Pular meses sem transações

        const monthName = months[Number.parseInt(monthIndex)]

        // Verificar se há espaço para o cabeçalho do mês e o resumo (pelo menos 30mm)
        yPosition = checkForNewPage(yPosition, 30)

        // Adicionar cabeçalho do mês
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text(`${monthName}`, margin, yPosition)
        yPosition += 8

        // Calcular totais do mês
        const monthlyIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
        const monthlyExpense = monthTransactions
          .filter((t) => t.type === "expense")
          .reduce((sum, t) => sum + t.amount, 0)
        const monthlyBalance = monthlyIncome - monthlyExpense

        // Adicionar resumo do mês com layout responsivo
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")

        // Recebimentos (verde)
        doc.text("Recebimentos:", margin, yPosition)
        doc.setTextColor(16, 185, 129) // Verde
        doc.text(`+ ${formatCurrency(monthlyIncome)}`, margin + 30, yPosition)

        // Pagamentos (vermelho) - posicionado à direita dos recebimentos
        const pagamentosX = Math.min(pageWidth - 75, margin + 80) // Garantir que não ultrapasse a largura da página
        doc.setTextColor(0, 0, 0) // Preto
        doc.text("Pagamentos:", pagamentosX, yPosition)
        doc.setTextColor(239, 68, 68) // Vermelho
        doc.text(`- ${formatCurrency(monthlyExpense)}`, pagamentosX + 30, yPosition)

        yPosition += 6

        // Saldo (verde ou vermelho)
        doc.setTextColor(0, 0, 0) // Preto
        doc.text("Saldo:", margin, yPosition)

        if (monthlyBalance >= 0) {
          doc.setTextColor(16, 185, 129) // Verde
          doc.text(`+ ${formatCurrency(monthlyBalance)}`, margin + 30, yPosition)
        } else {
          doc.setTextColor(239, 68, 68) // Vermelho
          doc.text(`- ${formatCurrency(Math.abs(monthlyBalance))}`, margin + 30, yPosition)
        }

        doc.setTextColor(0, 0, 0) // Resetar para preto
        yPosition += 8

        // Verificar se há transações para mostrar
        if (monthTransactions.length > 0) {
          // Preparar dados para a tabela
          const tableColumn = ["Data Emissão", "Data Vencimento", "Descrição", "Tipo", "Valor"]
          const tableRows = monthTransactions.map((t) => [
            formatDate(t.createdAt),
            formatDate(t.date),
            t.description,
            t.type === "income" ? "A Receber" : "A Pagar",
            t.type === "income"
              ? { content: `+ ${formatCurrency(t.amount)}`, styles: { textColor: [16, 185, 129] } }
              : { content: `- ${formatCurrency(t.amount)}`, styles: { textColor: [239, 68, 68] } },
          ])

          // Adicionar tabela com configurações responsivas
          // @ts-ignore - jspdf-autotable não tem tipos TS adequados
          doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: yPosition,
            theme: "grid",
            styles: {
              fontSize: 8,
              cellPadding: 2,
              overflow: "linebreak",
              lineWidth: 0.1,
            },
            headStyles: {
              fillColor: [66, 66, 66],
              fontSize: 8,
              fontStyle: "bold",
              halign: "center",
            },
            columnStyles: {
              0: { cellWidth: 25 }, // Data Emissão
              1: { cellWidth: 25 }, // Data Vencimento
              2: { cellWidth: "auto" }, // Descrição - automático
              3: { cellWidth: 20 }, // Tipo
              4: { cellWidth: 25, halign: "right" }, // Valor - alinhado à direita
            },
            margin: { left: margin, right: margin },
            tableWidth: "auto",
            didDrawPage: (data) => {
              // Adicionar cabeçalho em cada página
              if (data.pageCount > 1) {
                doc.setFontSize(10)
                doc.setFont("helvetica", "normal")
                doc.text(`Relatório Anual - ${yearFilter} - ${monthName}`, margin, 10)
              }
            },
          })

          // Atualizar a posição Y para o próximo mês
          // @ts-ignore - jspdf-autotable não tem tipos TS adequados
          yPosition = doc.lastAutoTable.finalY + 15
        } else {
          // Se não houver transações, apenas adicionar uma mensagem
          doc.setFontSize(9)
          doc.setFont("helvetica", "italic")
          doc.text("Nenhuma transação registrada neste mês.", margin, yPosition)
          yPosition += 10
        }
      })

    // Salvar o PDF
    doc.save(`relatorio-anual-${yearFilter}.pdf`)
  }

  // Exportar para Excel - Relatório Mensal
  const exportMonthlyToExcel = () => {
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
    const monthName = monthNames[Number.parseInt(monthFilter) - 1]

    // Preparar dados para exportação
    const exportData = sortedMonthlyTransactions.map((t) => ({
      "Data Emissão": formatDate(t.createdAt),
      "Data Vencimento": formatDate(t.date),
      Descrição: t.description,
      Tipo: t.type === "income" ? "A Receber" : "A Pagar",
      Valor: t.type === "income" ? `+ ${formatCurrency(t.amount)}` : `- ${formatCurrency(t.amount)}`,
    }))

    // Adicionar resumo
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "--- RESUMO ---",
      Tipo: "",
      Valor: "",
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Total a Receber",
      Tipo: "",
      Valor: `+ ${formatCurrency(monthlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0))}`,
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Total a Pagar",
      Tipo: "",
      Valor: `- ${formatCurrency(monthlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0))}`,
    })

    const balance = monthlyTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Saldo",
      Tipo: "",
      Valor: balance >= 0 ? `+ ${formatCurrency(balance)}` : `- ${formatCurrency(Math.abs(balance))}`,
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: `Relatório Mensal - ${monthName}/${yearFilter}`,
      Tipo: "",
      Valor: "",
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "",
      Tipo: "",
      Valor: "",
    })

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório Mensal")

    // Gerar arquivo e download
    XLSX.writeFile(workbook, `relatorio-mensal-${monthName}-${yearFilter}.xlsx`)
  }

  // Exportar para PDF - Relatório Mensal
  const exportMonthlyToPDF = () => {
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
    const monthName = monthNames[Number.parseInt(monthFilter) - 1]

    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Relatório Mensal - ${monthName}/${yearFilter}`, 14, 22)

    // Adicionar resumo
    doc.setFontSize(12)

    // Total a Receber (verde)
    doc.text("Total a Receber:", 14, 35)
    doc.setTextColor(16, 185, 129) // Verde (#10b981)
    doc.text(
      `+ ${formatCurrency(monthlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0))}`,
      60,
      35,
    )

    // Total a Pagar (vermelho)
    doc.setTextColor(0, 0, 0) // Resetar para preto
    doc.text("Total a Pagar:", 14, 43)
    doc.setTextColor(239, 68, 68) // Vermelho (#ef4444)
    doc.text(
      `- ${formatCurrency(monthlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0))}`,
      60,
      43,
    )

    // Saldo (verde ou vermelho dependendo do valor)
    const balance = monthlyTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
    doc.setTextColor(0, 0, 0) // Resetar para preto
    doc.text("Saldo:", 14, 51)
    formatValueWithSignAndColor(doc, balance, 60, 51)

    // Agrupar transações por dia
    const transactionsByDay: { [key: string]: Transaction[] } = {}

    sortedMonthlyTransactions.forEach((transaction) => {
      const day = new Date(transaction.date).getDate().toString().padStart(2, "0")
      if (!transactionsByDay[day]) {
        transactionsByDay[day] = []
      }
      transactionsByDay[day].push(transaction)
    })

    let yPosition = 65

    // Para cada dia, adicionar uma seção no PDF
    Object.keys(transactionsByDay)
      .sort()
      .forEach((day) => {
        const dayTransactions = transactionsByDay[day]

        // Adicionar cabeçalho do dia
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)

        // Verificar se há espaço suficiente na página
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.text(`Dia ${day}`, 14, yPosition)
        yPosition += 10

        // Calcular totais do dia
        const dailyIncome = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
        const dailyExpense = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
        const dailyBalance = dailyIncome - dailyExpense

        // Adicionar resumo do dia - MELHORADO PARA PADRONIZAÇÃO
        doc.setFontSize(10)

        // Recebimentos (verde)
        doc.text("Recebimentos:", 14, yPosition)
        doc.setTextColor(16, 185, 129) // Verde
        doc.text(`+ ${formatCurrency(dailyIncome)}`, 60, yPosition)

        yPosition += 6 // Espaçamento entre linhas

        // Pagamentos (vermelho)
        doc.setTextColor(0, 0, 0) // Preto
        doc.text("Pagamentos:", 14, yPosition)
        doc.setTextColor(239, 68, 68) // Vermelho
        doc.text(`- ${formatCurrency(dailyExpense)}`, 60, yPosition)

        yPosition += 6 // Espaçamento entre linhas

        // Saldo (verde ou vermelho)
        doc.setTextColor(0, 0, 0) // Preto
        doc.text("Saldo:", 14, yPosition)

        if (dailyBalance >= 0) {
          doc.setTextColor(16, 185, 129) // Verde
          doc.text(`+ ${formatCurrency(dailyBalance)}`, 60, yPosition)
        } else {
          doc.setTextColor(239, 68, 68) // Vermelho
          doc.text(`- ${formatCurrency(Math.abs(dailyBalance))}`, 60, yPosition)
        }

        doc.setTextColor(0, 0, 0) // Resetar para preto
        yPosition += 8

        // Preparar dados para a tabela
        const tableColumn = ["Data Emissão", "Descrição", "Tipo", "Valor"]
        const tableRows = dayTransactions.map((t) => [
          formatDate(t.createdAt),
          t.description,
          t.type === "income" ? "A Receber" : "A Pagar",
          t.type === "income"
            ? { content: `+ ${formatCurrency(t.amount)}`, styles: { textColor: [16, 185, 129] } }
            : { content: `- ${formatCurrency(t.amount)}`, styles: { textColor: [239, 68, 68] } },
        ])

        // Adicionar tabela
        // @ts-ignore - jspdf-autotable não tem tipos TS adequados
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 66, 66] },
          margin: { bottom: 15 },
        })

        // Atualizar a posição Y para o próximo dia
        // @ts-ignore - jspdf-autotable não tem tipos TS adequados
        yPosition = doc.lastAutoTable.finalY + 15
      })

    // Salvar o PDF
    doc.save(`relatorio-mensal-${monthName}-${yearFilter}.pdf`)
  }

  // Exportar para Excel - Relatório Personalizado
  const exportCustomToExcel = () => {
    // Preparar dados para exportação
    const exportData = sortedDateRangeTransactions.map((t) => ({
      "Data Emissão": formatDate(t.createdAt),
      "Data Vencimento": formatDate(t.date),
      Descrição: t.description,
      Tipo: t.type === "income" ? "A Receber" : "A Pagar",
      Valor: t.type === "income" ? `+ ${formatCurrency(t.amount)}` : `- ${formatCurrency(t.amount)}`,
    }))

    // Adicionar resumo
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "--- RESUMO ---",
      Tipo: "",
      Valor: "",
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Total a Receber",
      Tipo: "",
      Valor: `+ ${formatCurrency(dateRangeTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0))}`,
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Total a Pagar",
      Tipo: "",
      Valor: `- ${formatCurrency(dateRangeTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0))}`,
    })

    const balance = dateRangeTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "Saldo",
      Tipo: "",
      Valor: balance >= 0 ? `+ ${formatCurrency(balance)}` : `- ${formatCurrency(Math.abs(balance))}`,
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: `Relatório Personalizado - ${formatDate(startDate)} a ${formatDate(endDate)}`,
      Tipo: "",
      Valor: "",
    })
    exportData.unshift({
      "Data Emissão": "",
      "Data Vencimento": "",
      Descrição: "",
      Tipo: "",
      Valor: "",
    })

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório Personalizado")

    // Gerar arquivo e download
    XLSX.writeFile(workbook, `relatorio-personalizado.xlsx`)
  }

  // Exportar para PDF - Relatório Personalizado
  const exportCustomToPDF = () => {
    const doc = new jsPDF()

    // Título
    doc.setFontSize(18)
    doc.text(`Relatório Personalizado`, 14, 22)

    // Subtítulo com período
    doc.setFontSize(12)
    doc.text(`Período: ${formatDate(startDate)} a ${formatDate(endDate)}`, 14, 30)

    // Adicionar resumo
    // Total a Receber (verde)
    doc.text("Total a Receber:", 14, 40)
    doc.setTextColor(16, 185, 129) // Verde (#10b981)
    doc.text(
      `+ ${formatCurrency(dateRangeTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0))}`,
      60,
      40,
    )

    // Total a Pagar (vermelho)
    doc.setTextColor(0, 0, 0) // Resetar para preto
    doc.text("Total a Pagar:", 14, 48)
    doc.setTextColor(239, 68, 68) // Vermelho (#ef4444)
    doc.text(
      `- ${formatCurrency(dateRangeTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0))}`,
      60,
      48,
    )

    // Saldo (verde ou vermelho dependendo do valor)
    const balance = dateRangeTransactions.reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0)
    doc.setTextColor(0, 0, 0) // Resetar para preto
    doc.text("Saldo:", 14, 56)
    formatValueWithSignAndColor(doc, balance, 60, 56)

    // Agrupar transações por dia
    const transactionsByDay: { [key: string]: Transaction[] } = {}

    sortedDateRangeTransactions.forEach((transaction) => {
      try {
        const dateKey = formatDate(transaction.date)
        if (!transactionsByDay[dateKey]) {
          transactionsByDay[dateKey] = []
        }
        transactionsByDay[dateKey].push(transaction)
      } catch (error) {
        // Se houver erro ao formatar a data, agrupar em "Data inválida"
        if (!transactionsByDay["Data inválida"]) {
          transactionsByDay["Data inválida"] = []
        }
        transactionsByDay["Data inválida"].push(transaction)
      }
    })

    let yPosition = 65

    // Para cada dia, adicionar uma seção no PDF
    Object.keys(transactionsByDay)
      .sort()
      .forEach((dateKey) => {
        const dayTransactions = transactionsByDay[dateKey]

        // Adicionar cabeçalho do dia
        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)

        // Verificar se há espaço suficiente na página
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.text(`${dateKey}`, 14, yPosition)
        yPosition += 10

        // Calcular totais do dia
        const dailyIncome = dayTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
        const dailyExpense = dayTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)
        const dailyBalance = dailyIncome - dailyExpense

        // Adicionar resumo do dia - MELHORADO PARA PADRONIZAÇÃO
        doc.setFontSize(10)

        // Recebimentos (verde)
        doc.text("Recebimentos:", 14, yPosition)
        doc.setTextColor(16, 185, 129) // Verde
        doc.text(`+ ${formatCurrency(dailyIncome)}`, 60, yPosition)

        yPosition += 6 // Espaçamento entre linhas

        // Pagamentos (vermelho)
        doc.setTextColor(0, 0, 0) // Preto
        doc.text("Pagamentos:", 14, yPosition)
        doc.setTextColor(239, 68, 68) // Vermelho
        doc.text(`- ${formatCurrency(dailyExpense)}`, 60, yPosition)

        yPosition += 6 // Espaçamento entre linhas

        // Saldo (verde ou vermelho)
        doc.setTextColor(0, 0, 0) // Preto
        doc.text("Saldo:", 14, yPosition)

        if (dailyBalance >= 0) {
          doc.setTextColor(16, 185, 129) // Verde
          doc.text(`+ ${formatCurrency(dailyBalance)}`, 60, yPosition)
        } else {
          doc.setTextColor(239, 68, 68) // Vermelho
          doc.text(`- ${formatCurrency(Math.abs(dailyBalance))}`, 60, yPosition)
        }

        doc.setTextColor(0, 0, 0) // Resetar para preto
        yPosition += 8

        // Preparar dados para a tabela
        const tableColumn = ["Data Emissão", "Descrição", "Tipo", "Valor"]
        const tableRows = dayTransactions.map((t) => [
          formatDate(t.createdAt),
          t.description,
          t.type === "income" ? "A Receber" : "A Pagar",
          t.type === "income"
            ? { content: `+ ${formatCurrency(t.amount)}`, styles: { textColor: [16, 185, 129] } }
            : { content: `- ${formatCurrency(t.amount)}`, styles: { textColor: [239, 68, 68] } },
        ])

        // Adicionar tabela
        // @ts-ignore - jspdf-autotable não tem tipos TS adequados
        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: yPosition,
          theme: "grid",
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 66, 66] },
          margin: { bottom: 15 },
        })

        // Atualizar a posição Y para o próximo dia
        // @ts-ignore - jspdf-autotable não tem tipos TS adequados
        yPosition = doc.lastAutoTable.finalY + 15
      })

    // Salvar o PDF
    doc.save(`relatorio-personalizado.pdf`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Relatórios Financeiros</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setIsFiltersOpen(!isFiltersOpen)} className="md:hidden">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={reportType} onValueChange={setReportType} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="yearly">Anual</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
            <TabsTrigger value="custom">Período</TabsTrigger>
          </TabsList>

          {/* Relatório Anual */}
          <TabsContent value="yearly" className="space-y-4">
            {/* Filtros para desktop e mobile */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="year-filter">Ano</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger id="year-filter">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 col-span-1 sm:col-span-2 md:col-span-1">
                  <Button variant="outline" onClick={exportYearlyToExcel} className="flex items-center gap-2 flex-1">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                  <Button variant="outline" onClick={exportYearlyToPDF} className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    +{" "}
                    {formatCurrency(
                      yearlyTransactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    -{" "}
                    {formatCurrency(
                      yearlyTransactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0),
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm font-medium">Saldo do Ano</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const balance = yearlyTransactions.reduce(
                      (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
                      0,
                    )
                    return (
                      <div className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {balance >= 0 ? "+" : "-"} {formatCurrency(Math.abs(balance))}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fluxo de Caixa Mensal</h3>
              <div className="h-60 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareYearlyChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="entrada" name="A Receber" fill="#10b981" />
                    <Bar dataKey="saida" name="A Pagar" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h3 className="text-lg font-medium mt-8">Detalhamento por Mês</h3>
              {Object.entries(
                sortedYearlyTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
                  const month = new Date(transaction.date).getMonth()
                  const monthName = [
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
                  ][month]
                  if (!acc[monthName]) acc[monthName] = []
                  acc[monthName].push(transaction)
                  return acc
                }, {}),
              ).map(([month, transactions]) => (
                <ReportDetailSection
                  key={month}
                  title={month}
                  transactions={transactions}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  toggleSort={toggleSort}
                />
              ))}
            </div>

            {/* Botões de exportação para mobile (fora do collapsible) */}
            <div className="flex md:hidden gap-2 mt-4">
              <Button variant="outline" onClick={exportYearlyToExcel} className="flex items-center gap-2 flex-1">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportYearlyToPDF} className="flex items-center gap-2 flex-1">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </TabsContent>

          {/* Relatório Mensal */}
          <TabsContent value="monthly" className="space-y-4">
            {/* Filtros para desktop e mobile */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="year-filter-monthly">Ano</Label>
                  <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger id="year-filter-monthly">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="month-filter">Mês</Label>
                  <Select value={monthFilter} onValueChange={setMonthFilter}>
                    <SelectTrigger id="month-filter">
                      <SelectValue placeholder="Selecione o mês" />
                    </SelectTrigger>
                    <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
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

                <div className="flex gap-2 col-span-1 sm:col-span-2">
                  <Button variant="outline" onClick={exportMonthlyToExcel} className="flex items-center gap-2 flex-1">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                  <Button variant="outline" onClick={exportMonthlyToPDF} className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </div>
              </div>
            </div>

            <ReportSummaryRow
              transactions={monthlyTransactions}
              title={`${
                [
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
                ][Number.parseInt(monthFilter) - 1]
              } de ${yearFilter}`}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalhamento de Entradas e Saídas</h3>
              <div className="h-60 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareMonthlyDetailChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="valor" name="Valor">
                      {prepareMonthlyDetailChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "A Receber" ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {Object.entries(
                sortedMonthlyTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
                  const day = new Date(transaction.date).getDate().toString().padStart(2, "0")
                  if (!acc[day]) acc[day] = []
                  acc[day].push(transaction)
                  return acc
                }, {}),
              ).map(([day, transactions]) => (
                <ReportDetailSection
                  key={day}
                  title={`Dia ${day}`}
                  transactions={transactions}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  toggleSort={toggleSort}
                />
              ))}
            </div>

            {/* Botões de exportação para mobile (fora do collapsible) */}
            <div className="flex md:hidden gap-2 mt-4">
              <Button variant="outline" onClick={exportMonthlyToExcel} className="flex items-center gap-2 flex-1">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportMonthlyToPDF} className="flex items-center gap-2 flex-1">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </TabsContent>

          {/* Relatório Personalizado */}
          <TabsContent value="custom" className="space-y-4">
            {/* Filtros para desktop e mobile */}
            <div className="flex flex-col gap-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <Label htmlFor="start-date">Data Inicial</Label>
                  <DateInput id="start-date" value={startDate} onChange={setStartDate} />
                </div>

                <div>
                  <Label htmlFor="end-date">Data Final</Label>
                  <DateInput id="end-date" value={endDate} onChange={setEndDate} />
                </div>

                <div className="flex gap-2 col-span-1 sm:col-span-2">
                  <Button variant="outline" onClick={exportCustomToExcel} className="flex items-center gap-2 flex-1">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">Excel</span>
                  </Button>
                  <Button variant="outline" onClick={exportCustomToPDF} className="flex items-center gap-2 flex-1">
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                </div>
              </div>
            </div>

            <ReportSummaryRow
              transactions={dateRangeTransactions}
              title={`De ${formatDate(startDate)} até ${formatDate(endDate)}`}
            />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Detalhamento de Entradas e Saídas</h3>
              <div className="h-60 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={prepareDateRangeDetailChartData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Legend />
                    <Bar dataKey="valor" name="Valor">
                      {prepareDateRangeDetailChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === "A Receber" ? "#10b981" : "#ef4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {Object.entries(
                sortedDateRangeTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
                  try {
                    const dateKey = formatDate(transaction.date)
                    if (!acc[dateKey]) {
                      acc[dateKey] = []
                    }
                    acc[dateKey].push(transaction)
                  } catch (error) {
                    // Se houver erro ao formatar a data, agrupar em "Data inválida"
                    if (!acc["Data inválida"]) {
                      acc["Data inválida"] = []
                    }
                    acc["Data inválida"].push(transaction)
                  }
                  return acc
                }, {}),
              ).map(([dateKey, transactions]) => (
                <ReportDetailSection
                  key={dateKey}
                  title={dateKey}
                  transactions={transactions}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                  toggleSort={toggleSort}
                />
              ))}
            </div>

            {/* Botões de exportação para mobile (fora do collapsible) */}
            <div className="flex md:hidden gap-2 mt-4">
              <Button variant="outline" onClick={exportCustomToExcel} className="flex items-center gap-2 flex-1">
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={exportCustomToPDF} className="flex items-center gap-2 flex-1">
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
