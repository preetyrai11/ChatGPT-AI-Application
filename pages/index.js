import Head from "next/head";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { getSession } from "@auth0/nextjs-auth0";

export default function Home() {
 const { isLoading, error, user } = useUser();

  if(isLoading) return <div>Loading...</div>
  if(error) return <div>{error.message}</div> 

  
  return (
    
    <> 
    <div> 
      <Head> 
        <title> Book Meds </title>
      </Head>
      <div className="bg-gray-900 justify-center items-center text-5xl align-middle h-screen bg-blue-950 text-center text-stone-50"> 
      
        {!!user && <Link href="/api/auth/logout"> Logout </Link>} 
        {!user && <Link href="/api/auth/login"> Login </Link>}
      
        </div>
    </div>
    </>
  );
}


export const getServerSideProps = async (ctx) => {
  const session = await getSession(ctx.req, ctx.res); 
  if(!!session){
    return {
      redirect: {
        destination: "/chat" 
      }
    }
  }

  return {
    props: {},
  }

}
