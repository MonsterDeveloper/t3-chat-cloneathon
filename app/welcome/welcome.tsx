import { Form, useNavigation } from "react-router"

import logoDark from "./logo-dark.svg"
import logoLight from "./logo-light.svg"

export function Welcome({
  guestBook,
  guestBookError,
}: {
  guestBook: {
    name: string
    id: number
  }[]
  guestBookError?: string
}) {
  const navigation = useNavigation()

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex min-h-0 flex-1 flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="w-full max-w-[300px] space-y-6 px-4">
          <nav className="space-y-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
            <p className="text-center text-gray-700 leading-6 dark:text-gray-200">
              What&apos;s next?
            </p>
          </nav>
          <section className="space-y-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
            <Form
              method="post"
              className="w-full max-w-lg space-y-4"
              onSubmit={(event) => {
                if (navigation.state === "submitting") {
                  event.preventDefault()
                }
                const form = event.currentTarget
                requestAnimationFrame(() => {
                  form.reset()
                })
              }}
            >
              <input
                aria-label="Name"
                name="name"
                placeholder="Name"
                required
                className="h-10 w-full rounded-lg border border-gray-200 px-3 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500"
              />
              <input
                aria-label="Email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                className="h-10 w-full rounded-lg border border-gray-200 px-3 focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={navigation.state === "submitting"}
                className="h-10 w-full rounded-lg bg-blue-500 px-3 text-white hover:bg-blue-600"
              >
                Sign Guest Book
              </button>
              {guestBookError && (
                <p className="text-red-500 dark:text-red-400">
                  {guestBookError}
                </p>
              )}
            </Form>
            <ul className="text-center">
              {guestBook.map(({ id, name }) => (
                <li key={id} className="p-3">
                  {name}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  )
}
