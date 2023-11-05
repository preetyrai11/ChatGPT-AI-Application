
import { OpenAIEdgeStream } from "openai-edge-stream";
import { faRobot } from "@fortawesome/free-solid-svg-icons"

export const config = {
    runtime: "edge", 
}; 

export default async function handler(req){
    
    try{ 
        const {message} = await req.json();
        console.log("MESSAGE: ", message); 
        const stream = await OpenAIEdgeStream(
            "https://api.openai.com/v1/chat/completions", 
            {
                headers: {
                    'content-type': 'application/json',
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`

                },
                method: "POST",
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [{ content: message, role: "user" }],
                    

                    stream: true, 
                }),
            }
        );
        return new Response(stream);

    }
    catch(e){
        console.log("AN ERROR OCCURED IN SENDMESSAGE: ", e); 
    }
}

