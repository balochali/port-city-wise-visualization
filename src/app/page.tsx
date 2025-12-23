import Header from "../components/headers";
import Dashboard from "@/components/dashboard";

export default function Home() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0">
        <Dashboard />
      </main>
    </div>
  );
}
