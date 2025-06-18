import { eq } from "drizzle-orm"
import { ArrowLeft } from "lucide-react"
import { useEffect } from "react"
import {
  type FetcherWithComponents,
  Link,
  redirect,
  useFetcher,
  useNavigate,
  useSearchParams,
} from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { user } from "~/database/auth-schema"
import { signOut, useViewer } from "~/lib/auth-client"
import { cn } from "~/lib/utils"
import type { Route } from "./+types/settings"

export const meta: Route.MetaFunction = () => [
  {
    title: "Settings | not T3 chat",
  },
  {
    name: "description",
    content: "Manage your account and preferences",
  },
]

export async function loader({ request, context }: Route.LoaderArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  return null
}

export default function SettingsPage() {
  const [searchParams] = useSearchParams()
  const rt = searchParams.get("rt")
  const viewer = useViewer()
  const navigate = useNavigate()
  const hidePersonalInfoFetcher = useFetcher()
  const isHidePersonalInfoEnabled = hidePersonalInfoFetcher.formData?.has(
    "isHidePersonalInfoEnabled",
  )
    ? hidePersonalInfoFetcher.formData.get("isHidePersonalInfoEnabled") ===
      "true"
    : viewer.isHidePersonalInfoEnabled

  // biome-ignore lint/correctness/useExhaustiveDependencies: We don't want to re-run this effect when the navigate function changes
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(rt ? `/chats/${rt}` : "/chats")
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => {
      window.removeEventListener("keydown", handleEscape)
    }
  }, [rt])

  return (
    <div className="h-screen w-full overflow-y-auto">
      <div className="-z-50 fixed inset-0 dark:bg-sidebar">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(closest-corner at 180px 36px, rgba(255, 255, 255, 0.17), rgba(255, 255, 255, 0)), linear-gradient(rgb(254, 247, 255) 15%, rgb(244, 214, 250))",
          }}
        />
        <div className="absolute inset-0 bg-noise" />
      </div>
      <main className="mx-auto flex max-w-[1200px] flex-col overflow-y-auto px-4 pt-6 pb-24 md:px-6 lg:px-8">
        <header className="flex flex-row items-center justify-between pb-8">
          <Button variant="ghost" asChild>
            <Link
              to={{
                pathname: rt ? `/chats/${rt}` : "/chats",
              }}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back to chat
            </Link>
          </Button>
          <div className="flex flex-row items-center gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      navigate("/sign-in")
                    },
                  },
                })
              }
            >
              Sign out
            </Button>
          </div>
        </header>
        <div className="flex flex-grow flex-col gap-4 md:flex-row">
          <div className="hidden flex-col items-center justify-center md:flex md:w-1/4">
            <Avatar
              className={cn(
                "mx-auto size-40",
                isHidePersonalInfoEnabled && "blur-sm",
              )}
            >
              <AvatarImage src={viewer.image ?? undefined} />
              <AvatarFallback>
                {viewer.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1
              className={cn(
                "mt-4 text-center font-bold text-2xl transition-opacity duration-200",
                isHidePersonalInfoEnabled && "blur-sm",
              )}
            >
              {viewer.name}
            </h1>
            <p
              className={cn(
                "text-center text-muted-foreground",
                isHidePersonalInfoEnabled && "blur-sm",
              )}
            >
              {viewer.email}
            </p>
            <div className="mt-2 inline-flex items-center rounded-full bg-secondary px-3 py-1 font-medium text-secondary-foreground text-xs">
              Free plan
            </div>
            <div className="mt-8 w-full rounded-lg bg-card p-4">
              <span className="font-semibold text-sm">Keyboard Shortcuts</span>
              <div className="mt-6 grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Search</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      ⌘
                    </kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      K
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">New Chat</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      ⌘
                    </kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      Shift
                    </kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      O
                    </kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Toggle Sidebar</span>
                  <div className="flex gap-1">
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      ⌘
                    </kbd>
                    <kbd className="rounded bg-background px-2 py-1 font-sans text-sm">
                      B
                    </kbd>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-3/4 md:pl-12">
            <Tabs defaultValue="account">
              <TabsList className="mb-6">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="customization">Customization</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <h2 className="font-bold text-2xl">Pro Plan Benefits</h2>
                <p className="mt-6 text-muted-foreground/80 text-sm">
                  We don't have a pro plan yet 😭
                </p>
              </TabsContent>
              <TabsContent value="customization" className="space-y-6">
                <h2 className="font-bold text-2xl">Visual Options</h2>
                <HidePersonalInfo
                  fetcher={hidePersonalInfoFetcher}
                  isChecked={isHidePersonalInfoEnabled}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

function HidePersonalInfo({
  fetcher,
  isChecked,
}: { fetcher: FetcherWithComponents<unknown>; isChecked: boolean }) {
  return (
    <div className="flex items-center justify-between gap-x-1">
      <div className="space-y-2">
        <Label>Hide Personal Information</Label>
        <p className="text-muted-foreground text-sm">
          Hides your name and email from the UI.
        </p>
      </div>
      <Switch
        checked={isChecked}
        onCheckedChange={(checked) => {
          fetcher.submit(
            {
              isHidePersonalInfoEnabled: checked.toString(),
              intent: "hidePersonalInfo",
            },
            { method: "post" },
          )
        }}
      />
    </div>
  )
}

export async function action({ request, context }: Route.ActionArgs) {
  const session = await context.auth.api.getSession({
    headers: request.headers,
  })

  if (!session) {
    return redirect("/sign-in")
  }

  const formData = await request.formData()
  const intent = formData.get("intent")

  if (intent === "hidePersonalInfo") {
    await context.db
      .update(user)
      .set({
        isHidePersonalInfoEnabled:
          formData.get("isHidePersonalInfoEnabled") === "true",
      })
      .where(eq(user.id, session.user.id))

    return {
      ok: true,
    }
  }

  throw new Response("Invalid intent", { status: 400 })
}
