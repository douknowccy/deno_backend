import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import {
  register,
  login,
  logout,
  refresh,
} from "../controller/userController.ts";

const router = new Router();

router
  .post("/register", register)
  .post("/login", login)
  .post("/logout", logout)
  .get("/refresh", refresh);
//   .get("/beers", getBeers)
//   .get("/beers/:id", getBeerDetails)
//   .post("/beers", createBeer)
//   .put("/beers/:id", updateBeer)
//   .delete("/beers/:id", deleteBeer);

export default router;
