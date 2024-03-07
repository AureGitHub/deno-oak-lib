import { Context, StatusCodes  } from "../dep/deps.ts";

const requireUser = async (ctx: Context, next: () => Promise<unknown>) => {

  if (!ctx.state.token){
    ctx.response.body = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "You are not logged in",
    };
    return;
  }

  await next();

};

const requireAdmin = async (ctx: Context, next: () => Promise<unknown>) => {

  if(!ctx.state.user.isAdmin)
  {
    ctx.response.body = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "You are not Admin",
    };
    return;
  }

  await next();

};


const requireGod = async (ctx: Context, next: () => Promise<unknown>) => {


  // debería haber elegido en cliente una app y traer en role en user

  if(!ctx.state.user.isGod)
  {
    ctx.response.body = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "You are not God",
    };
    return;
  }

  await next();

};


export default {
  requireUser,
  requireAdmin,
  requireGod
};
