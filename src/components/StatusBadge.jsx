const colors = {
  Abierto: 'danger',
  'En Progreso': 'warning',
  'Pendiente de Aprobacion': 'info',
  'Pendiente de Aprobación': 'info',
  Cerrado: 'success'
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${colors[status] || 'muted'}`}>{status || 'Sin estado'}</span>;
}
