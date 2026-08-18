'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import Papa from 'papaparse';
import {
  LayoutGrid, CalendarClock, BarChart3, Settings2, Paperclip, UploadCloud, FileText,
  FileSpreadsheet, Download, Trash2, ChevronLeft, ChevronRight,
  Save, Check, Loader2, Plus, X, ArrowUpRight, ArrowDownRight,
  Linkedin, Instagram as InstagramIcon, Youtube, Globe, Mail, Music2, Users,
} from 'lucide-react';

const CONFIG_KEY = 'veille-dashboard-config-v5';
const DATA_KEY = 'veille-dashboard-data-v5';
const FILES_KEY = 'veille-dashboard-files-v5';
const MAX_FILE_BYTES = 1.6 * 1024 * 1024;

const GROUP_STYLE = {
  'Analytics web': { bg: '#FAFAFA', accent: '#18181B' },
  'Newsletter': { bg: '#FAFAFA', accent: '#18181B' },
  'Réseaux sociaux': { bg: '#FAFAFA', accent: '#18181B' },
  'Podcast': { bg: '#FAFAFA', accent: '#18181B' },
  'Plateforme CLUB': { bg: '#FAFAFA', accent: '#18181B' },
};
const GROUP_ORDER = ['Analytics web', 'Newsletter', 'Réseaux sociaux', 'Podcast', 'Plateforme CLUB'];
const GROUP_COLOR = {
  'Analytics web': '#3F3F46',
  'Newsletter': '#52525B',
  'Réseaux sociaux': '#18181B',
  'Podcast': '#A1A1AA',
  'Plateforme CLUB': '#71717A',
};

const PLATFORM_ICON = { website: Globe, newsletter: Mail, li_vo: Linkedin, li_vul: Linkedin, li_fed: Linkedin, instagram: InstagramIcon, youtube: Youtube, spotify: Music2, club: Users };
const PLATFORM_COLOR = { website: '#1F7A8C', newsletter: '#FF7A59', li_vo: '#0A66C2', li_vul: '#0A66C2', li_fed: '#0A66C2', youtube: '#E02020', spotify: '#1DB954', club: '#7A4FBF' };
const INSTAGRAM_GRADIENT = 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF,#515BD4)';

function PlatformTile({ channelId, size = 36 }) {
  const Icon = PLATFORM_ICON[channelId] || Users;
  const isInsta = channelId === 'instagram';
  const bg = PLATFORM_COLOR[channelId] || '#18181B';
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isInsta ? INSTAGRAM_GRADIENT : bg }}>
      <Icon size={Math.round(size * 0.55)} color="#fff" strokeWidth={2} />
    </div>
  );
}

const DEFAULT_CHANNELS = [
  { id: 'website', name: 'Site internet', group: 'Analytics web', metrics: [
    { id: 'activeusers', name: 'Utilisateurs actifs', unit: '' },
    { id: 'newusers', name: 'Nouveaux utilisateurs', unit: '' },
    { id: 'events', name: 'Événements enregistrés', unit: '' },
  ]},
  { id: 'newsletter', name: 'Emailing (HubSpot)', group: 'Newsletter', metrics: [
    { id: 'sent', name: 'Emails envoyés', unit: '' },
    { id: 'campaigns', name: 'Campagnes envoyées', unit: '' },
    { id: 'openrate', name: "Taux d'ouverture", unit: '%' },
    { id: 'opens', name: 'Ouvertures', unit: '' },
    { id: 'clickrate', name: 'Taux de clic', unit: '%' },
    { id: 'clicks', name: 'Clics', unit: '' },
    { id: 'ctor', name: 'CTOR', unit: '%' },
    { id: 'replies', name: 'Réponses', unit: '' },
    { id: 'deliverability', name: 'Délivrabilité', unit: '%' },
    { id: 'unsub', name: 'Désabonnement', unit: '%' },
    { id: 'spamreport', name: 'Signalement spam', unit: '%' },
  ]},
  { id: 'li_vo', name: 'LinkedIn — Univers VO', group: 'Réseaux sociaux', metrics: [
    { id: 'impressions', name: 'Impressions', unit: '' },
    { id: 'reactions', name: 'Réactions', unit: '' },
    { id: 'comments', name: 'Commentaires', unit: '' },
    { id: 'reposts', name: 'Republications', unit: '' },
    { id: 'newfollowers', name: 'Nouveaux abonnés', unit: '' },
    { id: 'totalfollowers', name: 'Total abonnés', unit: '' },
    { id: 'searchappearances', name: 'Apparitions dans les recherches', unit: '' },
    { id: 'pageviews', name: 'Vues de page', unit: '' },
    { id: 'uniquevisitors', name: 'Visiteurs uniques', unit: '' },
  ]},
  { id: 'li_vul', name: 'LinkedIn — VUL & Retail', group: 'Réseaux sociaux', metrics: [
    { id: 'impressions', name: 'Impressions', unit: '' },
    { id: 'reactions', name: 'Réactions', unit: '' },
    { id: 'comments', name: 'Commentaires', unit: '' },
    { id: 'reposts', name: 'Republications', unit: '' },
    { id: 'newfollowers', name: 'Nouveaux abonnés', unit: '' },
    { id: 'totalfollowers', name: 'Total abonnés', unit: '' },
    { id: 'searchappearances', name: 'Apparitions dans les recherches', unit: '' },
    { id: 'pageviews', name: 'Vues de page', unit: '' },
    { id: 'uniquevisitors', name: 'Visiteurs uniques', unit: '' },
  ]},
  { id: 'li_fed', name: 'LinkedIn — Les Fédérateurs', group: 'Réseaux sociaux', metrics: [
    { id: 'impressions', name: 'Impressions', unit: '' },
    { id: 'reactions', name: 'Réactions', unit: '' },
    { id: 'comments', name: 'Commentaires', unit: '' },
    { id: 'reposts', name: 'Republications', unit: '' },
    { id: 'newfollowers', name: 'Nouveaux abonnés', unit: '' },
    { id: 'totalfollowers', name: 'Total abonnés', unit: '' },
    { id: 'searchappearances', name: 'Apparitions dans les recherches', unit: '' },
    { id: 'pageviews', name: 'Vues de page', unit: '' },
    { id: 'uniquevisitors', name: 'Visiteurs uniques', unit: '' },
  ]},
  { id: 'instagram', name: 'Instagram', group: 'Réseaux sociaux', metrics: [
    { id: 'views', name: 'Vues', unit: '' },
    { id: 'reach', name: 'Comptes touchés', unit: '' },
    { id: 'interactions', name: 'Interactions', unit: '' },
    { id: 'accountsinteracted', name: 'Comptes ayant interagi', unit: '' },
    { id: 'profilevisits', name: 'Visites du profil', unit: '' },
    { id: 'newfollowers', name: 'Nouveaux abonnés', unit: '' },
    { id: 'pctnonfollowers', name: 'Vues non-abonnés', unit: '%' },
    { id: 'pctreels', name: 'Part des Reels', unit: '%' },
    { id: 'pctstories', name: 'Part des Stories', unit: '%' },
  ]},
  { id: 'youtube', name: 'YouTube', group: 'Réseaux sociaux', metrics: [
    { id: 'views', name: 'Vues', unit: '' },
    { id: 'watchtime', name: 'Temps de visionnage', unit: 'h' },
    { id: 'newsubscribers', name: 'Nouveaux abonnés', unit: '' },
    { id: 'impressions', name: 'Impressions', unit: '' },
    { id: 'videoviews', name: 'Vues sur vidéos', unit: '' },
    { id: 'ctr', name: 'CTR', unit: '%' },
    { id: 'avgduration', name: 'Durée moyenne', unit: 'min' },
    { id: 'monthlyaudience', name: 'Audience mensuelle', unit: '' },
  ]},
  { id: 'spotify', name: 'Spotify', group: 'Podcast', metrics: [
    { id: 'plays', name: 'Lectures / téléchargements', unit: '' },
    { id: 'newsubscribers', name: 'Nouveaux abonnés', unit: '' },
    { id: 'audience', name: 'Audience', unit: '' },
    { id: 'impressions', name: 'Impressions', unit: '' },
    { id: 'streams', name: 'Lectures', unit: '' },
    { id: 'conversionrate', name: 'Taux de conversion', unit: '%' },
    { id: 'completionrate', name: 'Taux de complétion moyen', unit: '%' },
    { id: 'listentime', name: "Temps d'écoute", unit: 'h' },
    { id: 'avglistentime', name: "Temps moyen d'écoute", unit: 'min' },
  ]},
  { id: 'club', name: 'Meltingspot (CLUB)', group: 'Plateforme CLUB', metrics: [
    { id: 'members', name: 'Membres', unit: '' },
    { id: 'newmembers', name: 'Nouveaux membres', unit: '' },
    { id: 'pendinginvites', name: "Invitations en attente", unit: '' },
  ]},
];

const JUNE_DATA = {
  website: { activeusers: 596, newusers: 559, events: 3000, __note: 'Trafic direct et emailing HubSpot restent les principaux moteurs ; le SEO continue d\u2019apporter du trafic qualifié.' },
  newsletter: { sent: 24611, campaigns: 9, openrate: 16.65, clickrate: 0.36, ctor: 2.18, replies: 2, deliverability: 99.72, unsub: 0.21, spamreport: 0, __note: 'Excellente délivrabilité et bon niveau d\u2019ouverture ; le taux de clic reste le principal axe de progression.' },
  li_vo: { impressions: 20137, reactions: 799, comments: 24, reposts: 5, newfollowers: 33, pageviews: 160, uniquevisitors: 67, __note: 'Engagement solide malgré une baisse de la portée ce mois-ci.' },
  li_vul: { impressions: 1374, reactions: 95, comments: 8, reposts: 5, newfollowers: 10, pageviews: 48, uniquevisitors: 19, __note: 'Très belle dynamique, progression sur tous les indicateurs de visibilité.' },
  li_fed: { pageviews: 42, uniquevisitors: 23, newfollowers: 5, __note: 'Excellente progression de la visibilité et du trafic qualifié vers la page.' },
  instagram: { views: 1650, reach: 1068, pctnonfollowers: 81, pctreels: 93.4, pctstories: 6.6, __note: 'Les Reels portent l\u2019essentiel de la portée, avec une large part de nouvelle audience.' },
  youtube: { views: 405, watchtime: 32.5, newsubscribers: 4, impressions: 21800, videoviews: 336, ctr: 0.6, avgduration: 5.03, monthlyaudience: 275, __note: 'Bon mois de découverte ; le CTR reste le principal levier d\u2019amélioration.' },
  spotify: { plays: 23, audience: 12, impressions: 250, streams: 22, conversionrate: 8.8, completionrate: 24, listentime: 3.22, avglistentime: 17.38, __note: 'Mois plus calme sur les écoutes, mais l\u2019audience progresse.' },
  club: { members: 446, newmembers: 11, pendinginvites: 190, __note: 'Très belle accélération du recrutement de nouveaux membres.' },
};

const MAY_DATA = {
  website: { activeusers: 567, newusers: 530, events: 2600, __note: 'L\u2019email devient le premier générateur de sessions ; le SEO continue d\u2019apporter du trafic qualifié.' },
  newsletter: { sent: 16881, campaigns: 12, openrate: 25.68, opens: 4312, clickrate: 0.83, clicks: 140, ctor: 3.25, replies: 5, unsub: 0.24, spamreport: 0, __note: 'Excellente progression du taux d\u2019ouverture, bien au-dessus des benchmarks ; le taux de clic reste à travailler.' },
  li_vo: { impressions: 31970, reactions: 789, comments: 26, reposts: 7, newfollowers: 48, totalfollowers: 3936, searchappearances: 474, __note: 'Visibilité en forte hausse et abonnements en accélération malgré une légère baisse des réactions.' },
  li_vul: { impressions: 1728, reactions: 97, reposts: 1, newfollowers: 3, totalfollowers: 58, searchappearances: 107, pageviews: 22, uniquevisitors: 10, __note: 'Très forte progression de la visibilité et de l\u2019engagement, mais l\u2019acquisition d\u2019abonnés reste à renforcer.' },
  li_fed: { impressions: 68, reactions: 0, comments: 0, reposts: 0, newfollowers: 3, totalfollowers: 51, __note: 'Mois plus discret sur cette page, en retrait sur l\u2019ensemble des indicateurs.' },
  instagram: { views: 2699, reach: 1573, interactions: 165, accountsinteracted: 23, profilevisits: 19, newfollowers: 95, pctnonfollowers: 76.8, pctreels: 92.9, pctstories: 7.1, __note: 'Les Reels restent le principal moteur de visibilité ; plus de 3 vues sur 4 viennent de non-abonnés.' },
  spotify: { plays: 42, newsubscribers: 1, listentime: 7, __note: 'Activité régulière ; une promotion plus forte sur LinkedIn et par email pourrait amplifier la portée.' },
  club: { members: 432, newmembers: 3, pendinginvites: 189, __note: 'La communauté continue de grandir, mais le recrutement ralentit par rapport au mois précédent.' },
};

const SEED_ALL = { '2026-05': MAY_DATA, '2026-06': JUNE_DATA };

function uid(prefix = 'id') { return prefix + '_' + Math.random().toString(36).slice(2, 9); }
const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
function monthLabel(key) { const [y, m] = key.split('-').map(Number); return `${MONTHS_FR[m - 1]} ${y}`; }
function monthShort(key) { const [y, m] = key.split('-').map(Number); return `${MONTHS_FR[m - 1].slice(0, 3)}. ${String(y).slice(2)}`; }
function currentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function shiftMonth(key, delta) {
  let [y, m] = key.split('-').map(Number); m += delta;
  while (m < 1) { m += 12; y--; } while (m > 12) { m -= 12; y++; }
  return `${y}-${String(m).padStart(2, '0')}`;
}
function fmt(n) {
  if (n === undefined || n === null || n === '') return '—';
  const num = Number(n); if (Number.isNaN(num)) return '—';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}
function fmtBytes(b) {
  if (b < 1024) return b + ' o';
  if (b < 1024 * 1024) return (b / 1024).toFixed(0) + ' Ko';
  return (b / (1024 * 1024)).toFixed(1) + ' Mo';
}

export default function VeilleDashboard() {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [data, setData] = useState({});
  const [files, setFiles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('overview');
  const [month, setMonth] = useState(currentMonthKey());
  const [overviewMonth, setOverviewMonth] = useState(currentMonthKey());
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState('idle');
  const [showSummary, setShowSummary] = useState(false);
  const [compareChannelId, setCompareChannelId] = useState('website');
  const [compareMetricId, setCompareMetricId] = useState('activeusers');
  const [barGroup, setBarGroup] = useState('Réseaux sociaux');
  const [trendChannelId, setTrendChannelId] = useState('instagram');
  const [fileError, setFileError] = useState('');
  const [csvInsert, setCsvInsert] = useState({ fileId: '', column: '', channelId: 'website', metricId: 'activeusers', targetMonth: currentMonthKey() });
  const fileInputRef = useRef(null);

  useEffect(() => {
    (async () => {
      try { const cfg = await window.storage.get(CONFIG_KEY, true); if (cfg?.value) setChannels(JSON.parse(cfg.value)); } catch (e) {}
      try { const f = await window.storage.get(FILES_KEY, true); if (f?.value) setFiles(JSON.parse(f.value)); } catch (e) {}
      let finalData = null;
      try {
        const d = await window.storage.get(DATA_KEY, true);
        if (d?.value) finalData = JSON.parse(d.value);
      } catch (e) {}
      if (!finalData || Object.keys(finalData).length === 0) {
        finalData = SEED_ALL;
        setMonth('2026-06');
        try { await window.storage.set(DATA_KEY, JSON.stringify(finalData), true); } catch (e) {}
      }
      setData(finalData);
      const monthsKeys = Object.keys(finalData).sort();
      if (monthsKeys.length) setOverviewMonth(monthsKeys[monthsKeys.length - 1]);
      setLoaded(true);
    })();
  }, []);

  const persistConfig = useCallback(async (next) => {
    setChannels(next);
    try { await window.storage.set(CONFIG_KEY, JSON.stringify(next), true); } catch (e) { console.error(e); }
  }, []);
  const persistData = useCallback(async (next) => {
    setData(next); setSaveState('saving');
    try { await window.storage.set(DATA_KEY, JSON.stringify(next), true); setSaveState('saved'); setDirty(false); setTimeout(() => setSaveState('idle'), 1600); }
    catch (e) { console.error(e); setSaveState('idle'); }
  }, []);
  const persistFiles = useCallback(async (next) => {
    setFiles(next);
    try { await window.storage.set(FILES_KEY, JSON.stringify(next), true); return true; }
    catch (e) { console.error(e); setFileError("Le stockage est plein ou a échoué — essaie avec un fichier plus léger."); return false; }
  }, []);

  function setValue(channelId, metricId, value) {
    setData((prev) => {
      const next = { ...prev };
      next[month] = { ...(next[month] || {}) };
      next[month][channelId] = { ...(next[month][channelId] || {}), [metricId]: value };
      return next;
    });
    setDirty(true);
  }
  function setNote(channelId, value) {
    setData((prev) => {
      const next = { ...prev };
      next[month] = { ...(next[month] || {}) };
      next[month][channelId] = { ...(next[month][channelId] || {}), __note: value };
      return next;
    });
    setDirty(true);
  }
  function saveMonth() { persistData(data); setOverviewMonth(month); setShowSummary(true); }

  const allMonthsWithData = useMemo(() => Object.keys(data).sort(), [data]);
  const groupedChannels = useMemo(() => {
    const g = {}; channels.forEach((c) => { (g[c.group] = g[c.group] || []).push(c); }); return g;
  }, [channels]);

  function groupSum(monthKey, group) {
    const chans = groupedChannels[group] || [];
    let sum = 0, any = false;
    chans.forEach((c) => {
      const m0 = c.metrics[0]; if (!m0) return;
      const v = data[monthKey]?.[c.id]?.[m0.id];
      if (v !== undefined && v !== '' && !Number.isNaN(Number(v))) { sum += Number(v); any = true; }
    });
    return any ? sum : null;
  }
  function computeSummary(monthKey) {
    if (!monthKey) return [];
    const idx = allMonthsWithData.indexOf(monthKey);
    const prevKey = idx > 0 ? allMonthsWithData[idx - 1] : shiftMonth(monthKey, -1);
    return GROUP_ORDER.filter((g) => groupedChannels[g]?.length).map((g) => {
      const val = groupSum(monthKey, g);
      const prevVal = groupSum(prevKey, g);
      let delta = null;
      if (val !== null && prevVal !== null && prevVal !== 0) delta = ((val - prevVal) / prevVal) * 100;
      return { group: g, value: val, delta, ...GROUP_STYLE[g] };
    });
  }
  function channelDelta(channelId, metricId, monthKey) {
    const idx = allMonthsWithData.indexOf(monthKey);
    if (idx <= 0) return null;
    const prevKey = allMonthsWithData[idx - 1];
    const val = data[monthKey]?.[channelId]?.[metricId];
    const prevVal = data[prevKey]?.[channelId]?.[metricId];
    if (val === undefined || val === '' || prevVal === undefined || prevVal === '' || Number(prevVal) === 0) return null;
    return ((Number(val) - Number(prevVal)) / Number(prevVal)) * 100;
  }

  const overviewSummary = useMemo(() => computeSummary(overviewMonth), [overviewMonth, data, channels, allMonthsWithData]);
  const heroTotal = useMemo(() => overviewSummary.reduce((s, r) => s + (r.value || 0), 0), [overviewSummary]);
  const repartition = useMemo(() => {
    const total = overviewSummary.reduce((s, r) => s + (r.value || 0), 0) || 1;
    return overviewSummary.filter((r) => r.value).map((r) => ({ ...r, pct: (r.value / total) * 100 }));
  }, [overviewSummary]);
  const watchList = useMemo(() => {
    const items = [];
    channels.forEach((c) => {
      const m0 = c.metrics[0]; if (!m0) return;
      const val = data[overviewMonth]?.[c.id]?.[m0.id];
      const delta = channelDelta(c.id, m0.id, overviewMonth);
      if (val === undefined || val === '') items.push({ channelId: c.id, name: c.name, kind: 'missing', badge: '—' });
      else if (delta !== null && delta < 0) items.push({ channelId: c.id, name: c.name, kind: 'down', badge: `${delta.toFixed(1)}%`, delta });
    });
    return items.sort((a, b) => (a.delta ?? 0) - (b.delta ?? 0)).slice(0, 5);
  }, [channels, data, overviewMonth, allMonthsWithData]);
  const heroSparkline = useMemo(() => {
    const months = allMonthsWithData.slice(-6);
    return months.map((m) => GROUP_ORDER.reduce((s, g) => s + (groupSum(m, g) || 0), 0));
  }, [allMonthsWithData, data]);
  const heroDelta = useMemo(() => {
    if (heroSparkline.length < 2) return null;
    const last = heroSparkline[heroSparkline.length - 1], prev = heroSparkline[heroSparkline.length - 2];
    if (!prev) return null;
    return ((last - prev) / prev) * 100;
  }, [heroSparkline]);
  const heroPeak = useMemo(() => {
    const months = allMonthsWithData.slice(-6);
    if (heroSparkline.length === 0) return null;
    let maxIdx = 0;
    heroSparkline.forEach((v, i) => { if (v > heroSparkline[maxIdx]) maxIdx = i; });
    return { value: heroSparkline[maxIdx], month: months[maxIdx] };
  }, [heroSparkline, allMonthsWithData]);

  function sparkPath(vals) {
    const clean = vals.filter((v) => typeof v === 'number' && !Number.isNaN(v));
    if (clean.length < 2) return null;
    const min = Math.min(...vals), max = Math.max(...vals); const range = max - min || 1;
    const w = 100, h = 32; const step = w / (vals.length - 1);
    let path = ''; vals.forEach((v, i) => { const x = i * step; const y = h - ((v - min) / range) * h; path += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' '; });
    return path.trim();
  }

  const barData = useMemo(() => (groupedChannels[barGroup] || []).map((c) => {
    const m0 = c.metrics[0];
    const v = m0 ? data[overviewMonth]?.[c.id]?.[m0.id] : undefined;
    return { name: c.name, channelId: c.id, metricName: m0?.name || '', value: v !== undefined && v !== '' ? Number(v) : null };
  }), [barGroup, overviewMonth, data, groupedChannels, channels]);
  const barMax = useMemo(() => Math.max(0, ...barData.map((d) => (d.value === null ? -Infinity : d.value))), [barData]);

  useEffect(() => {
    const chans = groupedChannels[barGroup] || [];
    if (chans.length && !chans.find((c) => c.id === trendChannelId)) setTrendChannelId(chans[0].id);
  }, [barGroup, groupedChannels]); // eslint-disable-line

  const trendChannel = channels.find((c) => c.id === trendChannelId);
  const trendMetric = trendChannel?.metrics[0];
  const trendSeries = useMemo(() => allMonthsWithData.map((m) => ({
    month: monthShort(m),
    value: trendMetric && data[m]?.[trendChannelId]?.[trendMetric.id] !== undefined && data[m]?.[trendChannelId]?.[trendMetric.id] !== '' ? Number(data[m][trendChannelId][trendMetric.id]) : null,
  })), [allMonthsWithData, data, trendChannelId, trendMetric]);
  const trendLatest = trendSeries.length ? trendSeries[trendSeries.length - 1].value : null;
  const trendColor = '#18181B';

  const heatmapMonths = allMonthsWithData.slice(-6);
  function heatCellStyle(channelId, metricId) {
    const vals = heatmapMonths.map((m) => { const v = data[m]?.[channelId]?.[metricId]; return (v === undefined || v === '') ? null : Number(v); });
    const nums = vals.filter((v) => v !== null);
    const min = nums.length ? Math.min(...nums) : 0, max = nums.length ? Math.max(...nums) : 0;
    const range = max - min || 1;
    return heatmapMonths.map((m) => {
      const v = data[m]?.[channelId]?.[metricId];
      if (v === undefined || v === '') return { empty: true };
      const ratio = (Number(v) - min) / range;
      const alpha = 0.18 + ratio * 0.72;
      return { empty: false, value: Number(v), alpha };
    });
  }

  function addChannel() { persistConfig([...channels, { id: uid('ch'), name: 'Nouveau canal', group: 'Plateforme CLUB', metrics: [{ id: uid('m'), name: 'Indicateur', unit: '' }] }]); }
  function removeChannel(id) { persistConfig(channels.filter((c) => c.id !== id)); }
  function renameChannel(id, name) { persistConfig(channels.map((c) => (c.id === id ? { ...c, name } : c))); }
  function addMetric(channelId) { persistConfig(channels.map((c) => c.id === channelId ? { ...c, metrics: [...c.metrics, { id: uid('m'), name: 'Nouvel indicateur', unit: '' }] } : c)); }
  function removeMetric(channelId, metricId) { persistConfig(channels.map((c) => c.id === channelId ? { ...c, metrics: c.metrics.filter((m) => m.id !== metricId) } : c)); }
  function renameMetric(channelId, metricId, field, value) { persistConfig(channels.map((c) => c.id === channelId ? { ...c, metrics: c.metrics.map((m) => m.id === metricId ? { ...m, [field]: value } : m) } : c)); }

  const compareChannel = channels.find((c) => c.id === compareChannelId) || channels[0];
  useEffect(() => { if (compareChannel && !compareChannel.metrics.find((m) => m.id === compareMetricId)) setCompareMetricId(compareChannel.metrics[0]?.id); }, [compareChannelId]); // eslint-disable-line
  const compareSeries = useMemo(() => allMonthsWithData.map((m) => ({
    month: monthShort(m),
    value: data[m]?.[compareChannelId]?.[compareMetricId] !== undefined && data[m]?.[compareChannelId]?.[compareMetricId] !== '' ? Number(data[m][compareChannelId][compareMetricId]) : null,
  })), [allMonthsWithData, data, compareChannelId, compareMetricId]);

  function handleFiles(fileList) {
    setFileError('');
    Array.from(fileList).forEach((file) => {
      if (file.size > MAX_FILE_BYTES) { setFileError(`"${file.name}" dépasse 1,6 Mo — trop lourd pour être stocké ici.`); return; }
      const ext = file.name.split('.').pop().toLowerCase();
      const isCsv = ext === 'csv' || file.type === 'text/csv';
      const isPdf = ext === 'pdf' || file.type === 'application/pdf';
      const isImage = file.type.startsWith('image/');
      if (!isCsv && !isPdf && !isImage) { setFileError(`"${file.name}" : format non pris en charge (image, PDF ou CSV uniquement).`); return; }
      if (isCsv) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const parsed = Papa.parse(e.target.result, { header: true, skipEmptyLines: true });
          const rows = parsed.data.slice(0, 100);
          const record = { id: uid('file'), name: file.name, kind: 'csv', size: file.size, month, addedAt: Date.now(), headers: parsed.meta.fields || [], rows };
          setFiles((prev) => { const next = [record, ...prev]; persistFiles(next); return next; });
        };
        reader.readAsText(file);
      } else {
        const reader = new FileReader();
        reader.onload = (e) => {
          const record = { id: uid('file'), name: file.name, kind: isImage ? 'image' : 'pdf', size: file.size, month, addedAt: Date.now(), dataUrl: e.target.result };
          setFiles((prev) => { const next = [record, ...prev]; persistFiles(next); return next; });
        };
        reader.readAsDataURL(file);
      }
    });
  }
  function removeFile(id) { const next = files.filter((f) => f.id !== id); persistFiles(next); }

  function lastNumericInColumn(rows, col) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const v = rows[i]?.[col];
      if (v !== undefined && v !== '' && !Number.isNaN(Number(v))) return Number(v);
    }
    return null;
  }
  function insertCsvValue() {
    const file = files.find((f) => f.id === csvInsert.fileId);
    if (!file || !csvInsert.column) return;
    const val = lastNumericInColumn(file.rows, csvInsert.column);
    if (val === null) { setFileError("Aucune valeur numérique trouvée dans cette colonne."); return; }
    setData((prev) => {
      const next = { ...prev };
      next[csvInsert.targetMonth] = { ...(next[csvInsert.targetMonth] || {}) };
      next[csvInsert.targetMonth][csvInsert.channelId] = { ...(next[csvInsert.targetMonth][csvInsert.channelId] || {}), [csvInsert.metricId]: val };
      persistData(next);
      return next;
    });
  }

  const csvFiles = files.filter((f) => f.kind === 'csv');
  const insertChannel = channels.find((c) => c.id === csvInsert.channelId) || channels[0];

  if (!loaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, fontFamily: 'ui-sans-serif, system-ui', gap: 8 }}><Loader2 className="spin" size={18} /> Chargement…</div>;
  }

  return (
    <div className="vd-shell">
      <style>{`
        .vd-shell { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; background: #F4F4F5; border-radius: 26px; padding: 14px; max-width: 1180px; margin: 0 auto; color: #171522; }
        .vd-num { font-variant-numeric: tabular-nums; }
        .spin { animation: vd-spin 1s linear infinite; } @keyframes vd-spin { to { transform: rotate(360deg); } }
        .vd-layout { display: flex; gap: 6px; align-items: flex-start; }
        .vd-sidebar { width: 176px; flex-shrink: 0; padding: 18px 10px; }
        .vd-brand { display: flex; align-items: center; gap: 9px; padding: 4px 8px 22px 8px; }
        .vd-brand-mark { width: 30px; height: 30px; border-radius: 9px; background: #171522; display: flex; align-items: center; justify-content: center; }
        .vd-brand-name { font-weight: 800; font-size: 15px; letter-spacing: -0.2px; }
        .vd-brand-sub { font-size: 10.5px; color: #8B879C; margin-top: -2px; }
        .vd-nav { display: flex; flex-direction: column; gap: 2px; }
        .vd-navitem { display: flex; align-items: center; gap: 9px; padding: 9px 11px; border-radius: 11px; font-size: 13px; color: #6E6A80; cursor: pointer; border: none; background: transparent; text-align: left; width: 100%; }
        .vd-navitem.active { background: #FFFFFF; color: #171522; font-weight: 700; box-shadow: 0 2px 10px rgba(23,21,34,0.06); }
        .vd-navitem:hover:not(.active) { color: #171522; }

        .vd-main { flex: 1; background: #FFFFFF; border-radius: 22px; padding: 24px 26px 28px 26px; min-width: 0; }
        .vd-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .vd-h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.3px; margin: 0; }
        .vd-h1-sub { font-size: 12.5px; color: #8B879C; margin-top: 3px; }
        .vd-select { border: 1px solid #E7E4F0; border-radius: 10px; padding: 8px 12px; font-size: 12.5px; background: #FBFAFD; color: #171522; }

        .vd-hero { background: #14121F; border-radius: 20px; padding: 22px 24px; color: #fff; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .vd-hero-label { font-size: 12.5px; color: #B4AFC6; margin-bottom: 6px; }
        .vd-hero-value { font-size: 34px; font-weight: 800; letter-spacing: -0.5px; }
        .vd-hero-delta { display: flex; align-items: center; gap: 4px; font-size: 12.5px; margin-top: 8px; }

        .vd-kpi-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .vd-kpi { border-radius: 16px; padding: 14px 16px; border: 1px solid #EDEDED; }
        .vd-kpi-label { font-size: 11.5px; color: rgba(23,21,34,0.55); margin-bottom: 8px; }
        .vd-kpi-value { font-size: 19px; font-weight: 800; }
        .vd-kpi-delta { font-size: 11.5px; margin-top: 5px; display: inline-flex; align-items: center; gap: 3px; font-weight: 600; }

        .vd-section-title { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #8B879C; font-weight: 700; margin: 22px 0 10px 0; }
        .vd-section-title:first-child { margin-top: 0; }

        .vd-acct-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .vd-acct-card { border: 1px solid #F1EFF7; border-radius: 16px; padding: 15px 16px; background: #FBFAFD; }
        .vd-acct-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .vd-acct-name { font-size: 12.5px; font-weight: 700; line-height: 1.25; }
        .vd-acct-value-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px; }
        .vd-acct-value { font-size: 22px; font-weight: 800; }
        .vd-acct-delta { font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 6px; }
        .vd-acct-metriclabel { font-size: 10.5px; color: #A6A2B8; }
        .vd-acct-divider { border-top: 1px solid #F1EFF7; margin: 10px 0; }
        .vd-acct-secondary { display: flex; gap: 18px; }
        .vd-acct-sec-label { font-size: 10px; color: #A6A2B8; text-transform: uppercase; letter-spacing: 0.3px; }
        .vd-acct-sec-value { font-size: 13px; font-weight: 700; margin-top: 2px; }
        .vd-acct-note { font-size: 11px; color: #8B879C; font-style: italic; margin-top: 10px; }

        .vd-pill-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .vd-pill { display: flex; align-items: center; gap: 7px; padding: 6px 12px 6px 6px; border-radius: 999px; border: 1px solid #E7E4F0; background: #fff; cursor: pointer; font-size: 12.5px; font-weight: 600; color: #6E6A80; }
        .vd-pill.active { border-color: #171522; color: #171522; background: #F6F5FC; }

        .vd-chart-box { border: 1px solid #F1EFF7; border-radius: 16px; padding: 14px 10px 4px 4px; background: #FBFAFD; margin-bottom: 24px; }
        .vd-repartition-box { display: flex; align-items: center; gap: 28px; padding: 20px; }
        .vd-repartition-legend { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .vd-repart-row { display: flex; align-items: center; gap: 10px; }
        .vd-repart-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
        .vd-repart-name { font-size: 13px; font-weight: 600; flex: 1; }
        .vd-repart-value { font-size: 13px; font-weight: 700; }
        .vd-repart-pct { font-size: 12px; color: #A1A1AA; width: 38px; text-align: right; }
        .vd-watch-box { border: 1px solid #EDEDED; border-radius: 16px; background: #fff; margin-bottom: 24px; overflow: hidden; }
        .vd-watch-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #F4F4F5; cursor: pointer; }
        .vd-watch-row:last-child { border-bottom: none; }
        .vd-watch-row:hover { background: #FAFAFA; }
        .vd-watch-name { font-size: 13px; font-weight: 700; width: 190px; flex-shrink: 0; }
        .vd-watch-sub { font-size: 12px; color: #A1A1AA; flex: 1; }
        .vd-watch-badge { font-size: 11.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; }
        .vd-chart-card-head { display: flex; align-items: center; justify-content: space-between; padding: 0 10px 4px 10px; }
        .vd-latest-badge { font-size: 12px; font-weight: 700; background: #171522; color: #fff; padding: 5px 11px; border-radius: 999px; }

        .vd-heat-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; }
        .vd-heat-label { width: 200px; flex-shrink: 0; display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; }
        .vd-heat-cells { display: flex; gap: 6px; }
        .vd-heat-cell { width: 40px; height: 30px; border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
        .vd-heat-months { display: flex; gap: 6px; margin: 0 0 6px 210px; }
        .vd-heat-month-label { width: 40px; text-align: center; font-size: 10px; color: #A6A2B8; text-transform: uppercase; }

        .vd-monthnav { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .vd-navbtn { width: 30px; height: 30px; border-radius: 9px; border: 1px solid #E7E4F0; background: #FBFAFD; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .vd-navbtn:hover { background: #F1EFF7; }
        .vd-monthlabel { font-weight: 800; font-size: 16px; min-width: 150px; text-align: center; }
        .vd-jumpbtn { font-size: 12px; color: #18181B; background: #F0F0F1; border: none; padding: 7px 12px; border-radius: 9px; cursor: pointer; font-weight: 600; }

        .vd-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .vd-card { border: 1px solid #F1EFF7; border-radius: 14px; padding: 14px 16px; background: #FBFAFD; }
        .vd-card-name { font-size: 13px; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
        .vd-metric-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; gap: 8px; }
        .vd-metric-label { font-size: 12px; color: #6E6A80; flex: 1; }
        .vd-input { width: 92px; font-size: 13px; border: 1px solid #E7E4F0; border-radius: 8px; padding: 6px 8px; text-align: right; background: #fff; }
        .vd-input:focus { outline: none; border-color: #18181B; }
        .vd-unit { font-size: 11px; color: #A6A2B8; width: 20px; }
        .vd-note { width: 100%; margin-top: 8px; border: 1px solid #E7E4F0; border-radius: 8px; padding: 7px 9px; font-size: 12px; font-family: inherit; resize: vertical; box-sizing: border-box; }
        .vd-note:focus { outline: none; border-color: #18181B; }

        .vd-savebar { display: flex; align-items: center; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .vd-savebtn { display: flex; align-items: center; gap: 7px; background: #171522; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; font-size: 13px; cursor: pointer; font-weight: 600; }
        .vd-savebtn:disabled { opacity: 0.35; cursor: default; }
        .vd-savestatus { font-size: 12px; color: #6E6A80; display: flex; align-items: center; gap: 5px; }

        .vd-summary-banner { border-radius: 16px; background: #F6F5FC; border: 1px solid #E7E4F0; padding: 16px 18px; margin-top: 22px; }
        .vd-summary-title { font-size: 13px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }

        .vd-drop { border: 1.5px dashed #D8D4EC; border-radius: 16px; padding: 26px; text-align: center; cursor: pointer; background: #FBFAFD; margin-bottom: 22px; }
        .vd-drop:hover { background: #F5F3FC; border-color: #18181B; }
        .vd-filelist { display: flex; flex-direction: column; gap: 8px; }
        .vd-fileitem { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid #F1EFF7; border-radius: 12px; background: #FBFAFD; }
        .vd-fileicon { width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .vd-filename { font-size: 12.5px; font-weight: 700; }
        .vd-filemeta { font-size: 11px; color: #A6A2B8; }
        .vd-iconbtn { border: none; background: transparent; cursor: pointer; color: #A6A2B8; display: flex; align-items: center; padding: 5px; border-radius: 7px; }
        .vd-iconbtn:hover { background: #F1EFF7; color: #B23A5D; }
        .vd-thumb { width: 34px; height: 34px; border-radius: 9px; object-fit: cover; flex-shrink: 0; }

        .vd-csv-preview-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
        .vd-csv-preview-table th { text-align: left; padding: 6px 8px; color: #8B879C; font-weight: 700; border-bottom: 1px solid #F1EFF7; font-size: 10.5px; text-transform: uppercase; }
        .vd-csv-preview-table td { padding: 6px 8px; border-bottom: 1px solid #F6F5FC; }
        .vd-csv-scroll { overflow-x: auto; max-width: 100%; }

        .vd-inserter { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-top: 14px; padding: 12px; background: #F6F5FC; border-radius: 12px; }

        .vd-error { font-size: 12px; color: #B23A5D; background: #FBEAEF; border-radius: 9px; padding: 8px 12px; margin-bottom: 14px; }

        .vd-settings-channel { border: 1px solid #F1EFF7; border-radius: 14px; padding: 14px 16px; margin-bottom: 14px; background: #FBFAFD; }
        .vd-settings-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
        .vd-name-input { font-size: 14px; font-weight: 700; border: 1px solid transparent; border-radius: 8px; padding: 5px 7px; background: transparent; flex: 1; }
        .vd-name-input:hover, .vd-name-input:focus { border-color: #E7E4F0; background: #fff; outline: none; }
        .vd-metric-edit-row { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
        .vd-metric-edit-row input { border: 1px solid #E7E4F0; border-radius: 8px; padding: 6px 9px; font-size: 12.5px; }
        .vd-addbtn { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: #171522; background: #F1EFF7; border: none; padding: 7px 11px; border-radius: 9px; cursor: pointer; margin-top: 4px; font-weight: 600; }
        .vd-addchannel { display: flex; align-items: center; gap: 6px; font-size: 13px; background: #171522; color: #fff; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 600; }
        .vd-empty { text-align: center; padding: 60px 20px; color: #A6A2B8; font-size: 13px; }
      `}</style>

      <div className="vd-layout">
        <div className="vd-sidebar">
          <div className="vd-brand">
            <div className="vd-brand-mark">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" fill="#18181B" /><circle cx="12" cy="12" r="7" stroke="#18181B" strokeWidth="1.6" /><circle cx="12" cy="12" r="11" stroke="#4A4560" strokeWidth="1.2" /></svg>
            </div>
            <div>
              <div className="vd-brand-name">Radar</div>
              <div className="vd-brand-sub">Veille marketing</div>
            </div>
          </div>
          <div className="vd-nav">
            <button className={`vd-navitem ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}><LayoutGrid size={15} /> Vue d'ensemble</button>
            <button className={`vd-navitem ${tab === 'entry' ? 'active' : ''}`} onClick={() => setTab('entry')}><CalendarClock size={15} /> Saisie mensuelle</button>
            <button className={`vd-navitem ${tab === 'compare' ? 'active' : ''}`} onClick={() => setTab('compare')}><BarChart3 size={15} /> Comparaison</button>
            <button className={`vd-navitem ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}><Paperclip size={15} /> Fichiers</button>
            <button className={`vd-navitem ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}><Settings2 size={15} /> Paramètres</button>
          </div>
        </div>

        <div className="vd-main">
          {tab === 'overview' && (
            <>
              <div className="vd-topbar">
                <div>
                  <p className="vd-h1">Vue d'ensemble</p>
                  <p className="vd-h1-sub">Suivi mois par mois de tous vos canaux</p>
                </div>
                {allMonthsWithData.length > 0 && (
                  <select className="vd-select" value={overviewMonth} onChange={(e) => setOverviewMonth(e.target.value)}>
                    {allMonthsWithData.slice().reverse().map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
                  </select>
                )}
              </div>

              {allMonthsWithData.length === 0 ? (
                <div className="vd-empty">Aucune donnée pour l'instant.<br />Va dans « Saisie mensuelle » pour ajouter ton premier mois.</div>
              ) : (
                <>
                  <div className="vd-hero">
                    <div>
                      <div className="vd-hero-label">Volume total — {monthLabel(overviewMonth)}</div>
                      <div className="vd-hero-value vd-num">{fmt(heroTotal)}</div>
                      <div style={{ fontSize: 11, color: '#7B7690', marginTop: 4 }}>somme des indicateurs principaux, tous canaux confondus</div>
                      {heroDelta !== null && (
                        <div className="vd-hero-delta" style={{ color: heroDelta >= 0 ? '#7EE0AE' : '#F0A5B8' }}>
                          {heroDelta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {Math.abs(heroDelta).toFixed(1)}% vs mois précédent
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {heroPeak && heroPeak.month && (
                        <div style={{ fontSize: 11.5, color: '#B4AFC6', marginBottom: 6 }}>Pic <strong style={{ color: '#fff' }}>{fmt(heroPeak.value)}</strong> le <strong style={{ color: '#fff' }}>{monthShort(heroPeak.month)}</strong></div>
                      )}
                      <svg width="120" height="40" viewBox="0 0 100 32">
                        {sparkPath(heroSparkline) && <path d={sparkPath(heroSparkline)} fill="none" stroke="#fff" strokeWidth="2.4" />}
                      </svg>
                    </div>
                  </div>

                  <div className="vd-kpi-row">
                    {overviewSummary.map((s) => (
                      <div className="vd-kpi" key={s.group} style={{ background: s.bg }}>
                        <div className="vd-kpi-label">{s.group}</div>
                        <div className="vd-kpi-value vd-num" style={{ color: s.accent }}>{fmt(s.value)}</div>
                        {s.delta !== null && (
                          <div className="vd-kpi-delta" style={{ color: s.delta >= 0 ? '#2F8F5E' : '#B23A5D' }}>{s.delta >= 0 ? '▲' : '▼'} {Math.abs(s.delta).toFixed(1)}%</div>
                        )}
                      </div>
                    ))}
                  </div>

                  <p className="vd-section-title">Répartition du volume total</p>
                  <div className="vd-chart-box vd-repartition-box">
                    <div style={{ position: 'relative', width: 190, height: 190, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={repartition} dataKey="value" nameKey="group" innerRadius="62%" outerRadius="98%" paddingAngle={3} stroke="none">
                            {repartition.map((r) => <Cell key={r.group} fill={GROUP_COLOR[r.group]} />)}
                          </Pie>
                          <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E7E4F0' }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ fontSize: 20, fontWeight: 800 }} className="vd-num">{fmt(heroTotal)}</div>
                        <div style={{ fontSize: 10.5, color: '#A1A1AA' }}>total</div>
                      </div>
                    </div>
                    <div className="vd-repartition-legend">
                      {repartition.map((r) => (
                        <div className="vd-repart-row" key={r.group}>
                          <span className="vd-repart-dot" style={{ background: GROUP_COLOR[r.group] }} />
                          <span className="vd-repart-name">{r.group}</span>
                          <span className="vd-repart-value vd-num">{fmt(r.value)}</span>
                          <span className="vd-repart-pct">{r.pct.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {watchList.length > 0 && (
                    <>
                      <p className="vd-section-title">À surveiller</p>
                      <div className="vd-watch-box">
                        {watchList.map((w) => (
                          <div className="vd-watch-row" key={w.channelId} onClick={() => { setMonth(overviewMonth); setTab('entry'); }}>
                            <PlatformTile channelId={w.channelId} size={28} />
                            <span className="vd-watch-name">{w.name}</span>
                            <span className="vd-watch-sub">{w.kind === 'missing' ? 'Pas de donnée ce mois-ci' : 'En baisse vs mois précédent'}</span>
                            <span className="vd-watch-badge" style={{ background: w.kind === 'missing' ? '#F4F4F5' : '#FBEAEF', color: w.kind === 'missing' ? '#71717A' : '#B23A5D' }}>{w.badge}</span>
                            <ChevronRight size={16} color="#A1A1AA" />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <p className="vd-section-title">Comptes connectés</p>
                  <div className="vd-acct-grid">
                    {channels.map((c) => {
                      const m0 = c.metrics[0], m1 = c.metrics[1], m2 = c.metrics[2];
                      const val = m0 ? data[overviewMonth]?.[c.id]?.[m0.id] : undefined;
                      const delta = m0 ? channelDelta(c.id, m0.id, overviewMonth) : null;
                      const note = data[overviewMonth]?.[c.id]?.__note;
                      return (
                        <div className="vd-acct-card" key={c.id}>
                          <div className="vd-acct-head">
                            <PlatformTile channelId={c.id} size={34} />
                            <div className="vd-acct-name">{c.name}</div>
                          </div>
                          <div className="vd-acct-value-row">
                            <span className="vd-acct-value vd-num">{fmt(val)}</span>
                            {delta !== null && <span className="vd-acct-delta" style={{ background: delta >= 0 ? '#DEF3E7' : '#FBEAEF', color: delta >= 0 ? '#2F8F5E' : '#B23A5D' }}>{delta >= 0 ? '+' : ''}{delta.toFixed(1)}%</span>}
                          </div>
                          <div className="vd-acct-metriclabel">{m0?.name}{m0?.unit ? ` (${m0.unit})` : ''}</div>
                          {(m1 || m2) && (
                            <>
                              <div className="vd-acct-divider" />
                              <div className="vd-acct-secondary">
                                {m1 && <div><div className="vd-acct-sec-label">{m1.name}</div><div className="vd-acct-sec-value vd-num">{fmt(data[overviewMonth]?.[c.id]?.[m1.id])}{m1.unit ? ` ${m1.unit}` : ''}</div></div>}
                                {m2 && <div><div className="vd-acct-sec-label">{m2.name}</div><div className="vd-acct-sec-value vd-num">{fmt(data[overviewMonth]?.[c.id]?.[m2.id])}{m2.unit ? ` ${m2.unit}` : ''}</div></div>}
                              </div>
                            </>
                          )}
                          {note && <div className="vd-acct-note">{note}</div>}
                        </div>
                      );
                    })}
                  </div>

                  <div className="vd-topbar">
                    <p className="vd-section-title" style={{ margin: 0 }}>Tendance</p>
                    <select className="vd-select" value={barGroup} onChange={(e) => setBarGroup(e.target.value)}>
                      {GROUP_ORDER.filter((g) => groupedChannels[g]).map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="vd-pill-row">
                    {(groupedChannels[barGroup] || []).map((c) => (
                      <button key={c.id} className={`vd-pill ${trendChannelId === c.id ? 'active' : ''}`} onClick={() => setTrendChannelId(c.id)}>
                        <PlatformTile channelId={c.id} size={20} /> {c.name}
                      </button>
                    ))}
                  </div>
                  <div className="vd-chart-box">
                    <div className="vd-chart-card-head">
                      <span style={{ fontSize: 12, color: '#8B879C' }}>{trendMetric?.name}</span>
                      {trendLatest !== null && <span className="vd-latest-badge">{fmt(trendLatest)}</span>}
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={trendSeries} margin={{ top: 16, right: 16, bottom: 0, left: 0 }}>
                        <defs>
                          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={trendColor} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={trendColor} stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#F1EFF7" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A6A2B8' }} axisLine={{ stroke: '#E7E4F0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#A6A2B8' }} axisLine={false} tickLine={false} width={46} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E7E4F0' }} />
                        <Area type="monotone" dataKey="value" stroke={trendColor} strokeWidth={2.4} fill="url(#trendFill)" connectNulls dot={{ r: 3, fill: trendColor }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="vd-topbar">
                    <p className="vd-section-title" style={{ margin: 0 }}>Comparatif du mois par canal</p>
                  </div>
                  <div className="vd-chart-box">
                    <ResponsiveContainer width="100%" height={Math.max(120, barData.length * 46)}>
                      <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 24, bottom: 5, left: 0 }}>
                        <CartesianGrid stroke="#F1EFF7" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: '#A6A2B8' }} axisLine={{ stroke: '#E7E4F0' }} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12, fill: '#171522' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E7E4F0' }} formatter={(v, n, p) => [fmt(v), p.payload.metricName]} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                          {barData.map((d, i) => <Cell key={i} fill={d.value === barMax && d.value > 0 ? '#A1A1AA' : '#27272A'} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {heatmapMonths.length > 0 && (
                    <>
                      <p className="vd-section-title">Vue mensuelle</p>
                      <div className="vd-chart-box" style={{ padding: '16px 16px 18px 16px' }}>
                        <div className="vd-heat-months">{heatmapMonths.map((m) => <div key={m} className="vd-heat-month-label">{monthShort(m)}</div>)}</div>
                        {channels.map((c) => {
                          const m0 = c.metrics[0]; if (!m0) return null;
                          const cells = heatCellStyle(c.id, m0.id);
                          return (
                            <div className="vd-heat-row" key={c.id}>
                              <div className="vd-heat-label"><PlatformTile channelId={c.id} size={22} />{c.name}</div>
                              <div className="vd-heat-cells">
                                {cells.map((cell, i) => (
                                  <div key={i} className="vd-heat-cell" style={{ background: cell.empty ? '#F1EFF7' : `rgba(24,24,27,${cell.alpha.toFixed(2)})`, color: !cell.empty && cell.alpha > 0.5 ? '#fff' : '#8B879C' }}>
                                    {cell.empty ? '' : fmt(cell.value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'entry' && (
            <>
              <div className="vd-topbar">
                <div>
                  <p className="vd-h1">Saisie mensuelle</p>
                  <p className="vd-h1-sub">Renseigne les chiffres de chaque canal</p>
                </div>
              </div>
              <div className="vd-monthnav">
                <button className="vd-navbtn" onClick={() => { setMonth(shiftMonth(month, -1)); setShowSummary(false); }}><ChevronLeft size={16} /></button>
                <span className="vd-monthlabel">{monthLabel(month)}</span>
                <button className="vd-navbtn" onClick={() => { setMonth(shiftMonth(month, 1)); setShowSummary(false); }}><ChevronRight size={16} /></button>
                {month !== currentMonthKey() && <button className="vd-jumpbtn" onClick={() => setMonth(currentMonthKey())}>Revenir au mois en cours</button>}
              </div>

              {GROUP_ORDER.filter((g) => groupedChannels[g]).map((group) => (
                <div key={group}>
                  <p className="vd-section-title">{group}</p>
                  <div className="vd-card-grid">
                    {groupedChannels[group].map((c) => (
                      <div className="vd-card" key={c.id}>
                        <div className="vd-card-name"><PlatformTile channelId={c.id} size={22} />{c.name}</div>
                        {c.metrics.map((m) => (
                          <div className="vd-metric-row" key={m.id}>
                            <span className="vd-metric-label">{m.name}</span>
                            <input className="vd-input" type="number" step="any" placeholder="—" value={data[month]?.[c.id]?.[m.id] ?? ''} onChange={(e) => { setValue(c.id, m.id, e.target.value); setShowSummary(false); }} />
                            <span className="vd-unit">{m.unit}</span>
                          </div>
                        ))}
                        <textarea className="vd-note" rows={2} placeholder="Note / à retenir (optionnel)" value={data[month]?.[c.id]?.__note ?? ''} onChange={(e) => { setNote(c.id, e.target.value); setShowSummary(false); }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="vd-savebar">
                {saveState === 'saved' && <span className="vd-savestatus"><Check size={13} /> Enregistré</span>}
                <button className="vd-savebtn" onClick={saveMonth} disabled={!dirty && saveState !== 'saving'}>
                  {saveState === 'saving' ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
                  Enregistrer les données de {monthLabel(month)}
                </button>
              </div>

              {showSummary && (
                <div className="vd-summary-banner">
                  <div className="vd-summary-title">
                    Résumé de {monthLabel(month)}
                    <button className="vd-iconbtn" onClick={() => setShowSummary(false)}><X size={14} /></button>
                  </div>
                  <div className="vd-kpi-row" style={{ marginBottom: 0 }}>
                    {computeSummary(month).map((s) => (
                      <div className="vd-kpi" key={s.group} style={{ background: s.bg }}>
                        <div className="vd-kpi-label">{s.group}</div>
                        <div className="vd-kpi-value vd-num" style={{ color: s.accent, fontSize: 17 }}>{fmt(s.value)}</div>
                        {s.delta !== null && (
                          <div className="vd-kpi-delta" style={{ color: s.delta >= 0 ? '#2F8F5E' : '#B23A5D' }}>{s.delta >= 0 ? '▲' : '▼'} {Math.abs(s.delta).toFixed(1)}%</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'compare' && (
            <>
              <div className="vd-topbar"><div><p className="vd-h1">Comparaison</p><p className="vd-h1-sub">Évolution d'un indicateur mois par mois</p></div></div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <select className="vd-select" value={compareChannelId} onChange={(e) => setCompareChannelId(e.target.value)}>
                  {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select className="vd-select" value={compareMetricId} onChange={(e) => setCompareMetricId(e.target.value)}>
                  {compareChannel?.metrics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              {allMonthsWithData.length === 0 ? <div className="vd-empty">Aucune donnée à comparer pour l'instant.</div> : (
                <>
                  <div style={{ width: '100%', height: 250, marginBottom: 20 }}>
                    <ResponsiveContainer>
                      <LineChart data={compareSeries} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid stroke="#F1EFF7" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A6A2B8' }} axisLine={{ stroke: '#E7E4F0' }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#A6A2B8' }} axisLine={false} tickLine={false} width={50} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #E7E4F0' }} />
                        <Line type="monotone" dataKey="value" stroke="#18181B" strokeWidth={2.6} dot={{ r: 3 }} connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead><tr style={{ borderBottom: '1px solid #E7E4F0', textAlign: 'left' }}>
                      <th style={{ padding: '8px 6px', color: '#A6A2B8', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Mois</th>
                      <th style={{ padding: '8px 6px', color: '#A6A2B8', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Valeur</th>
                      <th style={{ padding: '8px 6px', color: '#A6A2B8', fontWeight: 700, fontSize: 11, textTransform: 'uppercase' }}>Évolution</th>
                    </tr></thead>
                    <tbody>
                      {allMonthsWithData.map((m, i) => {
                        const val = data[m]?.[compareChannelId]?.[compareMetricId];
                        const prevM = allMonthsWithData[i - 1];
                        const prevVal = prevM ? data[prevM]?.[compareChannelId]?.[compareMetricId] : undefined;
                        let delta = null;
                        if (val !== undefined && val !== '' && prevVal !== undefined && prevVal !== '' && Number(prevVal) !== 0) delta = ((Number(val) - Number(prevVal)) / Number(prevVal)) * 100;
                        return (
                          <tr key={m} style={{ borderBottom: '1px solid #F6F5FC' }}>
                            <td className="vd-num" style={{ padding: '7px 6px' }}>{monthLabel(m)}</td>
                            <td className="vd-num" style={{ padding: '7px 6px' }}>{fmt(val)}</td>
                            <td style={{ padding: '7px 6px' }}>{delta !== null ? <span style={{ color: delta >= 0 ? '#2F8F5E' : '#B23A5D' }}>{delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%</span> : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}

          {tab === 'files' && (
            <>
              <div className="vd-topbar"><div><p className="vd-h1">Fichiers</p><p className="vd-h1-sub">Captures d'écran, exports PDF ou CSV de tes plateformes</p></div></div>

              {fileError && <div className="vd-error">{fileError}</div>}

              <div className="vd-drop" onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}>
                <input ref={fileInputRef} type="file" accept="image/*,.pdf,.csv,text/csv" multiple style={{ display: 'none' }} onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }} />
                <UploadCloud size={22} color="#18181B" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 700 }}>Glisse un fichier ici ou clique pour parcourir</div>
                <div style={{ fontSize: 11.5, color: '#A6A2B8', marginTop: 3 }}>Images, PDF ou CSV — associé au mois de {monthLabel(month)} · 1,6 Mo max par fichier</div>
              </div>

              {files.length === 0 ? <div className="vd-empty">Aucun fichier importé pour l'instant.</div> : (
                <div className="vd-filelist">
                  {files.map((f) => (
                    <div className="vd-fileitem" key={f.id}>
                      {f.kind === 'image' ? <img src={f.dataUrl} className="vd-thumb" alt={f.name} /> : (
                        <div className="vd-fileicon" style={{ background: f.kind === 'csv' ? '#E1EAFB' : '#FBE7DA' }}>
                          {f.kind === 'csv' ? <FileSpreadsheet size={16} color="#3C63B0" /> : <FileText size={16} color="#C4643A" />}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="vd-filename">{f.name}</div>
                        <div className="vd-filemeta">{monthLabel(f.month)} · {fmtBytes(f.size)}{f.kind === 'csv' ? ` · ${f.rows.length} lignes` : ''}</div>
                      </div>
                      {f.dataUrl && (
                        <a href={f.dataUrl} download={f.name} className="vd-iconbtn" style={{ color: '#18181B' }}><Download size={15} /></a>
                      )}
                      <button className="vd-iconbtn" onClick={() => removeFile(f.id)}><Trash2 size={15} /></button>
                    </div>
                  ))}
                </div>
              )}

              {csvFiles.length > 0 && (
                <>
                  <p className="vd-section-title">Assistant d'import CSV</p>
                  <p style={{ fontSize: 12, color: '#8B879C', marginTop: -4, marginBottom: 10 }}>Choisis un fichier et une colonne : la dernière valeur numérique sera insérée dans l'indicateur choisi.</p>
                  <div className="vd-inserter">
                    <select className="vd-select" value={csvInsert.fileId} onChange={(e) => setCsvInsert((s) => ({ ...s, fileId: e.target.value, column: '' }))}>
                      <option value="">Fichier…</option>
                      {csvFiles.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    {csvInsert.fileId && (
                      <select className="vd-select" value={csvInsert.column} onChange={(e) => setCsvInsert((s) => ({ ...s, column: e.target.value }))}>
                        <option value="">Colonne…</option>
                        {csvFiles.find((f) => f.id === csvInsert.fileId)?.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    )}
                    <select className="vd-select" value={csvInsert.channelId} onChange={(e) => setCsvInsert((s) => ({ ...s, channelId: e.target.value, metricId: channels.find((c) => c.id === e.target.value)?.metrics[0]?.id }))}>
                      {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select className="vd-select" value={csvInsert.metricId} onChange={(e) => setCsvInsert((s) => ({ ...s, metricId: e.target.value }))}>
                      {insertChannel?.metrics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                    <select className="vd-select" value={csvInsert.targetMonth} onChange={(e) => setCsvInsert((s) => ({ ...s, targetMonth: e.target.value }))}>
                      {Array.from({ length: 13 }, (_, i) => shiftMonth(currentMonthKey(), 6 - i)).map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
                    </select>
                    <button className="vd-jumpbtn" style={{ background: '#171522', color: '#fff' }} onClick={insertCsvValue} disabled={!csvInsert.fileId || !csvInsert.column}>Insérer</button>
                  </div>

                  {csvInsert.fileId && (
                    <div className="vd-csv-scroll">
                      <table className="vd-csv-preview-table">
                        <thead><tr>{csvFiles.find((f) => f.id === csvInsert.fileId)?.headers.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                        <tbody>
                          {csvFiles.find((f) => f.id === csvInsert.fileId)?.rows.slice(0, 6).map((row, i) => (
                            <tr key={i}>{csvFiles.find((f) => f.id === csvInsert.fileId)?.headers.map((h) => <td key={h}>{row[h]}</td>)}</tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'settings' && (
            <>
              <div className="vd-topbar"><div><p className="vd-h1">Paramètres</p><p className="vd-h1-sub">Personnalise les canaux et indicateurs suivis</p></div></div>
              {channels.map((c) => (
                <div className="vd-settings-channel" key={c.id}>
                  <div className="vd-settings-header">
                    <PlatformTile channelId={c.id} size={26} />
                    <input className="vd-name-input" value={c.name} onChange={(e) => renameChannel(c.id, e.target.value)} />
                    <button className="vd-iconbtn" onClick={() => removeChannel(c.id)}><Trash2 size={15} /></button>
                  </div>
                  {c.metrics.map((m) => (
                    <div className="vd-metric-edit-row" key={m.id}>
                      <input style={{ flex: 2 }} value={m.name} onChange={(e) => renameMetric(c.id, m.id, 'name', e.target.value)} placeholder="Nom de l'indicateur" />
                      <input style={{ flex: 1, width: 60 }} value={m.unit} onChange={(e) => renameMetric(c.id, m.id, 'unit', e.target.value)} placeholder="Unité" />
                      <button className="vd-iconbtn" onClick={() => removeMetric(c.id, m.id)}><X size={14} /></button>
                    </div>
                  ))}
                  <button className="vd-addbtn" onClick={() => addMetric(c.id)}><Plus size={13} /> Ajouter un indicateur</button>
                </div>
              ))}
              <button className="vd-addchannel" onClick={addChannel}><Plus size={14} /> Ajouter un canal</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
