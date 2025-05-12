import { formatCurrency } from "@/lib/utils";
import { Conta } from "@/types/contas";

interface ReportSummaryRowProps {
  transactions: Conta[];
  title: string;
  className?: string;
}

export default function ReportSummaryRow({
  transactions,
  title,
  className = "",
}: ReportSummaryRowProps) {
  // Calcular totais
  const income = transactions
    .filter((t) => t.tipo === "A Receber")
    .reduce((acc, t) => acc + t.valor, 0);
  const expense = transactions
    .filter((t) => t.tipo === "A Pagar")
    .reduce((acc, t) => acc + t.valor, 0);
  const balance = income - expense;

  return (
    <div className={`mb-4 ${className}`}>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="flex flex-wrap items-center text-sm md:text-base overflow-x-auto whitespace-nowrap pb-2">
        <span className="font-medium">Recebimentos:</span>
        <span className="text-green-600 font-medium ml-1">
          + {formatCurrency(income)}
        </span>

        <span className="mx-2 text-muted-foreground">|</span>

        <span className="font-medium">Pagamentos:</span>
        <span className="text-red-600 font-medium ml-1">
          - {formatCurrency(expense)}
        </span>

        <span className="mx-2 text-muted-foreground">|</span>

        <span className="font-medium">Saldo:</span>
        <span
          className={`font-medium ml-1 ${
            balance >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {balance >= 0 ? "+" : "-"} {formatCurrency(Math.abs(balance))}
        </span>
      </div>
    </div>
  );
}
