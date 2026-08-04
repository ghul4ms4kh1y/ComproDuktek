import CrudManager from '../../components/admin/CrudManager';

const columns = [
  {
    key: 'image',
    label: 'Foto',
    render: (item) => <img src={item.image} className="h-10 w-16 object-cover rounded" />,
  },
  { key: 'description', label: 'Deskripsi' },
  { key: 'gallery_date', label: 'Tanggal' },
];

const fields = [
  { name: 'description', label: 'Deskripsi', type: 'text', required: true },
  { name: 'gallery_date', label: 'Tanggal Kegiatan', type: 'date', required: true },
  { name: 'image', label: 'Upload Foto', type: 'file' },
];

export default function GalleryManage() {
  return <CrudManager title="Galeri" endpoint="/galleries" columns={columns} fields={fields} />;
}
