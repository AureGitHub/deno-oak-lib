import { Application, isHttpError, logger, Status, send, oakCors } from "./deps.ts";
import {secureTokenController} from "./auth-token.ts";
import { Router } from "./deps.ts";


export const run = (appRouter : Router, fullstack = false) => { 

  let ROOT_DIR = "./ionic";
  const ROOT_DIR_PATH = "/ionic";

  if(fullstack){
    ROOT_DIR = "./ionic/www";
  }


  const app = new Application();


  app.use(oakCors({ origin: '*' }));

  // Middleware Logger
  app.use(logger.default.logger);
  app.use(logger.default.responseTime);



  const timeElapsed = Date.now();
  const today = new Date(timeElapsed);

  const now = `${today.toLocaleDateString()}  ${today.toLocaleTimeString()}`;

  app.use(async (ctx, next) => {

    await next();
    //Manda siempre secure... si esxiste
    if (ctx.state.secure) {
      ctx.response.body['secure'] = ctx.state.secure;
    }


  });


  app.use(async (ctx, next) => {

    //AQUI COJO EL TOKEN !!!!!!!!!!!!!!!!!!!!!!!
    const token = await ctx.request.headers.get('Authorization');
    const objPagFilterOrder = await ctx.request.headers.get('objPagFilterOrder');
    ctx.state.now = now;
    if (token) {
      ctx.state.token = token;
    }

    if (objPagFilterOrder && objPagFilterOrder != 'undefined') {
      ctx.state.objPagFilterOrder = JSON.parse(objPagFilterOrder);
    }

    await next();
  });

  // este middel comprueba que el token sea correcto y lo refresca
  app.use(secureTokenController);
  // este middel obtiene los datos y los guarda en ctx
  // app.use(getData);


  app.use(async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      if (isHttpError(err)) {
        console.log(err);
        switch (err.status) {
          case Status.NotFound:
            // handle NotFound
            ctx.response.body = `Direccion no encontrada !!! ${now}`;
            break;
          default:
            // handle other statuses
            ctx.response.body = `Error!! !!! ${now}`;
        }
      } else {
        // rethrow if you can't handle the error
        ctx.response.body = `Error!!  ${err} !!! ${now}`;
      }
    }
  });



  app.use(appRouter.routes());
  app.use(appRouter.allowedMethods());




  app.use(async (ctx, next) => {
    if (!ctx.request.url.pathname.startsWith(ROOT_DIR_PATH)) {
      next();
      return;
    }
    const filePath = ctx.request.url.pathname.replace(ROOT_DIR_PATH, "");
    await send(ctx, filePath, {
      root: ROOT_DIR,
      index: 'index.html'
    });
  });



  const Denoenv = Deno.env.get("PORT");

  const port: number = Denoenv ? parseInt(Denoenv) : 3000;


  /**
   * Start server.
   */


  app.addEventListener("listen", ({ port, secure   }) => {
    console.info(
      `🚀 Server started on ${secure   ? "https://" : "http://"}localhost:${port}`
    );
  });


  const { produccion } = Deno.env.toObject();

  if(produccion == 'true'){
    app.listen({ port});
  }
  else{
    app.listen({ port , secure: true, certFile: "./certs/cert.pem", keyFile: "./certs/key.pem"});

  }

}