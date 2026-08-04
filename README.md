# Móveis Soares

Site institucional + loja virtual da Móveis Soares (plano **Loja Pro** da Dolen), construído sob o mesmo padrão dos demais produtos da casa (Dolen, CRC, EduCore, Avante).

## Stack

- **frontend/** — Angular 20.3, SSR configurado (dev via `ng serve`, produção CSR estático — mesmo padrão do Dolen)
- **backend/** — Laravel 13, PHP ^8.3, autenticação Sanctum (bearer token)
- **Banco:** MySQL (`moveis_soares` local)

## Rodando local (Herd)

- Frontend: `moveis-soares.test` (após build) ou `ng serve` (localhost:4200)
- Backend: `backend-moveis-soares.test`, isolado em PHP 8.4 (`herd isolate 8.4 --site=backend-moveis-soares`)
- Banco local `moveis_soares` (MySQL, mesmo servidor usado pelos outros projetos Herd)

```bash
# backend
cd backend
composer install
cp .env.example .env   # ajustar DB_PASSWORD se necessário
php artisan key:generate
php artisan migrate

# frontend
cd frontend
npm install
ng serve
```

## Estrutura

Segue o mesmo padrão do CRC/Dolen:

- `frontend/src/app/features/` — páginas públicas (home, sobre, contato, catálogo) + admin (painel)
- `frontend/src/app/layout/` — `public-layout` e `admin-layout`
- `frontend/src/app/core/services/` — serviços de API
- `frontend/src/app/guards/` + `interceptors/` — auth
- `backend/app/Http/Controllers/Api/` — controllers públicos
- `backend/app/Http/Controllers/Api/Admin/` — controllers autenticados (Sanctum)

## Fluxo de trabalho

Feature branch + PR — mesmo fluxo do Dolen. Só Fernando (e Claude com ele) mexe em produção/deploy; colaboradores (Claudia) param no PR.

## Demandas

Board dedicado no Avante (gestão de tarefas interna da Dolen), épicos: Setup, Site Público, Painel Admin, E-commerce, Fechamento MVP.
