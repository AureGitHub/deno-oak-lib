import { Context, StatusCodes  } from "../deps.ts";
import { multiParser } from 'https://deno.land/x/multiparser/mod.ts'


export const getData = async (ctx: Context, next: () => Promise<unknown>) => {


  const form = await multiParser(ctx.request.originalRequest.request)
    
  let data = form?.fields;

  if(form?.files){

    for (const property in form?.files) {
      data[property] = `${form?.files[property].filename};${form?.files[property].contentType};${form?.files[property].content}`;   
      //Nombre del fichero??
    }

    
  }

  
  ctx.state.data = data;
  await next();

};
