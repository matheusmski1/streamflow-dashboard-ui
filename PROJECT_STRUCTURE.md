# Estrutura do Projeto - Streamflow Dashboard

## 📁 Nova Estrutura de Pastas (Pages Router)

```
streamflow-dashboard-ui/
│
├── public/                 # Arquivos estáticos (imagens, favicon, etc)
│   ├── favicon.ico
│   ├── next.svg
│   ├── vercel.svg
│   └── ...
│
├── src/                    # Código-fonte principal
│   ├── pages/              # Páginas da aplicação (rotas)
│   │   ├── _app.tsx        # Componente raiz para inicialização global
│   │   ├── _document.tsx   # Custom Document para HTML base
│   │   ├── index.tsx       # Página inicial (redireciona)
│   │   ├── login.tsx       # Página de login
│   │   ├── dashboard/      # Páginas do dashboard
│   │   │   └── index.tsx   # Dashboard principal
│   │   ├── orders.tsx      # Página de gerenciamento de pedidos
│   │   ├── analytics.tsx   # Página de analytics
│   │   └── settings.tsx    # Página de configurações
│   │
│   ├── components/         # Componentes React reutilizáveis
│   │   ├── Layout.tsx      # Layout comum para páginas protegidas
│   │   ├── Sidebar.tsx     # Barra lateral de navegação
│   │   ├── LoginForm.tsx   # Formulário de login
│   │   ├── StatCard.tsx    # Card de estatísticas
│   │   ├── StreamTable.tsx # Tabela de dados em tempo real
│   │   └── StoreProvider.tsx # Provider para hidratação
│   │
│   ├── context/            # Context API (AuthContext)
│   │   └── AuthContext.tsx # Contexto de autenticação
│   │
│   ├── hooks/              # Custom hooks
│   │   └── useAuth.ts      # Hook de autenticação
│   │
│   ├── services/           # Serviços para API e integrações
│   │   └── api.ts          # Cliente da API REST
│   │
│   ├── store/              # Estado global (Zustand)
│   │   └── auth.ts         # Store de autenticação
│   │
│   ├── utils/              # Funções utilitárias gerais
│   │   └── utils.ts        # Utilidades diversas
│   │
│   ├── styles/             # Estilos globais
│   │   └── globals.css     # CSS global com Tailwind
│   │
│   └── middleware.ts       # Middleware do Next.js (proteção de rotas)
│
├── .env.local              # Variáveis de ambiente (local)
├── env.example             # Exemplo de variáveis de ambiente
├── next.config.ts          # Configuração do Next.js
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração do TypeScript
├── tailwind.config.ts      # Configuração do Tailwind CSS
└── README.md              # Documentação do projeto
```

## 🔄 Principais Mudanças Implementadas

### 1. **Migração para Pages Router**
- ✅ Removido App Router (`src/app/`)
- ✅ Implementado Pages Router (`src/pages/`)
- ✅ Criado `_app.tsx` e `_document.tsx`
- ✅ Middleware para proteção de rotas

### 2. **Reorganização de Pastas**
- ✅ `src/lib/` → `src/services/` (API e integrações)
- ✅ `src/contexts/` → `src/context/` (singular)
- ✅ `src/app/globals.css` → `src/styles/globals.css`
- ✅ Criada pasta `src/utils/` para utilitários
- ✅ Atualizado `tsconfig.json` com novos path mappings

### 3. **Componente Layout Unificado**
- ✅ Criado `Layout.tsx` para páginas protegidas
- ✅ Integração automática com autenticação
- ✅ Sidebar responsiva incluída
- ✅ Proteção de rotas automática

### 4. **Estrutura de Rotas Simplificada**
```
/ → Redireciona para /login ou /dashboard
/login → Página de autenticação
/dashboard → Dashboard principal
/orders → Gerenciamento de pedidos
/analytics → Análises e relatórios
/settings → Configurações do usuário
```

### 5. **Melhorias de Código**
- ✅ Imports atualizados para nova estrutura
- ✅ Middleware para proteção automática de rotas
- ✅ Componentes mais limpos e reutilizáveis
- ✅ Separação clara de responsabilidades

## 🛠️ Como Usar

### Desenvolvimento
```bash
npm run dev    # Servidor de desenvolvimento
npm run build  # Build de produção
npm run start  # Servidor de produção
```

### Produção (Static Export)
```bash
npm run build  # Gera pasta /out
npx serve out -p 3004  # Serve arquivos estáticos
```

## 🔒 Proteção de Rotas

O middleware automaticamente:
- Redireciona usuários não autenticados para `/login`
- Redireciona usuários autenticados para `/dashboard` quando tentam acessar `/login`
- Protege todas as rotas do dashboard

## 📱 Responsividade

- ✅ Sidebar retrátil em mobile
- ✅ Layout adaptável para tablets e desktop
- ✅ Componentes otimizados para diferentes tamanhos de tela

## 🔧 Principais Tecnologias

- **Next.js 15** (Pages Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (Estado global)
- **Lucide React** (Ícones)
- **js-cookie** (Gerenciamento de cookies)

## 📈 Benefícios da Nova Estrutura

1. **Organização**: Estrutura mais clara e intuitiva
2. **Manutenibilidade**: Separação de responsabilidades
3. **Escalabilidade**: Fácil adição de novas funcionalidades
4. **Performance**: Otimizações do Next.js Pages Router
5. **SEO**: Melhor controle sobre meta tags e SSR
6. **Desenvolvimento**: Experiência de desenvolvimento mais fluida 