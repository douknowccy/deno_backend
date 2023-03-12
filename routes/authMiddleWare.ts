import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { verifyJwt } from "../utils/jwt.ts";
import { Status, StatusMsg } from "../utils/httpStatus.ts";
// 鑑權路由在這添加
const restrictedPaths = ["/logout"];

const authMiddleware = async (ctx: Context, nextFn: () => Promise<unknown>) => {

    const isNeedAuthorization = restrictedPaths.some((path) =>
      ctx.request.url.pathname.startsWith(path)
    );
   
    if (!isNeedAuthorization) {
      await nextFn();
      return;
    }
    try {
    const authorization = await ctx.request.headers.get("authorization");
    if (!authorization) {
        throw new Error("")
    
    }
    const isVerfyJwt = await verifyJwt(authorization);
    if (isVerfyJwt) {
      await nextFn();
      return;
    }
  } catch (_) {        
        ctx.response.status = Status.Unauthorized
        ctx.response.body = {
          message: StatusMsg[Status.Unauthorized],
          successful: false,
        };
   
  }
};
export default authMiddleware;
