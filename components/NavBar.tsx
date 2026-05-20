import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function NavBar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "admin";
  const firstName = session?.user?.name?.split(" ")[0];

  return (
    <header className="border-b border-white/10 bg-[#0c0a09]/90 backdrop-blur sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          ACME LEATHER<span className="text-amber-500">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-stone-300">
          <Link href="/" className="hover:text-amber-400 transition">Home</Link>
          <Link href="/shop" className="hover:text-amber-400 transition">Shop</Link>
          <Link href="/support" className="hover:text-amber-400 transition">
            Customer Support
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-amber-400 transition text-amber-500/80">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="hidden sm:inline text-sm text-stone-400">
                Hi, {firstName}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm px-3 py-1.5 rounded-md hover:bg-white/10 transition"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3 py-1.5 rounded-md bg-amber-500 text-stone-950 font-medium hover:bg-amber-400 transition"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="md:hidden border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-2 flex gap-5 text-sm text-stone-300 overflow-x-auto">
          <Link href="/" className="hover:text-amber-400 whitespace-nowrap">Home</Link>
          <Link href="/shop" className="hover:text-amber-400 whitespace-nowrap">Shop</Link>
          <Link href="/support" className="hover:text-amber-400 whitespace-nowrap">
            Customer Support
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-amber-500/80 whitespace-nowrap">Admin</Link>
          )}
        </div>
      </div>
    </header>
  );
}
