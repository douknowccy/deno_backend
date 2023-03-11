import { Status  } from "https://deno.land/std@0.178.0/http/http_status.ts";

export  {Status}
export const StatusMsg = {
  [Status.Unauthorized]: "已失效,請重新登錄",
  [Status.NotFound]:"404 請求錯誤",
  [Status.NotAcceptable]:"參數錯誤",
};