# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: NestJS service with domain modules in `src/`, database schema and seeds under `prisma/`, and Jest specs in `test/`. Persisted uploads live in `uploads/`.
- `frontend/`: Uni-app (Vue 3 + Vite) client; pages and components are in `src/`, with static assets in `public/`.
- `docs/`: Process playbooks (QA, deployment, scripts) that set expectations for reviews and release readiness.
- `scripts/`: Bash helpers such as `dev.sh`, `db-setup.sh`, and `build.sh` orchestrate Docker services and multi-package workflows.
- Root-level `docker-compose.yml` provisions PostgreSQL and Redis; `.env.example` files in each package document required secrets.

## Build, Test, and Development Commands
```bash
# Backend service
cd backend
npm install
npm run start:dev     # Watch-mode API server
npm run build         # Compile to dist/
npm run test:cov      # Jest unit tests with coverage

# Frontend client
cd frontend
npm install
npm run dev:mp-weixin # Mini-program dev server
npm run dev:h5        # H5 preview
npm run lint          # ESLint + Vue rules

# Full-stack helpers
./scripts/dev.sh      # Boots backend, frontend, and infrastructure
docker compose up -d  # Launch Postgres (5434) and Redis (6380)
```

## Coding Style & Naming Conventions
- Format TypeScript with Prettier (`tabWidth: 2`, `singleQuote: true`, `printWidth: 100`); nest CLI generates module/service/controller scaffolding that should be preserved.
- Enforce ESLint (`npm run lint`) before opening a PR; backend fixes are auto-applied with `npm run lint`.
- Name Nest modules and services with `PascalCaseModule`, `PascalCaseService`; controllers expose REST routes with explicit verbs and Swagger decorators.
- Vue single-file components use PascalCase filenames, Composition API, and strongly typed `defineProps`. Keep components under 300 lines per the QA checklist.

## Testing Guidelines
- Place backend specs beside features in `src/**` or under `test/`, suffixed with `.spec.ts`; aim for ≥70% coverage (`npm run test:cov`) and include scenario-driven names (`should_return_profile_when_user_exists`).
- Exercise Prisma migrations with `npm run prisma:migrate`; regenerate clients with `npm run prisma:generate` after schema edits.
- For frontend changes, run `npm run type-check` and linting; add Vitest or e2e coverage when introducing complex UI logic.
- API integration scripts (e.g., `test_cosyvoice_api.py`) require valid environment keys—replace hard-coded tokens with env vars before execution.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`type(scope): summary`), e.g., `feat(auth): add refresh-token guard`. Group related changes and keep commits focused.
- Ensure pre-commit checks (`npm run lint`, `npm run format`, `npm run test`) succeed locally; attach coverage deltas if they drop below targets.
- Pull requests must describe the change, list verification steps, link the tracking issue, and include screenshots or API responses for UI/API work.
- Highlight migration impacts, new env variables, or external service dependencies in the PR body to streamline reviewer setup.

## Security & Configuration Tips
- Copy `.env.example` to `.env` for each package and avoid committing real keys. Reference secrets in code via `process.env`.
- Run `npm audit` routinely and patch critical vulnerabilities before release.
- When testing external services, store generated artifacts under `logs/` or `uploads/` and scrub credentials from shared logs.
