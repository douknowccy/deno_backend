import {Context} from "https://deno.land/x/oak@v11.1.0/mod.ts";
export default ({ response }:Context) => {
    response.status = 404;
    response.body = { message: "404 Not Found" };
  };
  
