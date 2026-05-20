export interface Product {
  id: string;
  name: string;
  category: "Wallets" | "Belts" | "Bags" | "Jackets" | "Accessories";
  price: number;
  description: string;
  badge?: string;
  featured?: boolean;
}

export const CATEGORIES = [
  "Wallets",
  "Belts",
  "Bags",
  "Jackets",
  "Accessories",
] as const;

export const PRODUCTS: Product[] = [
  {
    id: "heritage-bifold",
    name: "Heritage Bifold Wallet",
    category: "Wallets",
    price: 3500,
    description:
      "Full-grain cowhide bifold with 8 card slots and a slim profile. Ages beautifully with use.",
    badge: "Bestseller",
    featured: true,
  },
  {
    id: "slim-cardholder",
    name: "Slim Cardholder",
    category: "Wallets",
    price: 2500,
    description:
      "Minimalist cardholder for everyday carry. Holds 6 cards plus folded notes.",
    featured: true,
  },
  {
    id: "money-clip-wallet",
    name: "Money Clip Wallet",
    category: "Wallets",
    price: 4200,
    description:
      "Hand-stitched wallet with an integrated stainless steel money clip.",
  },
  {
    id: "classic-dress-belt",
    name: "Classic Dress Belt",
    category: "Belts",
    price: 4500,
    description:
      "Smooth black or tan dress belt with a brushed nickel buckle. Formal essential.",
    featured: true,
  },
  {
    id: "reversible-belt",
    name: "Reversible Leather Belt",
    category: "Belts",
    price: 6000,
    description:
      "Two belts in one — black on one side, brown on the other. Rotating buckle.",
    badge: "2-in-1",
  },
  {
    id: "casual-woven-belt",
    name: "Casual Woven Belt",
    category: "Belts",
    price: 5200,
    description:
      "Hand-woven leather belt that adjusts to any notch. Pairs well with denim.",
  },
  {
    id: "executive-laptop-bag",
    name: "Executive Laptop Bag",
    category: "Bags",
    price: 18000,
    description:
      "Padded 15-inch laptop compartment, full-grain leather, antique brass hardware.",
    badge: "Premium",
    featured: true,
  },
  {
    id: "weekend-duffel",
    name: "Weekend Duffel",
    category: "Bags",
    price: 24000,
    description:
      "Spacious carry-on duffel for short trips. Detachable shoulder strap included.",
    featured: true,
  },
  {
    id: "urban-backpack",
    name: "Urban Backpack",
    category: "Bags",
    price: 15000,
    description:
      "Everyday leather backpack with laptop sleeve and quick-access front pocket.",
  },
  {
    id: "leather-bomber",
    name: "Leather Bomber Jacket",
    category: "Jackets",
    price: 45000,
    description:
      "Classic bomber silhouette in soft lambskin. Ribbed cuffs and hem.",
    badge: "Limited",
    featured: true,
  },
  {
    id: "biker-jacket",
    name: "Biker Jacket",
    category: "Jackets",
    price: 55000,
    description:
      "Asymmetric zip biker jacket in heavyweight cowhide. Built to last decades.",
  },
  {
    id: "passport-holder",
    name: "Passport Holder",
    category: "Accessories",
    price: 2800,
    description:
      "Slim travel passport cover with slots for boarding passes and cards.",
  },
  {
    id: "leather-keychain",
    name: "Handcrafted Keychain",
    category: "Accessories",
    price: 1500,
    description:
      "Solid brass and leather keychain. The perfect small gift.",
  },
  {
    id: "watch-strap",
    name: "Handcrafted Watch Strap",
    category: "Accessories",
    price: 3200,
    description:
      "20mm and 22mm leather watch straps with quick-release spring bars.",
    featured: true,
  },
];

export function formatPKR(amount: number): string {
  return "PKR " + amount.toLocaleString("en-PK");
}
