// ═══════════════════════════════════════════════════════════
//  Footer.js  —  save to: front/components/Footer.js
// ═══════════════════════════════════════════════════════════
import Link from 'next/link';

const LINKS = {
  Product: ['Plan a trip', 'AI assistant', 'My trips', 'Pricing'],
  Destinations: ['Europe', 'Asia', 'Africa', 'Americas'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Help center', 'Contact', 'Privacy', 'Terms'],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#060a10] mt-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                </div>
                <span className="font-bold text-white">Smart Travel</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">AI-powered travel planning. From idea to full itinerary in seconds.</p>
          </div>

          {/* link groups */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{group}</div>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <Link href="#" className="text-sm text-slate-500 hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom row */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <span>© 2025 Smart Travel. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <span>Made with ♥ for travelers everywhere</span>
          </div>
        </div>
      </div>
    </footer>
  );
}