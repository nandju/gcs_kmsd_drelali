import { PropsWithChildren } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion",
};

export default function Layout({ children }: PropsWithChildren) {
  return children;
}
