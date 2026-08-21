import CrudManager from '../../components/admin/CrudManager';
import { formatDate } from '../../lib/dateUtils';

const columns = [
  { key: 'title', label: 'Judul' },
  { key: 'category', label: 'Kategori' },
  { key: 'news_date', label: 'Tanggal', render: (item) => formatDate(item.news_date) },
  {
    key: 'thumbnail',
    label: 'Thumbnail',
    render: (item) => (item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="h-10 w-16 object-cover rounded" /> : '—'),
  },
];

const fields = [
  { name: 'title', label: 'Judul Berita', type: 'text', required: true },
  {
    name: 'category',
    label: 'Kategori Berita',
    type: 'select',
    required: true,
    options: [
      { value: 'Kegiatan Siber', label: 'Kegiatan Siber' },
      { value: 'Edukasi & Riset', label: 'Edukasi & Riset' },
      { value: 'Teknologi', label: 'Teknologi' },
      { value: 'Pengumuman', label: 'Pengumuman' },
      { value: 'Operasional', label: 'Operasional' },
    ],
  },
  { name: 'news_date', label: 'Tanggal', type: 'date', required: true },
  { name: 'content', label: 'Isi Berita', type: 'textarea', required: true },
  { name: 'thumbnail', label: 'Thumbnail (gambar)', type: 'file' },
];

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'judul_asc', label: 'Judul (A - Z)', sortKey: 'title' },
  { value: 'judul_desc', label: 'Judul (Z - A)', sortKey: 'title' },
  { value: 'tanggal_asc', label: 'Tanggal Terlama', sortKey: 'news_date' },
  { value: 'tanggal_desc', label: 'Tanggal Terbaru', sortKey: 'news_date' },
  { value: 'kategori_asc', label: 'Kategori (A - Z)', sortKey: 'category' },
  { value: 'kategori_desc', label: 'Kategori (Z - A)', sortKey: 'category' },
];

export default function NewsManage() {
  return <CrudManager title="Berita" endpoint="/news" columns={columns} fields={fields} sortOptions={sortOptions} />;
}