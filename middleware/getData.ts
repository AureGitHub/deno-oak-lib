import { Context, StatusCodes  } from "../deps.ts";
import { multiParser } from 'https://deno.land/x/multiparser/mod.ts'


export const getData = async (ctx: Context, next: () => Promise<unknown>) => {


  const form = await multiParser(ctx.request.originalRequest.request)
    
  let data = form?.fields;

  let files :any[] = [];

  data['files'] = files;


  if(form?.files){

    // const decoder = new TextDecoder("utf-8");     

    


    for (const property in form?.files) {

      console.log(form?.files);
      
      const baseName = property.split('_')[0]; //le pasaré el boleto_filename para referenciarlo
      files.push( 
        {          
          property : baseName,        
          filename : form?.files[property].filename,
          contenttype : form?.files[property].contentType,
          //content: decoder.decode(form?.files[property].content)
          content: form?.files[property].content
      }
    );


      //Nombre del fichero??
    }    
  }
  
  ctx.state.data = data;
  await next();

};
