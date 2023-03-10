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
interface LoginProps {
  account: string;
  password: string;
}
const encoder = new TextEncoder();
const generateKey = async (secretKey: string) => {
  const keyBuf = encoder.encode(secretKey);
  return await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"]
  );
};

export const gernerateJwt = async (isGenerateRefreshToken?: boolean) => {
  const { JWT_KEY } = await load();
  const key = await generateKey(JWT_KEY);
  const authorization = await create(
   { alg: "HS512", typ: "JWT" },
    { exp: getNumericDate(5 * 60), iss: "Falco" },
    key
  );

  let refreshToken = null;
  if (isGenerateRefreshToken) {
    refreshToken = await create(
     { alg: "HS512", typ: "JWT" },
      { exp: getNumericDate(24 * 60 * 60), iss: "Falco" },
      key
    );
  }
  return { refreshToken, authorization };
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
  const { rows: userList } = await transaction.queryObject<{
    account: string;
  }>`SELECT account FROM users WHERE account = ${account}`;

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
  const { authorization, refreshToken } = await gernerateJwt(true);

  await redis.set(`jwt_refreshToken_${account}`, refreshToken!);
  return { ...returnParams, refreshToken, authorization };
};

export const loginUser = async ({ account, password }: LoginProps) => {
  const returnParams = {
    error: "",
  };

  const client = await pool.connect();
  const { rows } = await client.queryObject<{
    password: ArrayBufferLike | DataView;
  }>`SELECT password FROM users WHERE account = ${account}`;
  if (rows.length === 0) {
    return { ...returnParams, error: "查無此帳號" };
  }
  const isPasswordCorrect = await bcrypt.compare(password, rows[0].password);
  if (!isPasswordCorrect) {
    return { ...returnParams, error: "密碼錯誤" };
  }
  const { JWT_KEY } = await load();
  const jwtKey = await generateKey(JWT_KEY);
  const { refreshToken, authorization } = await gernerateJwt(true);
  const { exp } = await verify(refreshToken!, jwtKey);
  if (exp && getNumericDate(0) > exp) {
    await redis.set(`jwt_refreshToken_${account}`, refreshToken!);
  }

  return { ...returnParams, authorization, refreshToken };
};
export const logoutUser = async () => {};
export const refreshToken = async () => {};
