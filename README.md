# ControleFin - Livro Caixa

ControleFin é uma aplicação simples construída com **Next.js** para gerenciar um livro caixa digital. O sistema permite o cadastro de **entradas** e **saídas**, além de exibir o **saldo** atual.

## Funcionalidades

- **Cadastro de Entradas**: Registra os valores que entram no caixa.
- **Cadastro de Saídas**: Registra os valores que saem do caixa.
- **Saldo Atual**: Exibe o saldo atual do caixa com base nas entradas e saídas registradas.

## Tecnologias Utilizadas

- **Next.js**: Framework React para desenvolvimento de aplicações full-stack.
- **React**: Biblioteca para construção da interface do usuário.
- **Tailwind CSS**: Framework de utilitários para estilização rápida e responsiva.

## Requisitos

- **Node.js** (versão >= 16.x)
- **npm** (gerenciador de pacotes do Node.js)

## Instalação

1. Clone este repositório:

   ```bash
   git clone https://github.com/E-Mello/controlefin.app.git
   ```

2. Navegue até o diretório do projeto:

   ```bash
   cd controlefin.app
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Após a instalação, inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   A aplicação estará disponível em [http://localhost:3000](http://localhost:3000).

## Estrutura do Projeto

- **pages/**: Contém as páginas da aplicação.
  - **index.js**: A página inicial, onde são cadastradas as entradas e saídas, e o saldo é mostrado.
- **components/**: Componentes reutilizáveis, como os formulários de entrada e saída.
- **styles/**: Arquivo de configuração do Tailwind CSS (`globals.css`), onde as configurações do Tailwind são importadas.

## Como Usar

1. **Cadastrar Entradas**: No formulário de "Entrada", informe o valor e uma descrição para o lançamento de entrada.
2. **Cadastrar Saídas**: No formulário de "Saída", informe o valor e uma descrição para o lançamento de saída.
3. **Visualizar o Saldo**: O saldo será calculado automaticamente com base nas entradas e saídas registradas.

## Exemplo de Fluxo de Uso

- O usuário acessa a página inicial.
- O usuário pode adicionar uma entrada, como o valor de uma venda.
- O usuário pode adicionar uma saída, como uma despesa.
- O saldo é automaticamente calculado e exibido.

## Personalização

Você pode modificar a aplicação conforme necessário, alterando a lógica de cálculo ou a interface, para melhor atender às suas necessidades.

## Contribuições

Sinta-se à vontade para abrir **issues** ou enviar **pull requests** para melhorias, correções de bugs ou novos recursos.

## Licença

Distribuído sob a licença MIT. Veja a [LICENÇA](LICENSE) para mais informações.
