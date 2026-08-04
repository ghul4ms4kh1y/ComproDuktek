import CrudManager from '../../components/admin/CrudManager';

const columns = [
  { key: 'title', label: 'Judul' },
  { key: 'news_date', label: 'Tanggal' },
  {
    key: 'thumbnail',
    label: 'Thumbnail',
    render: (item) => (item.thumbnail ? <img src={item.thumbnail} className="h-10 w-16 object-cover rounded" /> : '—'),
  },
];

const fields = [
  { name: 'title', label: 'Judul Berita', type: 'text', required: true },
  { name: 'news_date', label: 'Tanggal', type: 'date', required: true },
  { name: 'content', label: 'Isi Berita', type: 'textarea', required: true },
  { name: 'thumbnail', label: 'Thumbnail (gambar)', type: 'file' },
];

export default function NewsManage() {
  return <CrudManager title="Berita" endpoint="/news" columns={columns} fields={fields} />;
}
