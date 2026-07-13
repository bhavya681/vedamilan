# Folder Structure

```
app/                 Next.js routes, layouts, metadata, API
  (landing)/         Marketing experience
  (auth)/            Authentication shells
  (dashboard)/       Authenticated member workspace
  api/               Route handlers
  maintenance/       Maintenance page
components/
  ui/                Design-system primitives (shadcn-compatible)
  layout/            Navbar, footer, sidebar, mobile nav
  providers/         Theme + query providers
  animations/        Motion helpers
features/            Vertical slices by product domain
lib/
  database/          Prisma + Redis adapters
  services/          External system clients
  utils/             Cross-cutting helpers
  validators/        Zod schemas
  constants/         Brand + routes
  emails/            Transactional templates
config/              Site and navigation config
hooks/               Shared client hooks
types/               Shared types
generated/prisma/    Prisma client output (generated)
```

Each feature exports a stable public surface from `index.ts` to keep imports intentional as the codebase grows.
