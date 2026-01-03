# Next.js + TypeScript + PostgreSQL + Prisma

- Node.js
- TypeScript
- Next.js (App Router, backend-first)
- PostgreSQL
- Prisma ORM
- Clean Architecture / Modular Architecture
- RBAC (Role-Based Access Control)
- Sistemas de stock y ventas

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# DB postgres con Docker
 ```bash
configurar .env
configurar docker-compose.yml
 ```
# Iniciar los servicios
Ejecuta el siguiente comando en la terminal desde el directorio donde están tus archivos: 

 ```bash
docker-compose up -d
 ```

## Uso con docker run (Alternativa)
Si prefieres usar docker run, puedes pasar el archivo .env completo usando la bandera --env-file. 

```bash
docker run --name postgres_container \
-p 5432:5432 \
--env-file .env \
-v postgres_data:/var/lib/postgresql/data \
-d postgres:16
```
# PRISMA CONFIGURATION
warn Prisma would have added DATABASE_URL but it already exists in .env.
warn You already have a .gitignore file. Don't forget to add .env in it to not commit any private information.

Next, choose how you want to set up your database:

CONNECT EXISTING DATABASE:
  1. Configure your DATABASE_URL in prisma.config.ts
  2. Run prisma db pull to introspect your database.

CREATE NEW DATABASE:
  Local: npx prisma dev (runs Postgres locally in your terminal)
  Cloud: npx create-db (creates a free Prisma Postgres database)

Then, define your models in prisma/schema.prisma and run prisma migrate dev to apply your schema.

Learn more: https://pris.ly/getting-started

# DBeaver - Solutions in DBeaver

### 1- Connection-Specific Setting (Recommended for this issue):
- Edit your PostgreSQL connection in DBeaver.
- Go to the Advanced tab (or Metadata -> Global Settings in newer versions).
- Find and enable "Replace legacy time zone" or manually set the timezone for the connection.
- Try setting it to a standard value like UTC or America/Argentina/Buenos_Aires if supported by your PostgreSQL version.

### 2- DBeaver Preferences (Global):

- Go to Window > Preferences > User Interface.
- Change the Timezone setting to a supported value (e.g., UTC, America/Argentina/Buenos_Aires).

### una vez hecha la migracion

npx prisma migrate dev --name init

npx prisma generate //ejecutar tmbn esta linea

```code
//prisma.ts
import { PrismaClient } from '../generated/prisma'; //configurar este import que esta configurado en schema.prisma

```

```code
//schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```
### 🟢 3 — Autenticación + JWT + RBAC
🎯 Objetivo
tener:
```
✔ Login con email + password
✔ Passwords hasheadas
✔ JWT Access Token
✔ Refresh Token persistido
✔ Middleware de autenticación
✔ Middleware de permisos (RBAC)
✔ Endpoint /api/auth/me
```
👉 Sin lógica duplicada
👉 Sin auth “trucha”

🧠 Decisiones de arquitectura (importante)

#### Access Token
- Vida corta (15 min)
- Se usa en cada request
#### Refresh Token
- Vida larga (7–30 días)
- Guardado en DB
- Permite renovar sesión
#### RBAC
- Permisos definidos por rol
- Middleware reusable
- El controller NO decide permisos

### 🟢 PASO 4 — Usuarios + Sucursales
🎯 Objetivo del paso 4
tener:
```
✔ CRUD de usuarios
✔ CRUD de sucursales
✔ Asignación usuario ↔ sucursal
✔ Guards por rol y permisos
✔ Separación controller / service / repo
✔ Endpoints listos para React Query
```
🧠 Reglas de negocio (claras desde ahora)
#### Usuarios

- Solo SUPER_ADMIN puede crear y eliminar usuarios
- BRANCH_MANAGER solo puede ver usuarios de su sucursal
- Password siempre hasheada
- Email único

#### Sucursales

- Solo SUPER_ADMIN puede crear/editar
- Usuarios normales solo leen
- Incluye sucursal virtual (type = "virtual")

### 🟢 PASO 5 — Productos
🎯 Objetivo del paso 5
tener:
```
✔ CRUD completo de productos
✔ Activar / desactivar productos
✔ Validaciones fuertes
✔ Guards por permisos
✔ Código alineado con React Query
✔ Base perfecta para Stock (Paso 6)
```
🧠 Reglas de negocio

- Solo usuarios con permiso products
- SKU único
- Un producto inactivo no puede venderse
- El stock se maneja en otro módulo (no acá)

### 🟢 Paso 6: Stock (multi-sucursal + transacciones)
🎯 Objetivo
El paso más delicado:

- Stock por producto y sucursal
- Ajustes manuales
- Transferencias entre sucursales
- Historial de movimientos
- Transacciones atomicas PostgreSQL
- enpoints seguros
- Prevención de inconsistencias

🧠 Reglas de negocio (obligatorias)

1. El stock NUNCA puede quedar negativo
2. Toda modificación genera un StockMovement
3. Las transferencias son atómicas
4. El stock no se elimina, solo se ajusta
5. Ventas y stock comparten lógica (reutilizable)