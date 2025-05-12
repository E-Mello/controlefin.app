// Path: components/transaction-form.tsx

"use client";
import { createConta, updateConta } from "@/actions/contas";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import DateInput from "./date-input";
import { useFormStatus } from "react-dom";
import type { CreateContaRequest, CreateContaResponse } from "@/types/contas";

// Mapeamento de tipos
const mapStateToTipo = (state: "income" | "expense"): "A Receber" | "A Pagar" =>
  state === "income" ? "A Receber" : "A Pagar";
const mapTipoToState = (tipo: "A Receber" | "A Pagar"): "income" | "expense" =>
  tipo === "A Receber" ? "income" : "expense";

interface TransactionFormProps {
  onAddTransaction: (trans: CreateContaResponse) => void;
  editingTransaction: CreateContaResponse | null;
  onCancelEdit: () => void;
}

export default function TransactionForm({
  onAddTransaction,
  editingTransaction,
  onCancelEdit,
}: TransactionFormProps) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [formattedAmount, setFormattedAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [date, setDate] = useState("");
  const [errors, setErrors] = useState<{
    description?: string;
    amount?: string;
    date?: string;
  }>({});
  const { pending } = useFormStatus();

  // data mínima: hoje no formato YYYY-MM-DD
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    if (editingTransaction) {
      setDescription(editingTransaction.descricao);
      setFormattedAmount(editingTransaction.valor.toString().replace(".", ","));
      setAmount(editingTransaction.valor.toString());
      setType(mapTipoToState(editingTransaction.tipo));
      // extrai apenas YYYY-MM-DD
      setDate(editingTransaction.data_vencimento.split("T")[0]);
    } else {
      setDescription("");
      setAmount("");
      setFormattedAmount("");
      setType("income");
      setDate(today);
      setErrors({});
    }
  }, [editingTransaction, today]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^\d,\.]/g, "");
    setFormattedAmount(clean);
    setAmount(clean ? clean.replace(/\./g, "").replace(",", ".") : "");
  };

  const validateForm = (): boolean => {
    const newErr: {
      description?: string;
      amount?: string;
      date?: string;
    } = {};
    if (!description.trim()) {
      newErr.description = "A descrição é obrigatória";
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErr.amount = "Informe um valor válido maior que zero";
    }
    if (!date) {
      newErr.date = "A data de vencimento é obrigatória";
    } else if (date < today) {
      newErr.date = "Data não pode ser anterior a hoje";
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      toast("Por favor, corrija os campos destacados.");
      return;
    }
    const payload: CreateContaRequest = {
      tipo: mapStateToTipo(type),
      descricao: description,
      valor: parseFloat(amount),
      data_vencimento: date,
    };
    try {
      const result = editingTransaction
        ? await updateConta(editingTransaction.id, payload)
        : await createConta(payload);
      toast(
        `${description} ${
          editingTransaction ? "atualizado" : "adicionado"
        } com sucesso.`
      );
      onAddTransaction(result);
      // reset
      setDescription("");
      setAmount("");
      setFormattedAmount("");
      setType("income");
      setDate(today);
      setErrors({});
    } catch {
      toast("Erro ao criar ou atualizar a conta no banco de dados.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {editingTransaction ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-amber-500" />
                Editar Lançamento
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                Novo Lançamento
              </>
            )}
          </CardTitle>
          {editingTransaction && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancelEdit}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form
          id="transaction-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {/* tipo */}
          <div>
            <Label htmlFor="type">Tipo</Label>
            <RadioGroup
              id="type"
              value={type}
              onValueChange={(val) => setType(val as "income" | "expense")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income" className="text-green-600 font-medium">
                  Entrada
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense" className="text-red-600 font-medium">
                  Saída
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* descrição */}
          <div>
            <Label
              htmlFor="description"
              className={errors.description ? "text-red-500" : ""}
            >
              Descrição {errors.description && `(${errors.description})`}
            </Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salário, Aluguel, etc."
              className={errors.description ? "border-red-500" : ""}
            />
          </div>

          {/* valor */}
          <div>
            <Label
              htmlFor="amount"
              className={errors.amount ? "text-red-500" : ""}
            >
              Valor (R$) {errors.amount && `(${errors.amount})`}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                R$
              </span>
              <Input
                id="amount"
                value={formattedAmount}
                onChange={handleAmountChange}
                placeholder="0,00"
                inputMode="decimal"
                className={errors.amount ? "pl-10 border-red-500" : "pl-10"}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Digite o valor usando vírgula como separador decimal.
            </p>
          </div>

          {/* data de vencimento com calendário e regra min */}
          <div>
            <Label htmlFor="date" className={errors.date ? "text-red-500" : ""}>
              Data de vencimento {errors.date && `(${errors.date})`}
            </Label>
            <DateInput
              id="date"
              value={date}
              onChange={(val) => setDate(val)}
              className={errors.date ? "border-red-500" : ""}
            />
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
        {editingTransaction && (
          <Button variant="outline" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          form="transaction-form"
          disabled={pending}
          className="w-full sm:w-auto"
        >
          {pending
            ? "Processando..."
            : editingTransaction
            ? "Atualizar"
            : "Adicionar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
