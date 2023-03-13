import pool from "../db/postgres.ts";
import {
  create,
  getNumericDate,
} from "https://deno.land/x/djwt@v2.8/mod.ts";
import redis from "../db/redis.ts";
import { crypto } from "https://deno.land/std@0.179.0/crypto/mod.ts";
import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import {
  PoolClient,
  Transaction,
} from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { gernerateJwt, verifyJwt } from "../utils/jwt.ts";
interface LoginProps {
  account: string;
  password: string;
}
const encoder = new TextEncoder();
export const generateKey = async (secretKey: string) => {
  const keyBuf = encoder.encode(secretKey);
  return await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"]
  );
};

export const isAccountExistedOnDb = async (
  transaction: Transaction | PoolClient,
  account: string
) => {
  if (!account) throw new Error("帳號參數錯誤");
  const { rows } = await transaction.queryObject<{
    account?: string;
    password?: string;
  }>`SELECT account,password FROM users WHERE account = ${account}`;

  return { rows };
};

export const registerUser = async ({ account, password }: LoginProps) => {
  const returnParams = {
    error: "",
  };

  const client = await pool.connect();
  const transaction = client.createTransaction("my_transaction_name");
  await transaction.begin();

  await transaction.queryObject`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    account VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    registration_date TIMESTAMP
);`;
  const { rows: userList } = await isAccountExistedOnDb(transaction, account);

  if (userList.length > 0) {
    const account = userList[0].account;
    returnParams.error = `帳號${account}已存在`;
    return returnParams;
  }

  const bcryptPassowrd = await bcrypt.hash(password);

  const registration_date = new Date();
  await transaction.queryArray`INSERT INTO users 
     (account, password,registration_date) VALUES (${account}, ${bcryptPassowrd},${registration_date})`;
  await transaction.commit();
  const { authorization, refreshToken } = await gernerateJwt({});

  await redis.set(`jwt_refreshToken_${account}`, refreshToken!);
  return { ...returnParams, refreshToken, authorization };
};

export const loginUser = async ({ account, password }: LoginProps) => {
  const returnParams = {
    error: "",
    authorization:"",
    refreshToken:""
  };

  const client = await pool.connect();
  const { rows } = await isAccountExistedOnDb(client, account);
  client.end();
  if (rows.length === 0) {
    return { ...returnParams, error: "查無此帳號" };
  }
  const isPasswordCorrect = await bcrypt.compare(password, rows[0].password!);

  if (!isPasswordCorrect) {
    return { ...returnParams, error: "密碼錯誤" };
  }

  const { refreshToken, authorization } = await gernerateJwt({});

  // 更新新的refresh token
  await redis.set(`jwt_refreshToken_${account}`, refreshToken!);

  return { ...returnParams, authorization, refreshToken };
};
export const logoutUser = async ({ account }: { account: string }) => {
  const returnParams = {
    error: "",
  };
  const client = await pool.connect();
  const { rows } = await isAccountExistedOnDb(client, account);
  client.end();
  if (rows.length === 0) {
    return { ...returnParams, error: "查無此帳號" };
  }
  await redis.del(`jwt_refreshToken_${account}`);
};
export const refreshUserToken = async ({ account }: { account: string }) => {
  const returnParams = {
    error: "",
  };
  const refreshTokenExistedInRedis = await redis.get(
    `jwt_refreshToken_${account}`
  );
  if (!refreshTokenExistedInRedis) {
    return {
      ...returnParams,
      error: "無refreshToken",
    };
  }
  const isRefreshTokenVerified = await verifyJwt(refreshTokenExistedInRedis);
  if (!isRefreshTokenVerified) {
    return {
      ...returnParams,
      error: "refreshToken 失效啊寶",
    };
  }

  const { authorization } = await gernerateJwt({
    isGenerateJWT: true,
    isGenerateRefreshToken: false,
  });
  return {
    authorization,
    error: "",
  };
};
