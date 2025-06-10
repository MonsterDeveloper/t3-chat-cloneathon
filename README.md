## Getting Started

### Installation

- Install [Bun](https://bun.sh/)
- Install [Node.js](https://nodejs.org/)

Install the dependencies:

```bash
bun i
```

### Development

Run an initial database migration:

```bash
bun db:push
```

Start the development server with HMR:

```bash
bun dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

Deployment is done using the Wrangler CLI.

First, you need to create a d1 database in Cloudflare.

```sh
bunx wrangler d1 create <name-of-your-database>
```

Be sure to update the `wrangler.toml` file with the correct database name and id.

You will also need to [update the `drizzle.config.ts` file](https://orm.drizzle.team/docs/guides/d1-http-with-drizzle-kit), and then run the production migration:

```sh
bun db:generate
```

```sh
bun db:migrate
```

To build and deploy directly to production:

```sh
bun run deploy
```

To deploy a preview URL:

```sh
bunx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
bunx wrangler versions deploy
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
