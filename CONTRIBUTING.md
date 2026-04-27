# Contributing to ProtoSpark

First off, thank you for considering contributing to ProtoSpark! It's people like you that make ProtoSpark such a great tool for the electronics community.

## Development Setup

### Prerequisites
- **Node.js**: v18.x or later
- **pnpm**: Recommended package manager
- **PostgreSQL**: Local or hosted (Neon recommended)
- **Google AI API Key**: For component scanning features

### Getting Started
1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/protospark.git
   cd protospark
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```

4. **Database Migration**:
   ```bash
   pnpm drizzle-kit push
   ```

5. **Run the development server**:
   ```bash
   pnpm dev
   ```

## Code Style & Conventions

### Design Philosophy
ProtoSpark follows a **Brutalist / Neo-Brutalist** aesthetic.
- Use sharp edges (radius: 0) where possible.
- Bold borders and high-contrast colors.
- Use the `neo` variant for buttons when appropriate.
- Refer to `dev_docs.md` for UI component specifics.

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4
- **ORM**: Drizzle ORM
- **UI Components**: shadcn/ui
- **Icons**: Phosphor Icons & Lucide

### Branching & PRs
- Create a feature branch from `main`: `feat/awesome-feature` or `fix/annoying-bug`.
- Keep PRs focused and small.
- Ensure `pnpm lint` and `pnpm typecheck` pass before submitting.

## Reporting Issues
- Use the GitHub Issue tracker.
- Provide a clear description and steps to reproduce.
- Include environment details (browser, OS, etc.).

## License
By contributing to ProtoSpark, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
