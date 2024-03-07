import { Context ,  StatusCodes } from "../dep/deps.ts";


const requireApp = async (ctx: Context, next: () => Promise<unknown>, app : string) => {


  // debería haber elegido en cliente una app y traer en role en user

  if(app && (!ctx.state.app || ctx.state.user.app !=app))
  {
    ctx.response.body = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "You don't have permission for this app",
    };
    return;
  }

  await next();

};

export default requireApp;

