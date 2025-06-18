import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router"

import type { Route } from "./+types/root"
import "./app.css"
import { useTheme } from "next-themes"
import type { ReactNode } from "react"
import { ClientOnly } from "./components/client-only"
import { ThemeProvider } from "./components/theme-provider"
import { Button } from "./components/ui/button"

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "icon",
    type: "image/png",
    sizes: "1024x1024",
    href: "/icon.png",
  },
  {
    rel: "apple-touch-icon",
    href: "/apple-icon.png",
    type: "image/png",
    sizes: "1024x1024",
  },
]

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  return { viewer: session?.user }
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" enableColorScheme>
          <ClientOnly fallback={<div className="min-h-screen bg-background" />}>
            {() => <ThemeWrapper>{children}</ThemeWrapper>}
          </ClientOnly>
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

const ThemeWrapper = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme()

  return <div className={theme}>{children}</div>
}

export default function App() {
  return <Outlet />
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!"
  let details = "An unexpected error occurred."
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error"
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="container mx-auto p-4 pt-16 text-center">
      <h1 className="font-bold text-4xl text-primary">{message}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
      <Button className="mt-4" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </main>
  )
}
