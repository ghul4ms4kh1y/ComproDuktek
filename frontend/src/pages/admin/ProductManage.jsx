import CrudManager from '../../components/admin/CrudManager';

const columns = [
  { key: 'name', label: 'Nama Produk' },
  { key: 'category', label: 'Kategori' },
  { key: 'unit_pengampu', label: 'Unit Pengampu' },
  { key: 'status', label: 'Status' },
];

const fields = [
  { name: 'name', label: 'Nama Produk', type: 'text', required: true },
  { name: 'category', label: 'Kategori', type: 'text', required: true },
  { name: 'unit_pengampu', label: 'Unit Pengampu', type: 'text', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['Aktif', 'Dalam Pengembangan', 'Nonaktif'], required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea' },
  { name: 'image', label: 'Gambar Produk', type: 'file' },
];

const sortOptions = [
  { value: 'default', label: 'Default' },
  { value: 'nama_asc', label: 'Nama Produk (A - Z)', sortKey: 'name' },
  { value: 'nama_desc', label: 'Nama Produk (Z - A)', sortKey: 'name' },
  { value: 'kategori_asc', label: 'Kategori (A - Z)', sortKey: 'category' },
  { value: 'kategori_desc', label: 'Kategori (Z - A)', sortKey: 'category' },
  { value: 'status_asc', label: 'Status (A - Z)', sortKey: 'status' },
  { value: 'status_desc', label: 'Status (Z - A)', sortKey: 'status' },
];

export default function ProductManage() {
  return <CrudManager title="Produk" endpoint="/products" columns={columns} fields={fields} sortOptions={sortOptions} />;
}
