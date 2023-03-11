import { Status as HttpStatus } from "https://deno.land/std@0.178.0/http/http_status.ts";

enum EXTENDS_Status {
  NeedToRefreshToken = 160,
}
export const AllStatus = { ...HttpStatus, ...EXTENDS_Status };
export const AllStatusMsg = {
  [AllStatus.Unauthorized]: "已過期,請重新登錄",
};