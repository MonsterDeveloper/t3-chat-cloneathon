import { UserX } from "lucide-react"
import type { ComponentProps } from "react"
import { redirect, useNavigate } from "react-router"
import { signIn } from "~/auth-client"
import { cn } from "~/lib/utils"
import type { Route } from "./+types/sign-in"

export async function loader({ context, request }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (session) {
    return redirect("/chat")
  }

  return null
}

export default function SignInPage() {
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <h1 className="mb-5 h-5 font-bold text-foreground text-xl">
        Welcome to
        <img
          alt="T3 Chat logo"
          loading="lazy"
          width="96"
          height="20"
          decoding="async"
          data-nimg="1"
          className="-mt-1 ml-1.5 inline-block"
          src="/demo_wordmark.svg"
        />
      </h1>
      <p className="mb-8 text-muted-foreground">
        This is <i>NOT</i> an actual T3 Chat. It's a submission for the
        Cloneathon.
      </p>
      <div className="w-full max-w-sm space-y-4">
        <LoginButton
          onClick={() => {
            signIn.social({
              provider: "google",
            })
          }}
        >
          <svg
            className="mr-3 h-6 w-6"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Google</title>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </LoginButton>

        <LoginButton
          onClick={async () => {
            signIn.anonymous({
              fetchOptions: {
                onSuccess: () => {
                  navigate("/chat", { replace: true })
                },
              },
            })
          }}
          className="bg-gray-600 hover:bg-gray-700 active:bg-gray-600 disabled:active:bg-gray-600 disabled:hover:bg-gray-600 dark:bg-gray-700/20 dark:active:bg-gray-700/40 disabled:dark:active:bg-gray-700/20 dark:hover:bg-gray-700/70 disabled:dark:hover:bg-gray-700/20"
        >
          <UserX className="mr-3 h-6 w-6" />
          Continue as Guest
        </LoginButton>
      </div>
    </main>
  )
}

function LoginButton({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "button-reflect inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border-reflect bg-[rgb(162,59,103)] p-2 px-4 py-2 font-medium text-base text-white shadow backdrop-blur-sm transition-all hover:bg-[#d56698] hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:bg-[rgb(162,59,103)] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:bg-[rgb(162,59,103)] disabled:hover:bg-[rgb(162,59,103)] dark:bg-primary/20 dark:active:bg-pink-800/40 disabled:dark:active:bg-primary/20 dark:hover:bg-pink-800/70 disabled:dark:hover:bg-primary/20 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0",
        className,
      )}
      type="button"
      {...props}
    />
  )
}
