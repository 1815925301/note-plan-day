import { formatDisplayDate, formatWeekRange, formatMonthTitle, getWeekDays, getWeekMonday, parseDate } from './utils';

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportWeekMarkdown(range, entries, anchorDate) {
  const monday = getWeekMonday(parseDate(anchorDate));
  const days = getWeekDays(monday);
  const entryMap = {};
  entries.forEach((e) => {
    entryMap[e.date] = e.content;
  });

  const title = formatWeekRange(range.start, range.end);
  let md = `# 工作日志 · ${title}\n\n`;

  days.forEach((date) => {
    const content = entryMap[date]?.trim();
    md += `## ${formatDisplayDate(date)}\n\n`;
    md += content ? `${content}\n\n` : `_（无记录）_\n\n`;
  });

  downloadFile(`工作日志-${range.start}.md`, md);
}

export function exportMonthMarkdown(year, month, entries) {
  const title = formatMonthTitle(year, month);
  let md = `# 工作日志 · ${title}\n\n`;

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) {
    md += `_本月暂无记录_\n`;
  } else {
    sorted.forEach(({ date, content }) => {
      md += `## ${formatDisplayDate(date)}\n\n`;
      md += `${content.trim()}\n\n`;
    });
  }

  const monthStr = String(month).padStart(2, '0');
  downloadFile(`工作日志-${year}-${monthStr}.md`, md);
}
