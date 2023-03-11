import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { verifyJwt } from "../utils/jwt.ts";
import {AllStatus,AllStatusMsg} from '../utils/httpStatus.ts'
const restrictedPaths = ["/logout", "/refresh"];

const authMiddleware = async (ctx: Context, nextFn: () => Promise<unknown>) => {
  const isNeedAuthorization = restrictedPaths.some((path) =>
    ctx.request.url.pathname.startsWith(path)
  );
  if (!isNeedAuthorization) {
    await nextFn();
    return;
  }
  const authorization = (await ctx.request.headers.get("authorization")) || "";
  try {
    const isVerfyJwt = await verifyJwt(authorization);

    if (isVerfyJwt) {
      await nextFn();
      return;
    }
  } catch (err) {
    console.log({err})
    ctx.response.status = AllStatus.Unauthorized;
    ctx.response.body = {
        message: AllStatusMsg[AllStatus.Unauthorized],
        successful:false
    };
  }
};
export default authMiddleware;
