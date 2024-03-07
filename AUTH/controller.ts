import { RouterContext, create,  decode, StatusCodes } from "../dep/deps.ts";

import "https://deno.land/x/dotenv@v3.2.2/load.ts";




const secureTokenController =  async (ctx: any, next: any) =>  {


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


const giveMeToken = async(user: any) => {

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





const loginUserController = async ({
  request,
  response,
}: RouterContext<string>) => {
  try {
    const { email, password, appId }: { email: string; password: string ; appId:number} =
      await request.body().value;

      const user = await prisma.user.findFirst(
        {where: {email,password }, 
        include : {
          apps: {
            where : {appId},
            include : {app : true}
          }          
        }
      });



    if (!user) {
      response.status = 200;
      response.body = {
        status:StatusCodes.CONFLICT,
        message: "Invalid email or password",
      };
      return;
    }

    if (user.apps.length ==0) {
      response.status = 200;
      response.body = {
        status:StatusCodes.CONFLICT,
        message: "no app",
      };
      return;
    }

    if (user.id==0) {
      response.status = 401;
      response.body = {
        status:StatusCodes.CONFLICT,
        message: "No tiene aplicaciones asociadas",
      };
      return;
    }

    let userRet = new userClass(user);

    const key = await crypto.subtle.generateKey(
      { name: "HMAC", hash: "SHA-512" },
      true,
      ["sign", "verify"],
    );

    const secure = await giveMeToken(userRet);

    response.status = 200;
    response.body = { 
      status:StatusCodes.OK,
      data: secure };
  } catch (error) {
    response.status = 500;
    response.body = {  status:StatusCodes.INTERNAL_SERVER_ERROR, message: error.message };
    return;
  }
};



const logoutController = (ctx: any) => {
 
  ctx.state.secure = null;
  ctx.state.token = null;

  ctx.response.status = 200;
  ctx.response.body = {  status:StatusCodes.OK };
};


export default {
  loginUserController,
  logoutController,
  secureTokenController,
  giveMeToken
  
};
