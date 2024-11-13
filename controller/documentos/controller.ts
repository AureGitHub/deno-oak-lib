import { aureDB } from "../../aureDB.ts";
import { StatusCodes } from "../../deps.ts";
import { setStatus, statusOK } from "../../status.ts";

let entity: any;


const init=(client: any,clientNoTransaction: any, entities : any)=>{
  entity =new aureDB(client,clientNoTransaction,entities,'public."Documentos"');
}

const getById = async (ctx: any) => {
  const id = Number(ctx?.params?.id);
  let data = await entity.findFirst({ where: { id } });
  if(!data){ 
    setStatus(ctx, 409, StatusCodes.CONFLICT, 'Documento no encontrado!')
    return;
  }
  let myData = data.content.toString("base64");
  data['myData'] =  myData;
  statusOK(ctx, data  );

};

export default {
  getById,
  init
};
