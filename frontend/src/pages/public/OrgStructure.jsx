import { useEffect, useState } from 'react';
import RevealSection from '../../components/common/RevealSection';
import OrgTreeDesktop from '../../components/public/OrgTreeDesktop';
import OrgListMobile from '../../components/public/OrgListMobile';
import { buildTree } from '../../components/public/orgTreeUtils';
import api from '../../services/api';

export default function OrgStructure() {
  const [items, setItems] = useState(null); // null = masih memuat; data mentah (flat), dipakai desktop
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .get('/org-structures', { params: { limit: 200 } })
      .then((r) => setItems(r.data.data))
      .catch(() => setError(true));
  }, []);

  return (
    <div className="bg-white text-inktext min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 py-16">
        <RevealSection className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-navy uppercase bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 inline-block mb-3">
            KEPEMIMPINAN & UNIT
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-navy">Struktur Organisasi</h1>
          <p className="text-inktext/70 text-sm md:text-base mt-3">
            Bagan hierarki kepemimpinan dan unit di lingkungan Satlak Dukteksi.
          </p>
        </RevealSection>

        {items === null && !error && (
          <p className="text-center text-inktext/50">Memuat struktur organisasi...</p>
        )}

        {error && (
          <p className="text-center text-inktext/50">Gagal memuat data struktur organisasi.</p>
        )}

        {items?.length === 0 && (
          <p className="text-center text-inktext/50">Struktur organisasi belum tersedia.</p>
        )}

        {items?.length > 0 && (
          <RevealSection>
            {/* Desktop: bagan berbasis level/baris, garis penghubung lurus otomatis */}
            <div className="hidden md:block bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
              <OrgTreeDesktop items={items} />
            </div>

            {/* Mobile: list bertingkat, bisa dilipat/dibuka per cabang */}
            <div className="md:hidden max-w-lg mx-auto bg-white border border-gray-100 rounded-3xl shadow-sm p-4">
              <OrgListMobile roots={buildTree(items)} />
            </div>
          </RevealSection>
        )}
      </div>
    </div>
  );
}