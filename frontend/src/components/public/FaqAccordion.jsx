import { useState } from 'react';

export default function FaqAccordion({ faqs }) {
  const [openId, setOpenId] = useState(null);

  if (!faqs?.length) return <p className="text-sm text-inktext/60">Belum ada FAQ.</p>;

  return (
    <div className="divide-y divide-panel border border-panel rounded-lg overflow-hidden">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        return (
          <div key={faq.id} className="bg-white">
            <button
              className="w-full flex justify-between items-center px-4 py-3 text-left"
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span className="font-medium text-navy">{faq.question}</span>
              <span className="text-gold text-xl leading-none">{isOpen ? '−' : '+'}</span>
            </button>
            {isOpen && <div className="px-4 pb-4 text-sm text-inktext/90">{faq.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
