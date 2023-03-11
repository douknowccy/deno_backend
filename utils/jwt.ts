import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
import { create,getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";


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