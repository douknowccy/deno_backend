import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { verifyJwt } from "../utils/jwt.ts";
import { Status, StatusMsg } from "../utils/httpStatus.ts";
// 鑑權路由在這添加
const restrictedPaths = [
  { path: "logout", method: [] },
  { path: "/cmsTemplate", method: ["POST"] },
];

const authMiddleware = async (ctx: Context, nextFn: () => Promise<unknown>) => {
  const isNeedAuthorization = restrictedPaths.findIndex((item) => {
    const { path, method } = item;
    if (path === ctx.request.url.pathname) {
      // 若為空 默認全部都要鑑權
      if (method.length === 0) return true;
      // 若不為空 則便利看看是否https method 方法有被添加
      return (
        method.includes(ctx.request.method)
      );
    }
  });
  if (isNeedAuthorization<0) {
    await nextFn();
    return;
  }

    const authorization = await ctx.request.headers.get("authorization")||"";
  
    if (!authorization) {
      ctx.response.status = Status.Unauthorized;
      ctx.response.body = {
        message: StatusMsg[Status.Unauthorized],
        successful: false,
      };
    }
    const isVerfyJwt = await verifyJwt(authorization);

    if (isVerfyJwt) {
      await nextFn();
      return;
    }
  
};
export default authMiddleware;
