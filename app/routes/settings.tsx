import { ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

export default function SettingsPage() {
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
          <Button variant="ghost">
            <ArrowLeft className="mr-2 size-4" />
            Back to chat
          </Button>
          <div className="flex flex-row items-center gap-2">
            <Button variant="ghost">Sign out</Button>
          </div>
        </header>
        <div className="flex flex-grow flex-col gap-4 md:flex-row">
          <div className="hidden flex-col items-center justify-center md:flex md:w-1/4">
            <Avatar className="mx-auto size-40">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="mt-4 text-center font-bold text-2xl transition-opacity duration-200">
              Shadcn
            </h1>
            <p className="text-center text-muted-foreground">
              andrei@example.com
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
                <div className="mt-20">
                  <div className="w-fit space-y-2 border-0 border-muted-foreground/10">
                    <h2 className="font-bold text-2xl">Danger Zone</h2>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <p className="px-px py-1.5 text-muted-foreground/80 text-sm">
                          Permanently delete your account and all associated
                          data.
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Are you absolutely sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="customization" className="space-y-6">
                <h2 className="font-bold text-2xl">Visual Options</h2>
                <div className="flex items-center justify-between gap-x-1">
                  <div className="space-y-2">
                    <Label>Hide Personal Information</Label>
                    <p className="text-muted-foreground text-sm">
                      Hides your name and email from the UI.
                    </p>
                  </div>
                  <Switch />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}
