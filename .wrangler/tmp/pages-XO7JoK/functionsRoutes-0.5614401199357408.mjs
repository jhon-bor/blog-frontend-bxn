import { onRequest as __api_github_posts_js_onRequest } from "/Users/jhon/clacky_workspace/blog/functions/api/github-posts.js"
import { onRequest as __api___path___ts_onRequest } from "/Users/jhon/clacky_workspace/blog/functions/api/[[path]].ts"

export const routes = [
    {
      routePath: "/api/github-posts",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_github_posts_js_onRequest],
    },
  {
      routePath: "/api/:path*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___path___ts_onRequest],
    },
  ]