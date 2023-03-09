import { Context } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { registerUser } from "../services/usersService.ts";

export const register = async (ctx: Context) => {
  const {
    account,
    password,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  if (!account || !password) {
    ctx.response.status = 406;
    ctx.response.body = { msg: "paramters wrong" };
    return;
  }
  const data = await registerUser(account, password);
  if (data?.msg) {
    ctx.response.status = 410;
    ctx.response.body = { msg: data?.msg };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = { msg: "" };
};
