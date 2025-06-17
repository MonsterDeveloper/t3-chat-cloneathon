import { anonymousClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { useRouteLoaderData } from "react-router"
import type { loader } from "~/root"

export const { signIn, signUp, signOut } = createAuthClient({
  plugins: [anonymousClient()],
})

export function useViewer() {
  const rootLoaderData = useRouteLoaderData<typeof loader>("root")

  if (!rootLoaderData) {
    throw new Error("Root loader data is not available")
  }

  if (!rootLoaderData.viewer) {
    throw new Error("No viewer found in the root loader.")
  }

  return rootLoaderData.viewer
}
