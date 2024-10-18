import { Router } from "../../deps.ts";
import controller from "./controller.ts";

const init = (entities) =>{
  controller.init(entities);
}

const router = new Router({
    prefix: "/entities",
  });

router.get("/",  controller.get)
export default { router, init};
