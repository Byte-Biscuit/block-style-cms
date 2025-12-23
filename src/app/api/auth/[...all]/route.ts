import { getAuth } from "@/lib/auth/auth"; // 引入我们优化后的动态获取函数
import { toDynamicNextJsHandler } from "@/lib/auth/auth-adapter"; // 引入上面的适配器

// 这里的 GET/POST 仅仅是 wrapper 函数
// 真正的 getAuth() 逻辑会等到 HTTP 请求真正打进来那一刻才执行
export const { GET, POST, PATCH, PUT, DELETE } = toDynamicNextJsHandler(getAuth);