export function countRecords(data) {
  let count = 0;
  if (data.words) count += data.words.length;
  if (data.contexts) count += data.contexts.length;
  if (data.alerts) count += data.alerts.length;
  if (data.settings) count += data.settings.length;
  return count;
}
