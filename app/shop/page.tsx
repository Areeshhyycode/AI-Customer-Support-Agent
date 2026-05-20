import ProductCard from "@/components/ProductCard";
import { PRODUCTS, CATEGORIES } from "@/lib/products";

export const metadata = {
  title: "Shop — Acme Leather Co.",
};

export default function ShopPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Shop All</h1>
      <p className="text-stone-500 mt-1">
        {PRODUCTS.length} handcrafted leather products.
      </p>

      {CATEGORIES.map((category) => {
        const items = PRODUCTS.filter((p) => p.category === category);
        if (items.length === 0) return null;
        return (
          <section key={category} className="mt-10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
              {category}
              <span className="text-xs text-stone-500 font-normal">
                {items.length} items
              </span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
