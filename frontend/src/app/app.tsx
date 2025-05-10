"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

const queryClient = new QueryClient();

const Landing = dynamic(() => import("~/components/Landing"), {
  ssr: false,
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Landing />
    </QueryClientProvider>
  );
}
