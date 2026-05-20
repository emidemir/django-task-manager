import { useState, useEffect } from 'react';
import { notifications as initialNotifs } from '../lib/mockData';

const LIVE_MESSAGES = [
  { id: 'live1', type: 'comment_added', message: 'Priya commented on "File upload to S3"',      actor: { initials: 'PM', color: '#8b5cf6', name: 'Priya Mehta' }, isRead: false },
  { id: 'live2', type: 'task_done',     message: 'Sam marked "Slack webhook handler" as done',  actor: { initials: 'SC', color: '#f43f5e', name: 'Sam Chen'  }, isRead: false },
  { id: 'live3', type: 'task_assigned', message: 'Jordan assigned you to "Token audit"',        actor: { initials: 'JL', color: '#f59e0b', name: 'Jordan Lee' }, isRead: false },
];

export function useNotifications() {
  const [notifs, setNotifs]         = useState(initialNotifs);
  const [wsConnected, setWsConnected] = useState(false);
  const [liveQueue, setLiveQueue]   = useState([]);
  const [wsLog, setWsLog]           = useState([]);
  const [simIdx, setSimIdx]         = useState(0);

  const addLog = (msg, type) =>
    setWsLog(prev => [{ id: Date.now(), msg, type, time: new Date() }, ...prev].slice(0, 8));

  useEffect(() => {
    const t = setTimeout(() => {
      setWsConnected(true);
      addLog('Connected to ws://api/ws/projects/p1/', 'connect');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const simulateIncoming = () => {
    if (simIdx >= LIVE_MESSAGES.length) return;
    const incoming = { ...LIVE_MESSAGES[simIdx], id: 'live_' + Date.now(), createdAt: new Date() };
    addLog(`← ${incoming.type}: "${incoming.message.slice(0, 40)}…"`, 'receive');
    setLiveQueue(q => [incoming, ...q]);
    setNotifs(prev => [incoming, ...prev]);
    setSimIdx(i => i + 1);
  };

  const markAllRead = () => {
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
    setLiveQueue([]);
  };

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    setLiveQueue(q => q.filter(n => n.id !== id));
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  return {
    notifs,
    unreadCount,
    wsConnected,
    liveQueue,
    wsLog,
    simIdx,
    canSimulate: wsConnected && simIdx < LIVE_MESSAGES.length,
    simulateIncoming,
    markAllRead,
    markRead,
  };
}
