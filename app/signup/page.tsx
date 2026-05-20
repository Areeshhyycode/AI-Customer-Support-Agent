import SignupForm from "@/components/SignupForm";

export const metadata = {
  title: "Sign up — Acme Leather Co.",
};

export default function SignupPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <SignupForm />
    </div>
  );
}
