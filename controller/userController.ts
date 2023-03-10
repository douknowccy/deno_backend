import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { loginUser, registerUser } from "../services/usersService.ts";

export const register = async (ctx: Context) => {
  const {
    account,
    password,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  const responseBody ={
    msg:"",
  }
  if (!account || !password) {
    ctx.response.status = 406;
    ctx.response.body = {...responseBody,msg:"參數錯誤"};
    return;
  }
  const data = await registerUser({ account, password });
  if (data.error) {
    ctx.response.status = 410;
    ctx.response.body = {...responseBody,msg:data.error}
    return;
  }
  ctx.response.status = 200;
  ctx.response.body = {...responseBody,...data}
};
export const login = async (ctx: Context) => {
  const {
    account,
    password,
    
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  const responseBody ={
    msg:"",
  }
  if (!account || !password) {
    ctx.response.status = 406;
    ctx.response.body = {...responseBody,msg:"參數錯誤"};
    return;
  }
  const data =await loginUser({account,password})
  ctx.response.status = 200;
  ctx.response.body = {...responseBody,...data}
}
export const logout = async (ctx: Context) => {}
export const refresh = async (ctx: Context) => {}