// Path: app/actions/contas.ts
"use server";

import { CreateContaRequest, CreateContaResponse } from "@/types/contas";

export const getContas = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contas/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar contas");
  }

  return response.json();
};

export const getConta = async (contaId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/contas/${contaId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar a conta");
  }

  return response.json();
};

export const createConta = async (
  conta: CreateContaRequest
): Promise<CreateContaResponse> => {
  console.log("conta", conta);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contas/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(conta),
  });

  if (!response.ok) {
    throw new Error("Erro ao criar conta");
  }

  return response.json();
};

export const updateConta = async (
  contaId: string,
  conta: {
    tipo: string;
    descricao: string;
    valor: number;
    data_vencimento: string;
  }
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/contas/${contaId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(conta),
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao atualizar a conta");
  }

  return response.json();
};

export const deleteConta = async (contaId: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/contas/${contaId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao deletar a conta");
  }

  return response.json();
};
