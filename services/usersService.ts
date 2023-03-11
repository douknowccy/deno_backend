import pool from "../db/postgres.ts";
import {
  create,
  getNumericDate,
  verify,
} from "https://deno.land/x/djwt@v2.8/mod.ts";
import redis from "../db/redis.ts";
import { crypto } from "https://deno.land/std@0.179.0/crypto/mod.ts";
import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import {
  PoolClient,
  Transaction,
} from "https://deno.land/x/postgres@v0.17.0/mod.ts";
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

export const gernerateJwt = async ({
  isGenerateRefreshToken = true,
  isGenerateJWT = true,
}: {
  isGenerateRefreshToken?: boolean;
  isGenerateJWT?: boolean;
}) => {
  let authorization = null;
  let refreshToken = null;
  if (!isGenerateJWT && !isGenerateRefreshToken) {
    return {
      authorization,
      refreshToken,
    };
  }
  const { JWT_KEY } = await load();
  const key = await generateKey(JWT_KEY);
  if (isGenerateJWT) {
    authorization = await create(
      { alg: "HS512", typ: "JWT" },
      //  五分鐘 失效 jwt token
      { exp: getNumericDate(5 * 60), iss: "Falco" },
      key
    );
  }

  if (isGenerateRefreshToken) {
    refreshToken = await create(
      { alg: "HS512", typ: "JWT" },
      //  更新toekn 時效一天
      { exp: getNumericDate(24 * 60 * 60), iss: "Falco" },
      key
    );
  }
  return { refreshToken, authorization };
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
  const { JWT_KEY } = await load();
  const jwtKey = await generateKey(JWT_KEY);
  const { refreshToken, authorization } = await gernerateJwt({});
  const { exp } = await verify(refreshToken!, jwtKey);
  if (exp && getNumericDate(0) >exp) {
    // 更新新的refresh token
    await redis.set(`jwt_refreshToken_${account}`, refreshToken!);
  }

  return { ...returnParams, authorization, refreshToken };
};
export const logoutUser = async ({ account }: { account: string }) => {
  const returnParams = {
    error: "",
  };
  const client = await pool.connect();
  const { rows } = await isAccountExistedOnDb(client, account);
  client.end()
  if (rows.length === 0) {
    return { ...returnParams, error: "查無此帳號" };
  }
  await redis.del(`jwt_refreshToken_${account}`);
};
export const refreshToken = async ({ account }: { account: string }) => {
  const isRefreshTokenExisted = await redis.get(`jwt_refreshToken_${account}`);
  if (!isRefreshTokenExisted) {
    return {
      error: "請重新登錄",
      code: 401,
    };
  }
  const { authorization } = await gernerateJwt({
    isGenerateJWT: true,
    isGenerateRefreshToken: false,
  });
  return {
    authorization,
    code: 200,
    error:""
  };
};
