import {Context} from "https://deno.land/x/oak@v12.1.0/mod.ts"
export default ({ response }:Context) => {
    response.status = 404;
    response.body = { msg: "404 Not Found" };
  };
  
