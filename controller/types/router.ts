import { Router } from "../../deps.ts";
import controller  from "./controller.ts";

const init = (client,clientNoTransaction,entities) =>{
  controller.init(client,clientNoTransaction,entities);
}

const router = new Router({
    prefix: "/types",
  });

router



.get("/:cual", controller.get)
;


export default { router, init};


