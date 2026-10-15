<p align="center">
  <img src="public/logo.png" alt="Tattamam Logo" width="200" />
</p>

<h1 align="center">Tattamam</h1>

<p align="center">
  <strong>A personalized Turkish recipe catalog website with dynamic serving/tone adjustments, smart ingredient-based search, and full-stack architecture.</strong>
</p>

<p align="center">
  <a href="https://tattamam.com.tr">Live Site</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#features">Features</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#tech-stack">Tech Stack</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#architecture">Architecture</a>&nbsp;&nbsp;·&nbsp;&nbsp;
  <a href="#getting-started">Getting Started</a>
</p>

---

## Overview

**Tattamam** (Turkish word play by combining "savour" & "just right") is a recipe discovery platform designed to adapt recipes to each user on the fly. Visitors can scale serving sizes and watch ingredients and instructions recalculate in real-time, switch between traditional and metric measurement modes, find recipes based on ingredients they already have at home, and interact through likes, favorites, and feedback.

The project is built as a modern **server-rendered Next.js application** with a clear separation between the data access layer, server actions, and presentation components — deployed to a shared cPanel/Apache environment via a custom Node.js server.

## Features

| Feature                         | Description                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dynamic Recipe Adjustment**   | Real-time recalculation of ingredient quantities / instructions tone through a custom slider control — supports both traditional (cups, tablespoons) and exact (grams, milliliters) measurement modes. |
| **Smart Recipe Finder**         | Multi-ingredient search allowing users to select what they have at home and discover matching recipes ranked by ingredient coverage and maximum servings achievable.                                   |
| **Recipe Detail Pages**         | Rich detail views with sectioned ingredients, step-by-step preparation instructions, cooking tips, similar recipe suggestions, and interactive like/favorite actions.                                  |
| **Full-Text Search**            | Keyword-based recipe search with dynamic result pagination using server-rendered pages.                                                                                                                |
| **Category & Tag Taxonomy**     | Hierarchical content organization through categories and tags (core ingredients, dominant ingredients, cooking techniques) with dedicated hub pages.                                                   |
| **User Authentication**         | Credential-based authentication (NextAuth.js + JWT) with registration, email verification, password reset, and profile management flows.                                                               |
| **User Profiles**               | Personal dashboards with favorite recipe collections and account security settings.                                                                                                                    |
| **Cookie Consent Banner**       | GDPR-aware cookie banner with granular consent management.                                                                                                                                             |
| **SEO Optimization**            | Dynamic sitemap generation, robots.txt, JSON-LD structured data (Recipe, Website schemas), Open Graph / Twitter Card metadata, and canonical URL management.                                           |
| **Image Optimization Pipeline** | Cloudinary CDN integration with on-the-fly URL transformations (format negotiation, quality compression, responsive sizing) and LQIP blur placeholders.                                                |
| **Custom 404 Page**             | Branded not-found experience with animated illustrations.                                                                                                                                              |
| **Feedback System**             | Contact form with server-side validation (Zod) and transactional email delivery (Nodemailer).                                                                                                          |
| **Production Build Packaging**  | Automated ZIP archive generation for cPanel deployment with manifest validation.                                                                                                                       |
| **Structured Logging**          | Pino-based logging with environment-aware log levels and pretty-printed development output.                                                                                                            |

## Tech Stack

### Core Framework

| Technology                                   | Version | Purpose                                                                        |
| -------------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| [Next.js](https://nextjs.org)                | 16      | React framework — App Router, Server Components, Server Actions, `'use cache'` |
| [React](https://react.dev)                   | 19      | UI rendering with Server and Client Components                                 |
| [TypeScript](https://www.typescriptlang.org) | 5       | Static type safety across the entire codebase                                  |

### Styling

| Technology                                 | Purpose                                                   |
| ------------------------------------------ | --------------------------------------------------------- |
| [Tailwind CSS](https://tailwindcss.com) v4 | Utility-first styling with `@theme` design tokens         |
| [PostCSS](https://postcss.org)             | CSS pipeline via `@tailwindcss/postcss`                   |
| Google Fonts (Lora, Figtree)               | Typography — loaded via `next/font` for zero layout shift |

### Backend & Data

| Technology                                               | Purpose                                                          |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| [Prisma](https://www.prisma.io) v7                       | ORM with type-safe query builder and schema migrations           |
| [MySQL](https://www.mysql.com)                           | Relational database via `@prisma/adapter-mariadb` driver adapter |
| [NextAuth.js](https://next-auth.js.org)                  | Authentication (Credentials provider, JWT sessions)              |
| [bcrypt.js](https://github.com/nicolo-ribaudo/bcrypt.js) | Secure password hashing                                          |
| [Zod](https://zod.dev) v4                                | Runtime schema validation for forms and Server Actions           |
| [Nodemailer](https://nodemailer.com)                     | Transactional email (verification, password reset)               |

### Infrastructure & Tooling

| Technology                                          | Purpose                                                          |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| [Pino](https://getpino.io)                          | Structured JSON logging with `pino-pretty` dev transport         |
| [Cloudinary](https://cloudinary.com)                | Image CDN with URL-based transformations                         |
| [Google Tag Manager](https://tagmanager.google.com) | Analytics via `@next/third-parties`                              |
| [ESLint](https://eslint.org) v9                     | Linting with Next.js Core Web Vitals + TypeScript rules          |
| Custom Node.js Server                               | Production entry point for Phusion Passenger / cPanel deployment |

### Key Development Patterns

| Pattern                           | Implementation                                                                                                                                                     |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Data Access Layer (DAL)**       | Dedicated `src/lib/dal/` modules encapsulate all Prisma queries — components never touch the ORM directly.                                                         |
| **Data Transfer Objects (DTOs)**  | Strictly-typed serialization contracts (`src/lib/dto.ts`) bridge server → client boundaries, converting Prisma types (e.g., `Decimal`) to JSON-safe primitives.    |
| **Server Actions**                | Form mutations and interactions (auth, feedback, likes, favorites, search) handled via colocated `src/app/actions/` modules.                                       |
| **Server/Client Component Split** | Server Components own data fetching; Client Components own interactivity — following the "fetch in the parent, render in the child" pattern.                       |
| **Design Token System**           | Material Design 3 color palette and typography scale defined as Tailwind `@theme` CSS custom properties — enabling a single source of truth for the design system. |
| **Visitor Identity**              | Cookie + IP fingerprinting with SHA-256 hashing for anonymous interaction tracking (likes) without requiring user accounts.                                        |
| **Singleton Database Client**     | Global Prisma instance with development HMR resilience and configurable MariaDB connection pooling.                                                                |

## Architecture

```
tattamam/
├── prisma/
│   ├── schema.prisma            # Database schema (12 models)
│   └── migrations/              # SQL migration history
├── public/                      # Static assets (favicons, hero images)
├── scripts/
│   ├── package-build.mjs        # Deployment ZIP packaging
│   ├── bulk-index.ts            # Batch recipe indexing utility
│   └── compress.js              # Asset compression helper
├── src/
│   ├── app/
│   │   ├── (home)/              # Homepage (hero carousel, trending, classical, innovative sections)
│   │   ├── tarif/[slug]/        # Recipe detail pages (dynamic routes)
│   │   ├── arama/[keyword]/     # Full-text search results
│   │   ├── mutfaktaki-malzemelerle/  # Smart ingredient-based recipe finder
│   │   ├── kategori/[slug]/     # Category hub pages
│   │   ├── etiket/[keyword]/    # Tag hub pages
│   │   ├── profil/              # User profile & favorites
│   │   ├── auth/                # Email verification & password reset
│   │   ├── bilgi/               # About, contact, legal pages
│   │   ├── api/auth/            # NextAuth.js API route
│   │   ├── actions/             # Server Actions (auth, feedback, interaction, search, smart)
│   │   ├── sitemap.ts           # Dynamic XML sitemap generator
│   │   ├── robots.ts            # robots.txt generator
│   │   └── globals.css          # Tailwind theme + custom component styles
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, Hero Carousel, Cookie Banner
│   │   ├── recipe/              # Recipe cards, detail panels, ingredient checklist, servings control
│   │   ├── smart/               # Smart recipe finder interface
│   │   ├── search/              # Search results components
│   │   ├── category/            # Category listing & detail pages
│   │   ├── profile/             # Profile page & security settings
│   │   ├── auth/                # Verification & password reset forms
│   │   ├── info/                # About, contact, legal page components
│   │   ├── seo/                 # JSON-LD schema generators (Recipe, Category, Website)
│   │   ├── interrupt/           # Not-found page
│   │   └── ui/                  # Shared primitives (Spinner, LikeButton, ScrollReset)
│   ├── lib/
│   │   ├── dal/                 # Data Access Layer (home, recipe, search, smart, taxonomy, feedback, user)
│   │   ├── mail/                # Email service (Nodemailer + HTML templates)
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── dto.ts               # Data Transfer Object type definitions
│   │   ├── auth.ts              # NextAuth.js configuration
│   │   ├── identity.ts          # Visitor fingerprinting utilities
│   │   └── logging.ts           # Pino logger configuration
│   ├── utils/                   # Cloudinary URL builder, Turkish text helpers, common utilities
│   └── types/                   # TypeScript module augmentations (next-auth)
├── server.js                    # Custom HTTP server (Phusion Passenger)
├── next.config.ts               # Next.js configuration (images, caching, build)
├── tailwind.config / postcss    # CSS toolchain configuration
├── tsconfig.json                # TypeScript compiler options
└── eslint.config.mjs            # ESLint flat config
```

## Getting Started

### Prerequisites

| Requirement                    | Version |
| ------------------------------ | ------- |
| [Node.js](https://nodejs.org)  | ≥ 22    |
| [npm](https://www.npmjs.com)   | ≥ 10    |
| [MariaDB](https://mariadb.org) | ≥ 10.6  |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ugzorlu/tattamam.git
cd tattamam

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and secrets

# 4. Generate the Prisma client
npx prisma generate

# 5. Run database migrations
npx prisma migrate dev

# 6. Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start development server with Turbopack     |
| `npm run build`   | Production build (Webpack) + deployment ZIP |
| `npm run start`   | Run production server (`server.js`)         |
| `npm run lint`    | Run ESLint checks                           |
| `npm run analyze` | Analyze bundle with `@next/bundle-analyzer` |

### Environment Variables

Copy `.env.example` to `.env` and fill in the required values. See the [.env.example](.env.example) file for all available variables and their descriptions.

## Deployment

The project is configured for deployment on **cPanel/Apache** environments running Phusion Passenger:

1. Run `npm run build` to generate the production build and deployment ZIP.
2. Upload the generated `tattamam-build.zip` to the server.
3. Extract and configure the Node.js application via cPanel.

The custom `server.js` entry point handles Node.js ↔ Passenger integration with tuned keep-alive and headers timeouts.

## License

This project is proprietary software. All rights reserved.

See the [LICENSE](LICENSE) file for details.
