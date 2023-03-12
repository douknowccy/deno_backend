import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { deleteCmsResources, editCmsResources, getCmsResources, postCmsResources } from "../controller/cmsController.ts";
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
  .post("/refresh", refresh)
  // cms
  .get("/cmsTemplate",getCmsResources)
  .post("/cmsTemplate",postCmsResources)
  .put("/cmsTemplate",editCmsResources)
  .delete("/cms/cmsTemplate",deleteCmsResources)

//   .get("/beers", getBeers)
//   .get("/beers/:id", getBeerDetails)
//   .post("/beers", createBeer)
//   .put("/beers/:id", updateBeer)
//   .delete("/beers/:id", deleteBeer);

export default router;
