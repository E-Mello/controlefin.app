// Path: /types/contas.ts

// Tipo para Conta
export interface Conta {
  id: string;
  tipo: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_emissao: string;
}

// Tipo para a resposta ao GET /contas
export type GetContasResponse = Conta[];

// Tipo para a requisição ao POST /contas
export interface CreateContaRequest {
  tipo: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
}

// Tipo para a resposta ao POST /contas
export interface CreateContaResponse extends Conta {}

// Tipo para a resposta ao GET /contas/{conta_id}
export type GetContaResponse = Conta;

// Tipo para a requisição ao PUT /contas/{conta_id}
export interface UpdateContaRequest {
  tipo: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
}

// Tipo para a resposta ao PUT /contas/{conta_id}
export interface UpdateContaResponse extends Conta {}

// Tipo para a resposta ao DELETE /contas/{conta_id}
export interface DeleteContaResponse {
  id: string;
  mensagem: string;
}

// Tipo para o erro de validação (usado em POST, PUT, DELETE)
export interface ValidationError {
  detail: {
    loc: [string, number];
    msg: string;
    type: string;
  }[];
}
