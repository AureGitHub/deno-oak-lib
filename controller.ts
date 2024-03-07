import { RouterContext, create,  decode, StatusCodes } from "./deps.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";




export const secureTokenController =  async (ctx: any, next: any) =>  {


  if (!ctx.state.token){
    await next();
    return;
  } 

  let message = "Token session has expired";
  try{
    const [header, payload, signature] = decode(ctx.state.token);  
    const decoded = payload;
    ctx.state.user = decoded['user'];

    const accessTokenExpiresIn=decoded['accessTokenExpiresIn'];

    if(Date.now() > accessTokenExpiresIn){

      const dateExpiresIn = new Date(accessTokenExpiresIn);
      const SessionexpiredIn = `${dateExpiresIn.toLocaleDateString()} ${dateExpiresIn.toLocaleTimeString()}`;

      message = `Token is timed out (${SessionexpiredIn})`;
      ctx.state.user = null;

      ctx.response.body = {
        status: StatusCodes.REQUEST_TIMEOUT,
        message,
      };
      return;
    }
    else{
      const secure = await giveMeToken(ctx.state.user);
      ctx.state.secure = secure;
    }
    
  }
  catch(ex){
     message = "Token is invalid";
  }

    if (! ctx.state.user) {
      ctx.response.status = 401;
      ctx.response.body = {
        status: "fail",
        message,
      };
      return;
    }

    await next();
};


export const giveMeToken = async(user: any) => {

  const key = await crypto.subtle.generateKey(
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["sign", "verify"],
  );

  let expires_in = 30;

  if(Deno.env.get('ACCESS_TOKEN_EXPIRES_IN')){
    expires_in =parseInt(Deno.env.get('ACCESS_TOKEN_EXPIRES_IN')?.toString());

  }



  const accessTokenExpiresIn = Date.now() + expires_in * 60 * 1000;
  const token = await create({ alg: "HS512", typ: "JWT" }, {user,accessTokenExpiresIn} , key );


  //Math.floor(((new Date(accessTokenExpiresIn) - new Date().getTime()) / 1000 / 60) % 60); // minutos


  const dateExpiresIn = new Date(accessTokenExpiresIn);
  const SessionexpiredIn = `${dateExpiresIn.toLocaleDateString()} ${dateExpiresIn.toLocaleTimeString()}`;
  user.SessionexpiredIn = SessionexpiredIn;
  // user.dateExpiresIn = dateExpiresIn;
  user.expires_in_milisegundos=accessTokenExpiresIn;
  return  {
    user,
    token
  };
}


export const logoutController = (ctx: any) => {
 
  ctx.state.secure = null;
  ctx.state.token = null;

  ctx.response.status = 200;
  ctx.response.body = {  status:StatusCodes.OK };
};


// export default {
//   loginUserController,
//   logoutController,
//   secureTokenController,
//   giveMeToken
  
// };
