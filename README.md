# StreamFlow Dashboard UI

Um dashboard moderno e em tempo real construído com Next.js para visualização e gerenciamento de pedidos com streaming de eventos.

## 🚀 Tecnologias

- **Next.js 13+** - Framework React com SSR e otimizações de performance
- **TypeScript** - Tipagem estática para maior segurança e produtividade
- **Tailwind CSS** - Estilização utilitária e responsiva
- **Zustand** - Gerenciamento de estado global
- **Server-Sent Events (SSE)** - Streaming de eventos em tempo real
- **Lucide Icons** - Biblioteca de ícones moderna e consistente

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular e escalável:

```
src/
├── components/          # Componentes reutilizáveis
│   ├── AuthLoader      # Loading durante autenticação
│   ├── Dashboard       # Layout principal do dashboard
│   ├── Layout          # Layout base com sidebar
│   ├── LoginForm       # Formulário de login
│   ├── OrdersTestEvents# Gerador de eventos de teste
│   ├── ProtectedRoute  # HOC para proteção de rotas
│   ├── Sidebar         # Menu lateral de navegação
│   ├── StatCard        # Cards de estatísticas
│   ├── StreamTable     # Tabela de eventos em tempo real
│   └── StoreProvider   # Provider do Zustand
├── context/            # Contextos React
│   └── AuthContext     # Contexto de autenticação
├── hooks/              # Hooks customizados
│   └── useAuth        # Hook de autenticação
├── pages/             # Páginas da aplicação
│   ├── dashboard      # Dashboard principal
│   ├── orders         # Gerenciamento de pedidos
│   ├── settings       # Configurações
│   └── test-events    # Página de testes de eventos
├── services/          # Serviços e APIs
│   └── api.ts         # Cliente HTTP e tipos
├── store/             # Estados globais
│   └── auth.ts        # Store de autenticação
└── styles/            # Estilos globais
```

## 🔑 Funcionalidades Principais

1. **Autenticação Completa**
   - Login/Logout
   - Proteção de rotas
   - Persistência de sessão

2. **Dashboard em Tempo Real**
   - Visualização de métricas
   - Gráficos e estatísticas
   - Atualizações em tempo real

3. **Gerenciamento de Pedidos**
   - CRUD completo de pedidos
   - Filtros e busca
   - Paginação

4. **Streaming de Eventos**
   - Conexão SSE com backend
   - Filtragem por tipo de evento
   - Reconexão automática
   - Buffer de eventos

## 🔧 Configuração

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Backend StreamFlow rodando

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```env
# API e Streaming
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1    # URL base da API
NEXT_PUBLIC_STREAM_URL=http://localhost:3001        # URL do servidor de streaming

# Configurações do App
NEXT_PUBLIC_APP_NAME=StreamFlow Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development                                # development ou production
NEXT_PUBLIC_DEBUG=true                             # habilita logs de debug
```

### Instalação

```bash
# Instalar dependências
npm install
# ou
yarn install

# Rodar em desenvolvimento
npm run dev
# ou
yarn dev

# Build para produção
npm run build
# ou
yarn build

# Rodar em produção
npm start
# ou
yarn start
```

## 🔄 Complexidades e Soluções Técnicas

### 1. Streaming de Eventos em Tempo Real

O projeto implementa um sistema robusto de streaming usando Server-Sent Events (SSE) com várias otimizações:

- **Reconexão Inteligente**: Implementa backoff exponencial para tentativas de reconexão
- **Buffer de Eventos**: Mantém um buffer circular para limitar o uso de memória
- **Debouncing**: Otimiza a frequência de atualizações da UI
- **Tipos de Eventos**: Suporta diferentes tipos (USER_ACTION, SYSTEM_EVENT, ERROR, WARNING)

### 2. Gerenciamento de Estado

Utiliza Zustand para um gerenciamento de estado eficiente:

- **Hidratação Persistente**: Mantém estado entre refreshes
- **Separação de Concerns**: Stores independentes para auth e dados
- **Otimização de Renders**: Updates seletivos para melhor performance

### 3. Autenticação e Segurança

Sistema de autenticação completo com:

- **Token Management**: Gerenciamento seguro de tokens JWT
- **Route Protection**: HOC para proteção de rotas
- **Session Persistence**: Persistência segura de sessão
- **Auto Refresh**: Renovação automática de tokens

### 4. Performance e Otimizações

Várias otimizações de performance implementadas:

- **Code Splitting**: Carregamento lazy de componentes
- **Memoization**: Uso estratégico de useMemo e useCallback
- **Virtual Scrolling**: Para listas longas de eventos
- **Debounced Updates**: Controle de frequência de updates

## 📦 Integração com Backend

O frontend se integra com dois endpoints principais do backend:

1. **API REST** (`NEXT_PUBLIC_API_URL`)
   - Autenticação
   - CRUD de pedidos
   - Métricas e estatísticas

2. **Streaming Server** (`NEXT_PUBLIC_STREAM_URL`)
   - Stream de eventos em tempo real
   - Heartbeat para verificação de conexão
   - Tipos diferentes de eventos

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 