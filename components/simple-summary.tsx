import { Card, CardContent } from "@/components/ui/card"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react"

interface SimpleSummaryProps {
  transactions: Transaction[]
  className?: string
}

export default function SimpleSummary({ transactions, className = "" }: SimpleSummaryProps) {
  const income = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0)
  const expense = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0)
  const balance = income - expense

  return (
    <div className={`grid gap-4 md:grid-cols-3 ${className}`}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">A Receber</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(income)}</p>
            </div>
            <ArrowUpCircle className="h-5 w-5 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">A Pagar</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(expense)}</p>
            </div>
            <ArrowDownCircle className="h-5 w-5 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <DollarSign className={`h-5 w-5 ${balance >= 0 ? "text-green-600" : "text-red-600"}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
