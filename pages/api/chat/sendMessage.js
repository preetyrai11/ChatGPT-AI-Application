
// import { OpenAIEdgeStream } from "openai-edge-stream";
// import { faRobot } from "@fortawesome/free-solid-svg-icons"

// export const config = {
//     runtime: "edge", 
// }; 

// export default async function handler(req){
    
//     try{ 
//         const { chatId, message} = await req.json();
//         console.log("MESSAGE: ", message); 
//         const initialChatMessage = {
//             role: "system",
//             content: 
//              "Your name is AI, You are incredibly intelligent and quick AI" 
//         }; 
    

      
//         if(chatId){

//         }else{ 
//          const response = await fetch(
//             `${req.headers.get("origin")}/api/chat/createNewChat`,
//             {
//                 method: "POST",
//                 headers: {
//                     "content-type": "application/json", 
//                     cookie: req.headers.get("cookie"),
//                 },
//                 body: JSON.stringify({
//                     message,
//                 }), 
//             }
//         ); 
//         }
//         const json = await response.json();
//         const chatId = json._id; 

//         const stream = await OpenAIEdgeStream(
//             "https://api.openai.com/v1/chat/completions", 
//             {
//                 headers: {
//                     'content-type': 'application/json',
//                     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`

//                 },
//                 method: "POST",
//                 body: JSON.stringify({
//                     model: "gpt-3.5-turbo",
//                     messages: [initialChatMessage, {content: message, role: "user" }],
//                     // messages: [initialChatMessage, ...messageToInclude], 

//                     stream: true, 
//                 }),
//             }, {
//                 onBeforeStream: ({emit}) => {
//                    emit(chatId, "newChatId"); 
//                 //  if(newChatId){
//                 //     emit(chatId, "newChatId"); 
//                 //  }
//                 }, 
//                 onAfterStream: async ({ fullContent }) => {
//                    await fetch(
//                      `${req.headers.get("origin")}/api/chat/addMessageToChat`,
//                     {
//                       method: "POST", 
//                       headers: {
//                         'content-type': "application/json", 
//                         cookie: req.headers.get("cookie"),
//                       }, 
//                       body: JSON.stringify({
//                          chatId, 
//                          role: "assistant", 
//                          content: fullContent, 
//                       }), 
//                    }
//                 ); 
//               }, 
//             }
//         ); 
//         return new Response(stream);

//     }
//     catch(e){
//         console.log("AN ERROR OCCURED IN SENDMESSAGE: ", e); 
//     }
// }










import { OpenAIEdgeStream } from "openai-edge-stream";
import { faRobot } from "@fortawesome/free-solid-svg-icons"

export const config = {
    runtime: "edge", 
}; 

export default async function handler(req){
    console.log("IN HERE!");
    try{
        const {chatId: chatIdFromParam, message } = await req.json(); 
        let chatId = chatIdFromParam; 
        
        console.log("MESSAGE: ",message); 
        // const { message } = await req.json();
        // console.log("MESSAGE: ", message);
        const initialChatMessage = {
            role: "system", 
            content: "You are Book Meds . A tool used by doctor's to ease their job", 
        };
        
       let newChatId; 
       let chatMessage = []; 


    if(chatId){
        // add messages to chat 
        const response = await fetch(`${req.headers.get("origin")}/api/chat/addMessageToChat`, {
            method: "POST",
            headers: {
                'content-type': "application/json",
                cookie: req.headers.get("cookie"), 
            },
            body: JSON.stringify({
                chatId, 
                role: "user", 
                content: message,
            }), 
        }
      );
      const json = await response.json(); 
    }else{     
       const response = await fetch(
        `${req.headers.get("origin")}/api/chat/createNewChat`, 
        {
           method: "POST", 
           headers: {
             "content-type": "application/json", 
              cookie: req.headers.get("cookie"), 
           }, 
           body: JSON.stringify({
              message, 
           }), 
       }); 

       const json = await response.json(); 
       chatId = json._id;
      newChatId = json._id; 
    } 

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
                    messages: [initialChatMessage, {content: message, role: "user" }],
                    // messages: [initialChatMessage, ...messageToInclude], 

                    stream: true, 
                }),
            }, {
                onBeforeStream: ({emit}) => {
                //    emit(chatId, "newChatId"); 
                 if(newChatId){
                    emit(chatId, "newChatId"); 
                 }
                }, 
                onAfterStream: async ({ fullContent }) => {
                   await fetch(
                     `${req.headers.get("origin")}/api/chat/addMessageToChat`,
                    {
                      method: "POST", 
                      headers: {
                        'content-type': "application/json", 
                        cookie: req.headers.get("cookie"),
                      }, 
                      body: JSON.stringify({
                         chatId, 
                         role: "assistant", 
                         content: fullContent, 
                      }), 
                   }
                ); 
              }, 
            }
        ); 
        return new Response(stream);

    }catch(e){
        console.log("AN ERROR OCCURED IN SENDMESSAGE: ", e); 
    }
}





















