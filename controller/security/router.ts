import { Router } from "../../mod.ts";
import controller  from "./controller.ts";



const init = (client,clientNoTransaction,entities) =>{
  controller.init(client,clientNoTransaction,entities);
}

const router = new Router({
    prefix: "/security",
  });

router
.post("/login", controller.login)
;

export default { router, init};
