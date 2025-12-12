# MediFlow CRM

Um CRM moderno para gestão de pacientes com autenticação Firebase e integração Firestore.

## Funcionalidades

- **Dashboard**: Visão geral de pacientes e faturamento.
- **Pacientes**: Cadastro e listagem com status.
- **Funil de Vendas**: Kanban para gestão de leads.
- **Integrações**: Webhook para receber dados externos.
- **Configurações**: Gerenciamento de perfil.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Rode o frontend (Desenvolvimento):
   ```bash
   npm run dev
   ```

3. Rode o servidor de Webhook:
   ```bash
   npm run server
   ```

## Tech Stack

- React + Vite
- Firebase (Auth, Firestore)
- Tailwind CSS
- Express (Backend/Webhook)
