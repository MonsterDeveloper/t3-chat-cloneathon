import {
  type RouteConfig,
  index,
  prefix,
  route,
} from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  ...prefix("api", [
    route("auth/*", "routes/api/auth.ts"),
    route("chat", "routes/api/chat.ts"),
  ]),
  route("sign-in", "routes/sign-in.tsx"),
  ...prefix("chats", [
    index("routes/chats/index.ts"),
    route(":chatId", "routes/chats/chat.tsx"),
  ]),
  route("settings", "routes/settings.tsx"),
] satisfies RouteConfig
