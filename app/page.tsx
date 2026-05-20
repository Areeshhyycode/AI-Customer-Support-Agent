import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/lib/products";

export default function Home() {
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-stone-950 to-stone-950" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28">
          <p className="text-amber-500 text-sm tracking-[0.25em] uppercase mb-4">
            Handcrafted in Lahore · Since 2018
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]">
            Leather goods built to last a lifetime.
          </h1>
          <p className="mt-5 text-stone-400 max-w-xl text-lg">
            Full-grain leather wallets, bags, belts and jackets — crafted by hand
            from ethically sourced hides.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition"
            >
              Shop the collection
            </Link>
            <Link
              href="/support"
              className="px-6 py-3 rounded-lg border border-white/15 hover:bg-white/5 transition font-medium"
            >
              Customer Support
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href="/shop"
              className="px-4 py-2 rounded-full border border-white/10 text-sm text-stone-300 hover:border-amber-500/50 hover:text-amber-400 transition"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Featured</h2>
            <p className="text-stone-500 text-sm mt-1">
              Our most-loved pieces this season.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-sm text-amber-400 hover:underline whitespace-nowrap"
          >
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* AI Support CTA */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-900/20 to-stone-950 p-8 sm:p-12 text-center">
          <div className="text-3xl mb-3">🤖</div>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Questions? Our AI assistant is here 24/7
          </h2>
          <p className="text-stone-400 mt-3 max-w-xl mx-auto">
            Ask about shipping, returns, warranty, payment methods, or anything
            else. Get instant answers — and a real human when you need one.
          </p>
          <Link
            href="/support"
            className="inline-block mt-6 px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 transition"
          >
            Talk to Customer Support
          </Link>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          {[
            { t: "Free shipping", d: "On orders above PKR 5,000" },
            { t: "30-day returns", d: "No-questions-asked policy" },
            { t: "1-year warranty", d: "Against manufacturing defects" },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
            >
              <div className="font-medium text-stone-100">{x.t}</div>
              <div className="text-sm text-stone-500 mt-1">{x.d}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
