export function cleanText(value, max = 2000) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export function safeSeverity(value) {
  return ['Baja', 'Media', 'Alta', 'Crítica'].includes(value) ? value : 'Media';
}

export function safeStatus(value) {
  return ['Abierto', 'En Progreso', 'Pendiente de Aprobación', 'Cerrado'].includes(value) ? value : null;
}
