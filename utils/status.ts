import { StatusCodes } from "../dep/deps.ts";

// deno-lint-ignore no-explicit-any
export const statusOK = (ctx: any, data : any)=>{
    ctx.response.status = 201;
    ctx.response.body = {
      status: StatusCodes.OK,
      data,
    };
}

// deno-lint-ignore no-explicit-any
export const statusError = (ctx: any, error : any)=>{
    setStatus(ctx,500,StatusCodes.INTERNAL_SERVER_ERROR,error.message);
}

// deno-lint-ignore no-explicit-any
export const setStatus = (ctx: any, status: any, statusBody : any, message: string) =>{
    ctx.response.status = status;
    ctx.response.body = {
      status: statusBody,
      message,
    };
}



