import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4 text-sm">
        <div>
          <div className="font-semibold tracking-tight text-stone-100">
            ACME LEATHER<span className="text-amber-500">.</span>
          </div>
          <p className="text-stone-500 mt-2 text-xs leading-relaxed">
            Handcrafted leather goods, made in Lahore since 2018.
          </p>
        </div>
        <div>
          <div className="text-stone-300 font-medium mb-2">Shop</div>
          <ul className="space-y-1 text-stone-500">
            <li><Link href="/shop" className="hover:text-amber-400">All Products</Link></li>
            <li><Link href="/shop" className="hover:text-amber-400">Wallets</Link></li>
            <li><Link href="/shop" className="hover:text-amber-400">Bags</Link></li>
            <li><Link href="/shop" className="hover:text-amber-400">Jackets</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-stone-300 font-medium mb-2">Help</div>
          <ul className="space-y-1 text-stone-500">
            <li><Link href="/support" className="hover:text-amber-400">Customer Support</Link></li>
            <li><Link href="/support" className="hover:text-amber-400">Shipping &amp; Returns</Link></li>
            <li><Link href="/support" className="hover:text-amber-400">Track Order</Link></li>
            <li><Link href="/support" className="hover:text-amber-400">Warranty</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-stone-300 font-medium mb-2">Contact</div>
          <ul className="space-y-1 text-stone-500 text-xs">
            <li>support@acmeleather.pk</li>
            <li>+92-42-1234-5678</li>
            <li>Liberty Market, Lahore</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-stone-600 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 Acme Leather Co. All rights reserved.</span>
          <span>Powered by an AI support assistant 🤖</span>
        </div>
      </div>
    </footer>
  );
}
