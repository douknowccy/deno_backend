import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { Status } from "../utils/httpStatus.ts";

//errorHandler.js
export default async (
  { response }: Context,
  nextFn: () => Promise<unknown>
) => {
  try {
    await nextFn();
  } catch (err) {
    const {message} = err
    response.status = Status.InternalServerError;
    response.body = { message,successful:false};
  }
};
