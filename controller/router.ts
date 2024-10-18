import { Router } from "../deps.ts";
import documentoRouter  from "./documentos/router.ts";
import entitiesRouter from "./entities/router.ts";
import securityRouter from "./security/router.ts";
import typesRouter from "./types/router.ts";

const init = (client, clientNoTransaction, entities) => {

  documentoRouter.init(client, clientNoTransaction, entities);
  typesRouter.init(client, clientNoTransaction, entities);
  securityRouter.init(client, clientNoTransaction, entities);
  entitiesRouter.init(entities);

}

const router = new Router();
router.use(securityRouter.router.routes());
router.use(documentoRouter.router.routes());
router.use(typesRouter.router.routes());
router.use(entitiesRouter.router.routes());

export const gnericRouter = { router, init};