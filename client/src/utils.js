export function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addWeeks(date, n) {
  return addDays(date, n * 7);
}

export function addMonths(date, n) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function formatDisplayDate(dateStr) {
  const d = parseDate(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${dateStr} ${weekdays[d.getDay()]}`;
}

export function formatWeekRange(startStr, endStr) {
  const s = parseDate(startStr);
  const e = parseDate(endStr);
  return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 — ${e.getMonth() + 1}月${e.getDate()}日`;
}

export function formatMonthTitle(year, month) {
  return `${year}年${month}月`;
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0).getDate();
  let startDay = first.getDay();
  startDay = startDay === 0 ? 6 : startDay - 1;

  const cells = [];
  const prevMonthLast = new Date(year, month - 1, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    const d = prevMonthLast - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    cells.push({ date: formatDate(new Date(y, m - 1, d)), currentMonth: false });
  }
  for (let d = 1; d <= lastDay; d++) {
    cells.push({ date: formatDate(new Date(year, month - 1, d)), currentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    cells.push({ date: formatDate(new Date(y, m - 1, d)), currentMonth: false });
  }
  return cells;
}

export function getWeekDays(mondayDate) {
  return Array.from({ length: 7 }, (_, i) => formatDate(addDays(mondayDate, i)));
}

export const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
