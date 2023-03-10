import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";

//errorHandler.js
export default async (
  { response }: Context,
  nextFn: () => Promise<unknown>
) => {
  try {
    await nextFn();
  } catch (err) {
    response.status = 500;
    response.body = { msg: err.message };
  }
};
