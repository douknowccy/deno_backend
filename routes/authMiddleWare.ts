import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { verifyJwt } from "../utils/jwt.ts";
import { AllStatus, AllStatusMsg } from "../utils/httpStatus.ts";
// 鑑權路由在這添加
const restrictedPaths = ["/logout"];

const authMiddleware = async (ctx: Context, nextFn: () => Promise<unknown>) => {
  try {
    const isNeedAuthorization =
      restrictedPaths.some((path) =>
        ctx.request.url.pathname.startsWith(path)
      ) 

    if (!isNeedAuthorization) {
      await nextFn();
      return;
    }
    const authorization = await ctx.request.headers.get("authorization");
    if (!authorization) {
      ctx.response.status = AllStatus.NotAcceptable;
      ctx.response.body = {
        message: AllStatusMsg[AllStatus.NotAcceptable],
        successful: false,
      };
      return;
    }
    const isVerfyJwt = await verifyJwt(authorization);
    if (isVerfyJwt) {
      await nextFn();
      return;
    }
  } catch (_) {
    ctx.response.status = AllStatus.Unauthorized;
    ctx.response.body = {
      message: AllStatusMsg[AllStatus.Unauthorized],
      successful: false,
    };
  }
};
export default authMiddleware;
