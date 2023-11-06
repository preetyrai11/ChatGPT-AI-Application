import { ChatSidebar } from 'components/ChatSidebar'
import Head from 'next/head'
import React from 'react'
import { useState, useEffect } from 'react';
import { streamReader } from "openai-edge-stream";
import { v4 as uuid } from 'uuid';
import { Message } from 'components/Message';
import { useRouter } from "next/router";
import { getSession } from "@auth0/nextjs-auth0";
import clientPromise from "lib/mongodb";
import { ObjectId } from "mongodb"; 

const ChatPage = ({ chatId, title, messages = [] }) => {

  console.log("props: ", title, messages); 
  const [newChatId, setNewChatId] = useState(null);
  const [incomingMessage, setIncomingMessage] = useState("");
  const [messageText, setMessageText] = useState("");
  const [newChatMessages, setNewChatMessages] = useState([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [fullMessage, setFullMessage] = useState(""); 
  const router = useRouter();

  // when our route changes 
  useEffect(() => {
      if(!generatingResponse && newChatId){
        setNewChatId(null);
        router.push(`/chat/${newChatId}`); 
      }
  }, [newChatId, generatingResponse, router]);  


  // save the newly stressed message to new chat message
  useEffect(() => {
    if(!generatingResponse && fullMessage){
      setNewChatMessages(prev => [...prev, {
         _id: uuid(),
         role: "assistant",
         content: fullMessage
      }])
      setFullMessage(""); 
    }
  }, [generatingResponse, fullMessage]); 


  // if we've created a new chat 
  useEffect(() => {
     setNewChatMessages([]);
     setNewChatId(null);
  },[chatId]); 

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setGeneratingResponse(true);
    setNewChatMessages(prev => {
        const newChatMessages = [
            ...prev, 
            {
              _id: uuid(), 
              role: "user",
              content: messageText, 
            }, 
        ]; 
        return newChatMessages;
    }); 

    setMessageText("");
    // console.log("MESSAGE TEXT: ", messageText);

    
    // const response = await fetch(`/api/chat/createNewChat`, {
    //   method: "POST",
    //   headers: {
    //     'content-type': 'application/json' 
    //   },
    //   body: JSON.stringify({
    //     message: messageText, 
    //   }), 
    // });

    //  const json = await response.json();
    //  console.log("NEW CHAT: ", json);

     
    const response = await fetch(`/api/chat/sendMessage`, {
        method: "POST", 
        headers: {
            'content-type': 'application/json' 

        }, 
        body: JSON.stringify({ chatId, message: messageText }), 
    }); 

    const data = response.body;
    if(!data){
        return; 
    }

    const reader = data.getReader();
    let content = "";
    await streamReader(reader, (message) => {
        console.log("MESSAGE: ", message);
       // setIncomingMessage(s => `${s}${message.content}`)
       
         if(message.event === "newChatId"){
           setNewChatId(message.content); 
         }else{
           setIncomingMessage((s) => `${s}${message.content}`);
           content = content + message.content; 
         }
    }); 
  
    setFullMessage(content); 
    setIncomingMessage("");
    setGeneratingResponse(false);
  }; 

  const allMessages = [...messages, ...newChatMessages];

  return (
    <> 
      <Head> 
        <title>New chat </title>
      </Head>
      <div className="grid h-screen grid-cols-[260px_1fr]"> 
         <ChatSidebar chatId={chatId} /> 
         <div className="flex flex-col overflow-hidden bg-gray-700"> 
           <div className="flex-1 overflow-scroll text-white"> 
           {allMessages.map(message => (
             <Message 
               key={message._id } 
               role={message.role} 
               content={message.content} 
             /> 
           ))}
           {!!incomingMessage && ( 
            <Message 
              
               role="assitant"  
               content={incomingMessage} 
             /> 
           )} 
           </div>
           <footer className="bg-gray-800 p-10">
              <form onSubmit={handleSubmit}> 
                <fieldset 
                 className="flex gap-2"
                 disabled={generatingResponse}  
                >
                   
                  <textarea
                    value={messageText} 
                    onChange={(e) => setMessageText(e.target.value)} 
                    placeholder={generatingResponse ? "" : "Send a message..." }
                    className="w-full resize-none rounded-md bg-gray-700 p-2 text-white focus:border-emerald-500 focus:bg-gray-600 focus:outline focus:outline-emerald-500" 
                  /> 

                  <button 
                   className="btn"
                   type="submit"> 
                     Send 
                  </button>
                </fieldset>
              </form>
            </footer>
         </div>
      </div>
    </>
  ); 
}


export const getServerSideProps = async (ctx) => {
    const chatId = ctx.params?.chatId?.[0] || null;
    if(chatId){
       const {user} = await getSession(ctx.req, ctx.res);
       const client = await clientPromise; 
       const db = client.db("BookMeds");
       const chat = await db.collection("chats").findOne({
         userId: user.sub,
         _id: new ObjectId(chatId) 
       }); 
       return {
        props: {
          chatId,
          title: chat.title,
          messages: chat.messages.map(message => ({
             ...message, 
             _id: uuid(),
          }))
        }, 
      }; 
    }
    return {
      props: {} 
    }
}; 




export default ChatPage







































