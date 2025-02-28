import dynamic from "next/dynamic";
import React from "react";

const NoSsr = ({ children }: { children: React.ReactNode }) => <React.Fragment>{children}</React.Fragment>;

export default dynamic(() => Promise.resolve(NoSsr), {
  ssr: false,
});
