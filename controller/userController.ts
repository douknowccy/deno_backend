import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import { getNumericDate, verify } from "https://deno.land/x/djwt@v2.8/mod.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  generateKey,
  loginUser,
  logoutUser,
  registerUser,
} from "../services/usersService.ts";

export const register = async (ctx: Context) => {
  const {
    account,
    password,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  const responseBody = {
    msg: "",
  };
  if (!account || !password) {
    ctx.response.status = 406;
    ctx.response.body = { ...responseBody, msg: "參數錯誤" };
    return;
  }
  const data = await registerUser({ account, password });
  if (data.error) {
    ctx.response.status = 410;
    ctx.response.body = { ...responseBody, msg: data.error };
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = { ...responseBody, ...data };
};
export const login = async (ctx: Context) => {
  const {
    account,
    password,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  const responseBody = {
    msg: "",
  };
  if (!account || !password) {
    ctx.response.status = 406;
    ctx.response.body = { ...responseBody, msg: "參數錯誤" };
    return;
  }
  const data = await loginUser({ account, password });
  ctx.response.status = 200;
  ctx.response.body = { ...responseBody, ...data };
};
export const logout = async (ctx: Context) => {
  const responseBody = {
    msg: "",
  };
  const {
    account,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  const authorization = await ctx.request.headers.get("authorization");
  if(!authorization){
    ctx.response.status = 401;
    ctx.response.body = { ...responseBody, msg: "已過期,請重新登錄" };
    return;
  }
  const { JWT_KEY } = await load();
  const jwtKey = await generateKey(JWT_KEY);

  const { exp } = await verify(authorization!, jwtKey);
  if (!exp) throw new Error("exp undefinded");
  if (getNumericDate(0) > exp) {
    ctx.response.status = 401;
    ctx.response.body = { ...responseBody, msg: "已過期,請重新登錄" };
    return;
  }
  const data = await logoutUser({ account });
  if (data?.error) {
    throw new Error(data?.error);
  }
  ctx.response.status = 200;
  ctx.response.body = { ...responseBody, ...data };
};
export const refresh = async (ctx: Context) => {};
