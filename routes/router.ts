import { Router } from "https://deno.land/x/oak@v12.1.0/mod.ts";
import { register } from "../controller/userController.ts";


const router = new Router();

router.post("/register",register)
//   .get("/beers", getBeers)
//   .get("/beers/:id", getBeerDetails)
//   .post("/beers", createBeer)
//   .put("/beers/:id", updateBeer)
//   .delete("/beers/:id", deleteBeer);

export default router;