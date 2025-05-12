"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReportSummaryRow from "./reports-summary-row";
import { Conta } from "@/types/contas";

interface ReportDetailSectionProps {
  title: string;
  transactions: Conta[];
  sortColumn: string;
  sortDirection: "asc" | "desc";
  toggleSort: (column: string) => void;
}

export default function ReportDetailSection({
  title,
  transactions,
  sortColumn,
  sortDirection,
  toggleSort,
}: ReportDetailSectionProps) {
  return (
    <div className="space-y-4 mb-6">
      <ReportSummaryRow transactions={transactions} title={title} />

      {transactions.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("createdAt")}
                  >
                    Data Emissão
                    {sortColumn === "createdAt" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("date")}
                  >
                    Data Vencimento
                    {sortColumn === "date" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("description")}
                  >
                    Descrição
                    {sortColumn === "description" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("type")}
                  >
                    Tipo
                    {sortColumn === "type" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => toggleSort("amount")}
                  >
                    Valor
                    {sortColumn === "amount" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {formatDate(transaction.data_emissao)}
                    </TableCell>
                    <TableCell>
                      {formatDate(transaction.data_vencimento)}
                    </TableCell>
                    <TableCell>{transaction.descricao}</TableCell>
                    <TableCell>{transaction.tipo}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.tipo === "A Receber"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.tipo === "A Receber" ? "+" : "-"}{" "}
                      {formatCurrency(transaction.valor)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Nenhuma transação encontrada para este período.
        </div>
      )}
    </div>
  );
}
