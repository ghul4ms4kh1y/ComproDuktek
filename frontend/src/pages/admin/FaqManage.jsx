import CrudManager from '../../components/admin/CrudManager';

const columns = [
  { key: 'question', label: 'Pertanyaan' },
  { key: 'display_order', label: 'Urutan' },
];

const fields = [
  { name: 'question', label: 'Pertanyaan', type: 'text', required: true },
  { name: 'answer', label: 'Jawaban', type: 'textarea', required: true },
  { name: 'display_order', label: 'Urutan Tampil', type: 'number' },
];

export default function FaqManage() {
  return <CrudManager title="FAQ" endpoint="/faqs" columns={columns} fields={fields} />;
}
