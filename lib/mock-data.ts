import { v4 as uuidv4 } from "uuid"
import type { Transaction } from "./types"

// Dados fictícios para demonstração
export const generateMockData = (): Transaction[] => {
  const mockData: Transaction[] = []

  // Dados para 2023
  // Janeiro 2023
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5000,
    type: "income",
    date: "2023-01-05T00:00:00.000Z",
    createdAt: "2023-01-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1200,
    type: "expense",
    date: "2023-01-10T00:00:00.000Z",
    createdAt: "2023-01-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 650,
    type: "expense",
    date: "2023-01-15T00:00:00.000Z",
    createdAt: "2023-01-15T00:00:00.000Z",
  })

  // Fevereiro 2023
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5000,
    type: "income",
    date: "2023-02-05T00:00:00.000Z",
    createdAt: "2023-02-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Bônus",
    amount: 1000,
    type: "income",
    date: "2023-02-05T00:00:00.000Z",
    createdAt: "2023-02-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1200,
    type: "expense",
    date: "2023-02-10T00:00:00.000Z",
    createdAt: "2023-02-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 700,
    type: "expense",
    date: "2023-02-15T00:00:00.000Z",
    createdAt: "2023-02-15T00:00:00.000Z",
  })

  // Março 2023
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5000,
    type: "income",
    date: "2023-03-05T00:00:00.000Z",
    createdAt: "2023-03-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1200,
    type: "expense",
    date: "2023-03-10T00:00:00.000Z",
    createdAt: "2023-03-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 680,
    type: "expense",
    date: "2023-03-15T00:00:00.000Z",
    createdAt: "2023-03-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Conserto do carro",
    amount: 1500,
    type: "expense",
    date: "2023-03-20T00:00:00.000Z",
    createdAt: "2023-03-20T00:00:00.000Z",
  })

  // Dados para 2024
  // Janeiro 2024
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5500,
    type: "income",
    date: "2024-01-05T00:00:00.000Z",
    createdAt: "2024-01-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Freelance",
    amount: 2000,
    type: "income",
    date: "2024-01-15T00:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1300,
    type: "expense",
    date: "2024-01-10T00:00:00.000Z",
    createdAt: "2024-01-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 800,
    type: "expense",
    date: "2024-01-15T00:00:00.000Z",
    createdAt: "2024-01-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Academia",
    amount: 120,
    type: "expense",
    date: "2024-01-20T00:00:00.000Z",
    createdAt: "2024-01-20T00:00:00.000Z",
  })

  // Fevereiro 2024
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5500,
    type: "income",
    date: "2024-02-05T00:00:00.000Z",
    createdAt: "2024-02-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1300,
    type: "expense",
    date: "2024-02-10T00:00:00.000Z",
    createdAt: "2024-02-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 750,
    type: "expense",
    date: "2024-02-15T00:00:00.000Z",
    createdAt: "2024-02-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Academia",
    amount: 120,
    type: "expense",
    date: "2024-02-20T00:00:00.000Z",
    createdAt: "2024-02-20T00:00:00.000Z",
  })

  // Março 2024
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5500,
    type: "income",
    date: "2024-03-05T00:00:00.000Z",
    createdAt: "2024-03-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Bônus trimestral",
    amount: 3000,
    type: "income",
    date: "2024-03-10T00:00:00.000Z",
    createdAt: "2024-03-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1300,
    type: "expense",
    date: "2024-03-10T00:00:00.000Z",
    createdAt: "2024-03-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 820,
    type: "expense",
    date: "2024-03-15T00:00:00.000Z",
    createdAt: "2024-03-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Academia",
    amount: 120,
    type: "expense",
    date: "2024-03-20T00:00:00.000Z",
    createdAt: "2024-03-20T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Viagem de fim de semana",
    amount: 1200,
    type: "expense",
    date: "2024-03-25T00:00:00.000Z",
    createdAt: "2024-03-25T00:00:00.000Z",
  })

  // Abril 2024
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5500,
    type: "income",
    date: "2024-04-05T00:00:00.000Z",
    createdAt: "2024-04-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1300,
    type: "expense",
    date: "2024-04-10T00:00:00.000Z",
    createdAt: "2024-04-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 780,
    type: "expense",
    date: "2024-04-15T00:00:00.000Z",
    createdAt: "2024-04-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Academia",
    amount: 120,
    type: "expense",
    date: "2024-04-20T00:00:00.000Z",
    createdAt: "2024-04-20T00:00:00.000Z",
  })

  // Maio 2024
  mockData.push({
    id: uuidv4(),
    description: "Salário",
    amount: 5500,
    type: "income",
    date: "2024-05-05T00:00:00.000Z",
    createdAt: "2024-05-05T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Aluguel",
    amount: 1300,
    type: "expense",
    date: "2024-05-10T00:00:00.000Z",
    createdAt: "2024-05-10T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Supermercado",
    amount: 810,
    type: "expense",
    date: "2024-05-15T00:00:00.000Z",
    createdAt: "2024-05-15T00:00:00.000Z",
  })
  mockData.push({
    id: uuidv4(),
    description: "Academia",
    amount: 120,
    type: "expense",
    date: "2024-05-20T00:00:00.000Z",
    createdAt: "2024-05-20T00:00:00.000Z",
  })

  return mockData
}
