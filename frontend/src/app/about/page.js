"use client"
import SignInForm from "@/components/ui/signin";
import { useSession,signOut} from "next-auth/react";

const About = ()=>{
    const session = useSession();
    console.log(session);
    if (session.status === "loading") {
        return <p>Loading...</p>;
    }    
    else if(session.data === null){
        return <SignInForm />
    }
    else{
        console.log(session);
        return (
        <>
        <h1> Hello {session?.data?.user.name}</h1>
        <h1> {session?.data?.user.email} </h1>
        <img src={session.data?.user.image} alt="Sorry" width={120}/>
        <button onClick={() => signOut()}>Sign Out</button>
        </>
        );
    }
}

export default About;