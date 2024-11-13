import { aureDB } from "../../aureDB.ts";
import { statusOK } from "../../status.ts";

let client: any;
let clientNoTransaction: any;
let entities: any;


const init=(client_: any,clientNoTransaction_: any, entities_ : any)=>{
  client =client_;
  clientNoTransaction =clientNoTransaction_;
  entities =entities_;
}


// deno-lint-ignore no-explicit-any
const get = async (ctx: any) => {

  const cual = ctx?.params?.cual;
  const entity =new aureDB(client,clientNoTransaction,entities,cual);
  const result =await entity.findMany();
  const data = { data: result, count: result.length };
  statusOK(ctx,data);   

};


export default {
  get,
  init
};