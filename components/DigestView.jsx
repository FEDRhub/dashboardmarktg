'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { fetchStoreValue } from '../lib/publicStore';
import { Linkedin, Instagram as InstagramIcon, Youtube, Globe, Mail, Music2, Users } from 'lucide-react';

const CONFIG_KEY = 'veille-dashboard-config-v5';
const DATA_KEY = 'veille-dashboard-data-v5';

const GROUP_ORDER = ['Analytics web', 'Newsletter', 'Réseaux sociaux', 'Podcast', 'Plateforme CLUB'];
const GROUP_STYLE = {
  'Analytics web': '#3F3F46',
  'Newsletter': '#52525B',
  'Réseaux sociaux': '#18181B',
  'Podcast': '#A1A1AA',
  'Plateforme CLUB': '#71717A',
};
const PLATFORM_ICON = { website: Globe, newsletter: Mail, li_vo: Linkedin, li_vul: Linkedin, li_fed: Linkedin, instagram: InstagramIcon, youtube: Youtube, spotify: Music2, club: Users };
const PLATFORM_COLOR = { website: '#1F7A8C', newsletter: '#FF7A59', li_vo: '#0A66C2', li_vul: '#0A66C2', li_fed: '#0A66C2', youtube: '#E02020', spotify: '#1DB954', club: '#7A4FBF' };
const INSTAGRAM_GRADIENT = 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF,#515BD4)';

function PlatformTile({ channelId, size = 32 }) {
  const Icon = PLATFORM_ICON[channelId] || Users;
  const isInsta = channelId === 'instagram';
  const bg = PLATFORM_COLOR[channelId] || '#6C63FF';
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.3), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isInsta ? INSTAGRAM_GRADIENT : bg }}>
      <Icon size={Math.round(size * 0.55)} color="#fff" strokeWidth={2} />
    </div>
  );
}

const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
function monthLabel(key) { const [y, m] = key.split('-').map(Number); return `${MONTHS_FR[m - 1]} ${y}`; }
function fmt(n) {
  if (n === undefined || n === null || n === '') return '—';
  const num = Number(n); if (Number.isNaN(num)) return '—';
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
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

export default function DigestView() {
  const [channels, setChannels] = useState([]);
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const cfgRaw = await fetchStoreValue(CONFIG_KEY);
        const dataRaw = await fetchStoreValue(DATA_KEY);
        const cfg = cfgRaw ? JSON.parse(cfgRaw) : DEFAULT_CHANNELS;
        const d = dataRaw ? JSON.parse(dataRaw) : {};
        setChannels(cfg);
        setData(d);
        const months = Object.keys(d).sort();
        if (months.length) setMonth(months[months.length - 1]);
      } catch (e) {
        console.error(e);
        setLoadError("Impossible de charger le digest pour le moment.");
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const groupedChannels = useMemo(() => {
    const g = {}; channels.forEach((c) => { (g[c.group] = g[c.group] || []).push(c); }); return g;
  }, [channels]);

  const allMonths = useMemo(() => Object.keys(data).sort(), [data]);

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

  const prevMonth = useMemo(() => {
    const idx = allMonths.indexOf(month);
    return idx > 0 ? allMonths[idx - 1] : null;
  }, [allMonths, month]);

  const familySummary = useMemo(() => GROUP_ORDER.filter((g) => groupedChannels[g]?.length).map((g) => {
    const val = groupSum(month, g);
    const prevVal = prevMonth ? groupSum(prevMonth, g) : null;
    let delta = null;
    if (val !== null && prevVal !== null && prevVal !== 0) delta = ((val - prevVal) / prevVal) * 100;
    return { group: g, value: val, delta };
  }), [month, prevMonth, groupedChannels, data]);

  const heroTotal = useMemo(() => familySummary.reduce((s, r) => s + (r.value || 0), 0), [familySummary]);
  const heroDelta = useMemo(() => {
    if (!prevMonth) return null;
    const prevTotal = GROUP_ORDER.reduce((s, g) => s + (groupSum(prevMonth, g) || 0), 0);
    if (!prevTotal) return null;
    return ((heroTotal - prevTotal) / prevTotal) * 100;
  }, [heroTotal, prevMonth, groupedChannels, data]);

  function channelDelta(channelId, metricId) {
    if (!prevMonth) return null;
    const val = data[month]?.[channelId]?.[metricId];
    const prevVal = data[prevMonth]?.[channelId]?.[metricId];
    if (val === undefined || val === '' || prevVal === undefined || prevVal === '' || Number(prevVal) === 0) return null;
    return ((Number(val) - Number(prevVal)) / Number(prevVal)) * 100;
  }

  if (!loaded) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'ui-sans-serif, system-ui' }}>Chargement…</div>;
  }
  if (loadError) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'ui-sans-serif, system-ui', color: '#B23A5D' }}>{loadError}</div>;
  }
  if (allMonths.length === 0) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'ui-sans-serif, system-ui', color: '#71717A' }}>Aucune donnée publiée pour l'instant.</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4F4F5', fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', padding: '32px 16px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#18181B' }}>Digest — Veille marketing</h1>
            <p style={{ fontSize: 13, color: '#71717A', margin: '4px 0 0 0' }}>Résumé mensuel, lecture seule</p>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ border: '1px solid #E4E4E7', borderRadius: 10, padding: '8px 12px', fontSize: 13, background: '#fff', color: '#18181B' }}
          >
            {allMonths.slice().reverse().map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
          </select>
        </div>

        <div style={{ background: '#18181B', borderRadius: 18, padding: '22px 24px', color: '#fff', marginBottom: 20 }}>
          <div style={{ fontSize: 12.5, color: '#B4AFC6', marginBottom: 6 }}>Volume total — {monthLabel(month)}</div>
          <div style={{ fontSize: 32, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>{fmt(heroTotal)}</div>
          <div style={{ fontSize: 11, color: '#7B7690', marginTop: 4 }}>somme des indicateurs principaux, tous canaux confondus</div>
          {heroDelta !== null && (
            <div style={{ fontSize: 12.5, marginTop: 8, color: heroDelta >= 0 ? '#7EE0AE' : '#F0A5B8' }}>
              {heroDelta >= 0 ? '▲' : '▼'} {Math.abs(heroDelta).toFixed(1)}% vs mois précédent
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: 28 }}>
          {familySummary.map((s) => (
            <div key={s.group} style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: 14, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#71717A', marginBottom: 6 }}>{s.group}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#18181B' }}>{fmt(s.value)}</div>
              {s.delta !== null && (
                <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: s.delta >= 0 ? '#2F8F5E' : '#B23A5D' }}>
                  {s.delta >= 0 ? '▲' : '▼'} {Math.abs(s.delta).toFixed(1)}%
                </div>
              )}
            </div>
          ))}
        </div>

        {GROUP_ORDER.filter((g) => groupedChannels[g]).map((group) => (
          <div key={group} style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11.5, textTransform: 'uppercase', letterSpacing: 1, color: '#A1A1AA', fontWeight: 700, marginBottom: 10 }}>{group}</div>
            <div style={{ background: '#fff', border: '1px solid #E4E4E7', borderRadius: 16, overflow: 'hidden' }}>
              {groupedChannels[group].map((c, i) => {
                const m0 = c.metrics[0];
                const val = m0 ? data[month]?.[c.id]?.[m0.id] : undefined;
                const delta = m0 ? channelDelta(c.id, m0.id) : null;
                const note = data[month]?.[c.id]?.__note;
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderTop: i === 0 ? 'none' : '1px solid #F4F4F5' }}>
                    <PlatformTile channelId={c.id} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 700, color: '#18181B' }}>{c.name}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#18181B' }}>
                          {fmt(val)}{m0?.unit ? ` ${m0.unit}` : ''}
                          {delta !== null && (
                            <span style={{ fontSize: 11.5, fontWeight: 700, marginLeft: 8, color: delta >= 0 ? '#2F8F5E' : '#B23A5D' }}>
                              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
                            </span>
                          )}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>{m0?.name}</div>
                      {note && <div style={{ fontSize: 12, color: '#52525B', fontStyle: 'italic', marginTop: 6, lineHeight: 1.4 }}>{note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <p style={{ textAlign: 'center', fontSize: 11, color: '#A1A1AA', marginTop: 32 }}>Vue de lecture seule — pour modifier les données, contacte l'équipe.</p>
      </div>
    </div>
  );
}
