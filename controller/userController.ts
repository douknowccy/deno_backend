
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser,
} from "../services/usersService.ts";
import { Status, StatusMsg } from "../utils/httpStatus.ts";

export const register = async (ctx: Context) => {
  const {
    account,
    password,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;
  const responseBody = {
    message: "",
    successful: true,
  };
  if (!account || !password) {
    ctx.response.status = Status.NotAcceptable;
    ctx.response.body = {
      ...responseBody,
      message: StatusMsg[Status.NotAcceptable],
      successful: false,
    };
    return;
  }
  const data = await registerUser({ account, password });
  // if (data.error) {
  //   ctx.response.status = Status.OK;
  //   ctx.response.body = {
  //     ...responseBody,
  //     message: data.error,
  //     successful: false,
  //   };
  //   return;
  // }
  ctx.response.status = Status.OK;
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
    message: "",
    successful: true,
  };
  if (!account || !password) {
    ctx.response.status = Status.NotAcceptable;
    ctx.response.body = {
      ...responseBody,
      message: StatusMsg[Status.NotAcceptable],
      successful: false,
    };
    return;
  }
  const data = await loginUser({ account, password });
  ctx.response.status = Status.OK;
  ctx.response.body = { ...responseBody, ...data };
};
export const logout = async (ctx: Context) => {
  const responseBody = {
    message: "",
    successful: true,
  };
  const {
    account,
  }: {
    account: string;
    password: string;
  } = await ctx.request.body().value;

  const data = await logoutUser({ account });
  if (data?.error) {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = { ...responseBody, ...data };
  }
  ctx.response.status = Status.OK;
  ctx.response.body = { ...responseBody, ...data };
};
export const refresh = async (ctx: Context) => {
  const responseBody = {
    message: "",
    successful: true,
  };

  const { refreshToken, account } = await ctx.request.body().value;
  if (!refreshToken || !account) {
    ctx.response.status = Status.NotAcceptable;
    ctx.response.body = {
      ...responseBody,
      message: StatusMsg[Status.NotAcceptable],
      successful: false,
    };
    return;
  }
  const { error, authorization } = await refreshUserToken({ account });
  if (error) {
    ctx.response.status = Status.Unauthorized;
    ctx.response.body = {
      ...responseBody,
      message: StatusMsg[Status.Unauthorized],
      successful: false,
    };
    return
  }

  ctx.response.status = Status.OK;
  ctx.response.body = {
    ...responseBody,
    authorization,
  };
};
