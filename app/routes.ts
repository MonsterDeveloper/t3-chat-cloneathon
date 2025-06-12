import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("chat", "routes/chat.tsx"),
  route("api/auth/*", "routes/api/auth.ts"),
  route("sign-in", "routes/sign-in.tsx"),
] satisfies RouteConfig
