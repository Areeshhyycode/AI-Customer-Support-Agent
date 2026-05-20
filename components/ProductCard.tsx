import Image from "next/image";
import { Product, formatPKR } from "@/lib/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden hover:border-amber-500/40 transition">
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-900">
        <Image
          src={`/products/${product.id}.jpg`}
          alt={product.name}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
        {product.badge && (
          <span className="absolute top-3 left-3 z-10 text-[10px] uppercase tracking-wider bg-amber-500 text-stone-950 font-bold px-2 py-1 rounded">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-2 right-2 z-10 text-[10px] uppercase tracking-wider bg-stone-950/70 text-stone-300 px-2 py-1 rounded backdrop-blur">
          {product.category}
        </span>
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
