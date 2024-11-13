
import { userClass } from "./user.model.ts";
import { TC_UserEstado } from "../../enums/enums.ts"
import { setStatus, statusError, statusOK } from "../../status.ts";
import { StatusCodes } from "../../deps.ts";
import { giveMeToken } from "../../auth-token.ts";
import { aureDB } from "../../aureDB.ts";

let entity: any;



const init=(client: any,clientNoTransaction: any, entities : any)=>{
  entity =new aureDB(client,clientNoTransaction,entities,'public."User"');
}




const login = async (ctx: any) => {
  try {
    const { email, password }: { email: string; password: string } =
      await ctx.request.body().value;


    const user = await entity.findFirst({ where: { email, password } });

    if (!user) {
      setStatus(ctx, 200, StatusCodes.CONFLICT, "Usuario o password incorrecta!!");
      return;
    }


    if (user && (user.estadoid == TC_UserEstado.baja || user.estadoid == TC_UserEstado.bloqueado)) {
      setStatus(ctx, 200, StatusCodes.CONFLICT, "Usuario dado de baja ó bloqueado. Póngase en contacto con el administrador");
      return;
    }


    if (user && user.estadoid == TC_UserEstado.cambiar_pass) {
      setStatus(ctx, 200, StatusCodes.CONFLICT, "Password bloqueda. Debe cambiar su password");
      return;
    }

    const userRet = new userClass(user);

    const data = await giveMeToken(userRet);

    statusOK(ctx, data);

  } catch (error) {
    statusError(ctx, error);
    return;
  }
};

export default  {
  login,
  init
};