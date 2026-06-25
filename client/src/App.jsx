import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEntry, saveEntry, fetchWeek, fetchMonth } from './api';
import { checkAuthStatus, logout as authLogout } from './auth';
import { exportWeekMarkdown, exportMonthMarkdown } from './export';
import Login from './Login';
import {
  formatDate,
  parseDate,
  getWeekMonday,
  addWeeks,
  addMonths,
  formatDisplayDate,
  formatWeekRange,
  formatMonthTitle,
  getMonthGrid,
  getWeekDays,
  addDays,
  WEEKDAY_LABELS,
} from './utils';

const VIEWS = { day: '日', week: '周', month: '月' };
const today = formatDate(new Date());

function useDebounceSave(date, content, onSaved) {
  const timer = useRef(null);
  const [status, setStatus] = useState('');

  const save = useCallback(async () => {
    setStatus('saving');
    try {
      await saveEntry(date, content);
      setStatus('saved');
      onSaved?.();
      setTimeout(() => setStatus(''), 2000);
    } catch {
      setStatus('error');
    }
  }, [date, content, onSaved]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(save, 800);
    return () => clearTimeout(timer.current);
  }, [content, save]);

  return status;
}

function DayView({ date, onDateChange }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEntry(date)
      .then((e) => setContent(e.content || ''))
      .finally(() => setLoading(false));
  }, [date]);

  const saveStatus = useDebounceSave(date, content);

  const prev = () => onDateChange(formatDate(addDays(parseDate(date), -1)));
  const next = () => onDateChange(formatDate(addDays(parseDate(date), 1)));

  return (
    <div className="day-view">
      <div className="nav-bar">
        <h2>{formatDisplayDate(date)}</h2>
        <div className="nav-buttons">
          <button onClick={prev} title="前一天">‹</button>
          <button className="today-btn" onClick={() => onDateChange(today)}>今天</button>
          <button onClick={next} title="后一天">›</button>
        </div>
      </div>
      <div className="card editor-card">
        <div className="day-label">
          <strong>今日工作记录</strong>
          <span>{date === today ? '今天' : ''}</span>
        </div>
        {loading ? (
          <div className="empty-hint">加载中…</div>
        ) : (
          <>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="记录今天做了什么…&#10;&#10;例如：&#10;- 完成了 XX 功能开发&#10;- 参加了团队会议&#10;- 修复了 XX bug"
            />
            <div className="editor-footer">
              <span className={`save-status ${saveStatus === 'saved' ? 'saved' : ''}`}>
                {saveStatus === 'saving' && '保存中…'}
                {saveStatus === 'saved' && '已自动保存'}
                {saveStatus === 'error' && '保存失败，请重试'}
                {!saveStatus && '编辑后自动保存'}
              </span>
              <button className="save-btn" onClick={() => saveEntry(date, content)}>
                立即保存
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function WeekView({ anchorDate, onSelectDate, onAnchorChange }) {
  const [data, setData] = useState(null);
  const monday = getWeekMonday(parseDate(anchorDate));
  const days = getWeekDays(monday);

  useEffect(() => {
    fetchWeek(anchorDate).then(setData);
  }, [anchorDate]);

  const entryMap = {};
  data?.entries?.forEach((e) => {
    entryMap[e.date] = e.content;
  });

  const handleExport = () => {
    if (data) exportWeekMarkdown(data.range, data.entries, anchorDate);
  };

  return (
    <div className="week-view">
      <div className="nav-bar">
        <h2>{data ? formatWeekRange(data.range.start, data.range.end) : '加载中…'}</h2>
        <div className="nav-buttons">
          <button onClick={() => onAnchorChange(formatDate(addWeeks(monday, -1)))}>‹</button>
          <button className="today-btn" onClick={() => onAnchorChange(today)}>本周</button>
          <button onClick={() => onAnchorChange(formatDate(addWeeks(monday, 1)))}>›</button>
          <button className="export-btn" onClick={handleExport} disabled={!data} title="导出 Markdown">
            导出
          </button>
        </div>
      </div>
      <div className="week-grid">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="week-header">{label}</div>
        ))}
        {days.map((d) => {
          const content = entryMap[d] || '';
          const isToday = d === today;
          return (
            <div
              key={d}
              className={`week-cell ${isToday ? 'today' : ''} ${content ? 'has-content' : ''}`}
              onClick={() => onSelectDate(d)}
            >
              <div className="cell-date">{parseDate(d).getDate()}</div>
              <div className="cell-preview">{content || '点击添加记录'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthView({ anchorDate, onSelectDate, onAnchorChange }) {
  const [data, setData] = useState(null);
  const d = parseDate(anchorDate);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;

  useEffect(() => {
    fetchMonth(year, month).then(setData);
  }, [year, month]);

  const entryMap = {};
  data?.entries?.forEach((e) => {
    entryMap[e.date] = e.content;
  });

  const cells = getMonthGrid(year, month);

  const handleExport = () => {
    if (data) exportMonthMarkdown(year, month, data.entries);
  };

  return (
    <div className="month-view">
      <div className="nav-bar">
        <h2>{formatMonthTitle(year, month)}</h2>
        <div className="nav-buttons">
          <button onClick={() => onAnchorChange(formatDate(addMonths(d, -1)))}>‹</button>
          <button className="today-btn" onClick={() => onAnchorChange(today)}>本月</button>
          <button onClick={() => onAnchorChange(formatDate(addMonths(d, 1)))}>›</button>
          <button className="export-btn" onClick={handleExport} disabled={!data} title="导出 Markdown">
            导出
          </button>
        </div>
      </div>
      <div className="month-grid">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="week-header">{label}</div>
        ))}
        {cells.map(({ date, currentMonth }) => {
          const content = entryMap[date];
          const isToday = date === today;
          return (
            <div
              key={date}
              className={`month-cell ${isToday ? 'today' : ''} ${!currentMonth ? 'other-month' : ''} ${content ? 'has-content' : ''}`}
              onClick={() => onSelectDate(date)}
            >
              <div className="cell-date">{parseDate(date).getDate()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('day');
  const [selectedDate, setSelectedDate] = useState(today);
  const [authState, setAuthState] = useState({ loading: true, required: false, authenticated: false });

  useEffect(() => {
    checkAuthStatus()
      .then((status) => {
        setAuthState({
          loading: false,
          required: status.required,
          authenticated: status.authenticated,
        });
      })
      .catch(() => setAuthState({ loading: false, required: false, authenticated: true }));
  }, []);

  const handleLoginSuccess = () => {
    setAuthState({ loading: false, required: true, authenticated: true });
  };

  const handleLogout = async () => {
    await authLogout();
    setAuthState({ loading: false, required: true, authenticated: false });
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setView('day');
  };

  if (authState.loading) {
    return <div className="empty-hint" style={{ marginTop: '40vh' }}>加载中…</div>;
  }

  if (authState.required && !authState.authenticated) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">📝</div>
          <div>
            <h1>工作日志</h1>
            <p>记录每一天，回顾每一周</p>
          </div>
        </div>
        <div className="header-actions">
          <div className="view-tabs">
            {Object.entries(VIEWS).map(([key, label]) => (
              <button
                key={key}
                className={view === key ? 'active' : ''}
                onClick={() => setView(key)}
              >
                {label}视图
              </button>
            ))}
          </div>
          {authState.required && (
            <button className="logout-btn" onClick={handleLogout}>退出</button>
          )}
        </div>
      </header>

      {view === 'day' && (
        <DayView date={selectedDate} onDateChange={setSelectedDate} />
      )}
      {view === 'week' && (
        <WeekView
          anchorDate={selectedDate}
          onSelectDate={handleSelectDate}
          onAnchorChange={setSelectedDate}
        />
      )}
      {view === 'month' && (
        <MonthView
          anchorDate={selectedDate}
          onSelectDate={handleSelectDate}
          onAnchorChange={setSelectedDate}
        />
      )}
    </div>
  );
}
