import { aureDB } from "../aureDB.ts";
import {statusOK,statusError } from "../status.ts"

export const generic_update = async (ctx:any,client: any,entities:any,entityName : string,id : number,data_param : any) => {
  try {

    const entity =new aureDB(client,entities,entityName);
    const data = await entity.update({ data : data_param, where: { id } });
    statusOK(ctx, data);
  } catch (error) {
    statusError(ctx, error);
    return;
  }
};


