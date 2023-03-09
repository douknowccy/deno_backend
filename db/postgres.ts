import {
  ClientOptions,
  Pool,
} from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { load } from "https://deno.land/std@0.178.0/dotenv/mod.ts";
const configData = await load();
const databaseCredential:ClientOptions = {
  user: configData["POSTGRES_USER"],
  database: configData["POSTGRES_DATABASE"],
  hostname: configData["POSTGRES_HOSTNAME"],
  port: configData["POSTGRES_PORT"],
  password:configData["POSTGRES_PASSWORD"]
};

const POOL_CONNECTIONS = 20;
const pool = new Pool(databaseCredential , POOL_CONNECTIONS);
export default pool;
