import {Context} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Status, StatusMsg } from "../utils/httpStatus.ts";
export default ({ response }:Context) => {
    response.status = Status.NotFound;
    response.body = { message: StatusMsg[Status.NotFound]};
  };
  
