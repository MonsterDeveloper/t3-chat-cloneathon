import { Form } from "react-router"
import { signIn, signOut, signUp } from "~/auth-client"
import * as schema from "~/database/schema"
import type { Route } from "./+types/home"

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const guestBook = await context.db.query.guestBook.findMany({
    columns: {
      id: true,
      name: true,
    },
  })

  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  return {
    guestBook,
    session,
  }
}

export default function Home({
  loaderData: { session },
}: Route.ComponentProps) {
  console.log(session)

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-bold text-3xl text-gray-900">Welcome</h2>
          <p className="mt-2 text-gray-600 text-sm">
            Sign in to your account or create a new one
          </p>
        </div>

        {/* Social Sign In */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={() =>
              signIn.social({
                provider: "google",
              })
            }
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 text-sm shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-gray-300 border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">
                Or sign in with email
              </span>
            </div>
          </div>

          <Form
            onSubmit={(event) => {
              event.preventDefault()
              const email = (
                event.target as unknown as { email: HTMLInputElement }
              ).email.value
              const password = (
                event.target as unknown as { password: HTMLInputElement }
              ).password.value
              signIn.email({
                email,
                password,
              })
            }}
            className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block font-medium text-gray-700 text-sm"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block font-medium text-gray-700 text-sm"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <button
              type="submit"
              className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Sign in
            </button>
          </Form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-gray-300 border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>
        </div>

        <Form
          onSubmit={(event) => {
            event.preventDefault()
            const name = (event.target as unknown as { name: HTMLInputElement })
              .name.value
            const email = (
              event.target as unknown as { email: HTMLInputElement }
            ).email.value
            const password = (
              event.target as unknown as { password: HTMLInputElement }
            ).password.value
            signUp.email({
              email,
              password,
              name,
            })
          }}
          className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="mb-1 block font-medium text-gray-700 text-sm"
              >
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1 block font-medium text-gray-700 text-sm"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block font-medium text-gray-700 text-sm"
              >
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Create a password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 font-medium text-sm text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Account
          </button>
        </Form>

        {session && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h4 className="mb-2 font-medium text-green-800 text-sm">
              Session Data:
            </h4>
            <pre className="overflow-auto text-green-700 text-xs">
              <code>{JSON.stringify(session, null, 2)}</code>
            </pre>
          </div>
        )}

        {session && (
          <button
            onClick={() => signOut()}
            type="button"
            className="cursor-pointer rounded bg-black px-4 py-2 text-white"
          >
            Sign Out
          </button>
        )}
      </div>
    </main>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData()
  let name = formData.get("name")
  let email = formData.get("email")
  if (typeof name !== "string" || typeof email !== "string") {
    return { guestBookError: "Name and email are required" }
  }

  name = name.trim()
  email = email.trim()
  if (!name || !email) {
    return { guestBookError: "Name and email are required" }
  }

  try {
    await context.db.insert(schema.guestBook).values({ name, email })
  } catch {
    return { guestBookError: "Error adding to guest book" }
  }
}
