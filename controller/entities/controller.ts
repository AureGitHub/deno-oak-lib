
import { statusOK } from "../../status.ts";

let entities;
const init = (entities_ : any) => {
  entities = entities_;
}


const get = (ctx: any) => {
  const data = entities;
  statusOK(ctx, data);

};

export default {
  init,
  get,
};
