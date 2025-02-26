"use client";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";

const TwitterTest = () => {
  const handleConnectTwitter = () => {
    signIn("twitter").catch((error) => console.log(error));
  };
  return <Button onClick={handleConnectTwitter}>Connect Twitter</Button>;
};

export default TwitterTest;
