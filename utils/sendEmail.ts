import { SMTPClient } from "https://deno.land/x/denomailer/mod.ts";
import "https://deno.land/x/dotenv/load.ts";


export const sendEmail = async (emailTo: string, subject : string, bodyHtml: string) => {

  const { email_user_smtp, email_api_key, email_bcc } = Deno.env.toObject();

  const body = `
  {  
    "sender":{  
       "name":"ttec-Euromillones",
       "email":"${email_user_smtp}"
    },
    "to":[  
       {  
          "email":"${emailTo}"
       }
    ],
    "bcc":[  
      {  
         "email":"${email_bcc}",
         "name":"ttec-Euromillones"
      }
   ],
    "subject":"${subject}",
    "htmlContent":"<html><head></head><body>${bodyHtml}</body></html>"
 }
  `;


  /*
  MESSAGE='{"key": "$YOUR_API_KEY", "message": {"from_email": "hello@example.com", "subject": "Hello World", "text": "Welcome to Mailchimp Transactional!", "to": [{ "email": "freddie@example.com", "type": "to" }]}}'

curl -sS -X POST "https://mandrillapp.com/api/1.0/messages/send" --header 'Content-Type: application/json' --data-raw "$MESSAGE"
  */

  let resp = await fetch("https://api.brevo.com/v3/smtp/email", {
  method: "POST",
  headers: {
    "accept": "application/json",
    "Content-Type": "application/json",
    "api-key": email_api_key,
  },
  body,
});



const jsonData = await resp.json();

console.log(jsonData);


return {
  code : jsonData?.code,
  message: jsonData?.message,
  messageId: jsonData?.messageId,
  enviado : jsonData?.messageId,
}


}

export const sendEmailBACK = async (lstDestinatarios: string[], subject : string, bodyHtml: string) => {


    const { email_user_smtp, email_password_smtp, email_bcc } = Deno.env.toObject();

    console.log('email_user_smtp ' + email_user_smtp);
    console.log('email_password_smtp ' + email_password_smtp);
    console.log('email_bcc ' + email_bcc);
    


    const client = new SMTPClient({
        connection: {
          hostname: "smtp-relay.brevo.com",
          port: 465,
         tls: true,
          auth: {
            username: email_user_smtp,
            password: email_password_smtp,
          },
          
        },
      });
      
      await client.send({
        from: `Auremillones <${email_user_smtp}>`,
        to: lstDestinatarios,
        subject: subject,
        bcc: email_bcc,
        content: "...",
        html: bodyHtml,
      });
      
      await client.close(); 

}



