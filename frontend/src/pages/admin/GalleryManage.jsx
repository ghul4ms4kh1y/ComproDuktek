import CrudManager from '../../components/admin/CrudManager';

const columns = [
  {
    key: 'image',
    label: 'Foto',
    render: (item) => (
      item.image ? (
        <img src={item.image} alt="Foto Galeri" className="h-10 w-16 object-cover rounded" />
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      )
    ),
  },
  { key: 'description', label: 'Deskripsi' },
  { key: 'gallery_date', label: 'Tanggal' },
];

const fields = [
  { name: 'description', label: 'Deskripsi', type: 'text', required: true },
  { name: 'gallery_date', label: 'Tanggal Kegiatan', type: 'date', required: true },
  { name: 'image', label: 'Upload Foto', type: 'file' },
];

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'deskripsi_asc', label: 'Deskripsi (A - Z)', sortKey: 'description' },
  { value: 'deskripsi_desc', label: 'Deskripsi (Z - A)', sortKey: 'description' },
  { value: 'tanggal_asc', label: 'Tanggal Terlama', sortKey: 'gallery_date' },
  { value: 'tanggal_desc', label: 'Tanggal Terbaru', sortKey: 'gallery_date' },
];

export default function GalleryManage() {
  return <CrudManager title="Galeri" endpoint="/galleries" columns={columns} fields={fields} sortOptions={sortOptions} />;
}