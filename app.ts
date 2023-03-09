import { Application } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { load} from "https://deno.land/std@0.178.0/dotenv/mod.ts"
import router from "./routes/router.ts"
import _404 from "./routes/404.ts";
import errorHandler from "./routes/errHandler.ts";
const {APP_PORT,APP_HOST} = await load()
const app = new Application();

app.use(errorHandler);
app.use(router.routes());
app.use(router.allowedMethods());
app.use(_404);

console.log(`Listening on port:${APP_PORT}...`);

await app.listen(`${APP_HOST}:${APP_PORT}`);