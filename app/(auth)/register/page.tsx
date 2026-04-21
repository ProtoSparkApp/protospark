import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/inventory");
  }

  return <RegisterForm />;
}
