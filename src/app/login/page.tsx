import { redirect } from "next/navigation";

import { LoginScreen } from "@/components/auth/LoginScreen";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Sign in · Kori",
};

export default async function Page() {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();

  if (auth.data.user && !auth.error) redirect("/dashboard");

  return <LoginScreen />;
}
