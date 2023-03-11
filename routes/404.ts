import {Context} from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { AllStatus, AllStatusMsg } from "../utils/httpStatus.ts";
export default ({ response }:Context) => {
    response.status = AllStatus.NotFound;
    response.body = { message: AllStatusMsg[AllStatus.NotFound]};
  };
  
