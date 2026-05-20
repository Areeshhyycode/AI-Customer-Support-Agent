import ChatInterface from "@/components/ChatInterface";

export const metadata = {
  title: "Customer Support — Acme Leather Co.",
};

const QUICK_TOPICS = [
  "What is your shipping policy?",
  "How do I track my order?",
  "What is your return policy?",
  "Do you ship internationally?",
];

export default function SupportPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <p className="text-amber-500 text-sm tracking-[0.25em] uppercase">
          Customer Support
        </p>
        <h1 className="text-3xl font-bold tracking-tight mt-2">
          How can we help you today?
        </h1>
        <p className="text-stone-500 mt-2">
          Our AI assistant answers instantly from our help center — and connects
          you to a human whenever you need one.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-5">
        {QUICK_TOPICS.map((t) => (
          <span
            key={t}
            className="text-xs text-stone-400 border border-white/10 rounded-full px-3 py-1"
          >
            {t}
          </span>
        ))}
      </div>

      <ChatInterface />
    </div>
  );
}
