import { Context, StatusCodes  } from "../deps.ts";

export const requireUser = async (ctx: Context, next: () => Promise<unknown>) => {

  if (!ctx.state.token){
    ctx.response.body = {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "You are not logged in",
    };
    return;
  }

  await next();

};

export const requireAdmin = async (ctx: Context, next: () => Promise<unknown>) => {

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


export const requireGod = async (ctx: Context, next: () => Promise<unknown>) => {


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