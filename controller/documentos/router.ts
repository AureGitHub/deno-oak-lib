import { Router } from "../../deps.ts";
import { requireUser } from "../../mod.ts";
import  documentoController  from "./controller.ts";

const init = (client,clientNoTransaction,entities) =>{
  documentoController.init(client,clientNoTransaction,entities);
}

const router = new Router({
    prefix: "/documentos",
  });

router

.get("/:id", requireUser,  documentoController.getById)
;

export default { router, init};
