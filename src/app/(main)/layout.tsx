import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
      }}
    >
      <Sidebar />
      <main
        style={{
          marginLeft: 230,
          padding: "1.4rem 1.6rem",
        }}
      >
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
