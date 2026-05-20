import { Product, formatPKR, categoryGradient } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-amber-500/40 transition">
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${categoryGradient(
          product.category,
        )} flex items-center justify-center`}
      >
        <span className="text-stone-300/80 text-sm tracking-[0.3em] uppercase font-medium">
          {product.category}
        </span>
        {product.badge && (
          <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-amber-500 text-stone-950 font-bold px-2 py-1 rounded">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-stone-100">{product.name}</h3>
        <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-amber-400 font-semibold">
            {formatPKR(product.price)}
          </span>
          <button className="text-xs px-3 py-1.5 rounded-md bg-white/10 hover:bg-amber-500 hover:text-stone-950 transition font-medium">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
