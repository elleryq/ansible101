/**
 * LimitPanel.jsx
 * Interactive --limit tester for Ansible playbooks.
 * Shows which inventory hosts each play would target after applying
 * the play's hosts: pattern + the user-supplied --limit flag.
 */
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Filter, ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { applyLimit } from '../lib/ansibleLimit'

function HostBadge({ name, matched }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border transition-colors
        ${matched
          ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
          : 'bg-slate-900 border-slate-700 text-slate-600 line-through'
        }`}
    >
      {matched
        ? <CheckCircle2 size={9} className="shrink-0" />
        : <XCircle size={9} className="shrink-0" />
      }
      {name}
    </span>
  )
}

function PlayLimitRow({ play, inventory, limit }) {
  const { t } = useTranslation()
  const { playHosts, limitedHosts, skipped } = useMemo(
    () => applyLimit(play.hosts, limit, inventory),
    [play.hosts, limit, inventory]
  )

  const allKnown = useMemo(
    () => [...new Set(Object.values(inventory).flat())].sort(),
    [inventory]
  )

  // Hosts that are in-scope for this play (before limit)
  const playHostList = [...playHosts].sort()
  // Hosts that survive the limit
  const hasLimit = limit && limit.trim() !== ''

  return (
    <div className={`rounded border p-2.5 mb-2 text-[11px] transition-colors
      ${skipped && hasLimit
        ? 'border-red-900 bg-red-950/40'
        : 'border-slate-800 bg-slate-900'
      }`}
    >
      {/* Play name + hosts pattern */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-blue-400 font-mono font-semibold truncate">
          {play.name || play.hosts || t('limitPanel.playFallback')}
        </span>
        <span className="text-slate-600 font-mono text-[10px] shrink-0">{t('limitPanel.hostsLabel')} {play.hosts || 'all'}</span>
        {skipped && hasLimit && (
          <span className="ml-auto flex items-center gap-1 text-red-400 text-[10px] font-mono shrink-0">
            <AlertTriangle size={10} />
            {t('limitPanel.skipped')}
          </span>
        )}
        {!skipped && hasLimit && (
          <span className="ml-auto text-emerald-400 text-[10px] font-mono shrink-0">
            {t('limitPanel.matchedCount', { matched: limitedHosts.size, total: playHosts.size, count: playHosts.size })}
          </span>
        )}
        {!hasLimit && (
          <span className="ml-auto text-slate-500 text-[10px] font-mono shrink-0">
            {t('inventoryLab.editor.hostCount', { count: playHosts.size })}
          </span>
        )}
      </div>

      {/* Host badges */}
      <div className="flex flex-wrap gap-1">
        {allKnown.length === 0 && (
          <span className="text-slate-600 italic text-[10px]">
            {t('limitPanel.noHostsInInventory')}
          </span>
        )}
        {playHostList.map((host) => (
          <HostBadge
            key={host}
            name={host}
            matched={!hasLimit || limitedHosts.has(host)}
          />
        ))}
        {allKnown.length > 0 && playHostList.length === 0 && (
          <span className="text-slate-600 italic text-[10px]">
            {t('limitPanel.noHostsMatchPattern', { pattern: play.hosts })}
          </span>
        )}
      </div>
    </div>
  )
}

export default function LimitPanel({ plays, facts, limit, onLimitChange }) {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const inventory = useMemo(() => facts?.groups || {}, [facts])
  const allHostCount = useMemo(
    () => new Set(Object.values(inventory).flat()).size,
    [inventory]
  )

  if (!plays || plays.length === 0) return null

  return (
    <div className="flex flex-col border-t border-slate-700 bg-slate-950">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 px-3 py-2 text-xs font-mono font-semibold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors w-full text-left"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
        <Filter size={13} />
        {t('limitPanel.title')}
        <span className="ml-1 text-slate-500 normal-case font-normal tracking-normal">
          {t('limitPanel.hostCountInInventory', { count: allHostCount })}
        </span>
      </button>

      {!collapsed && (
        <div className="px-3 pb-3">
          {/* --limit input */}
          <div className="flex items-center gap-2 mb-3">
            <code className="text-[10px] font-mono text-slate-500 shrink-0">--limit</code>
            <input
              type="text"
              value={limit}
              onChange={(e) => onLimitChange(e.target.value)}
              placeholder={t('limitPanel.limitPlaceholder')}
              className="flex-1 bg-slate-900 border border-slate-700 focus:border-emerald-600
                rounded px-2 py-1 text-[11px] font-mono text-slate-200
                outline-none transition-colors placeholder:text-slate-600"
            />
            {limit && (
              <button
                onClick={() => onLimitChange('')}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors shrink-0"
              >
                {t('inventoryLab.limitTester.clear')}
              </button>
            )}
          </div>

          {/* Pattern cheatsheet */}
          {!limit && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[
                { label: 'web*', desc: t('limitPanel.cheatWildcard') },
                { label: 'g1:g2', desc: t('limitPanel.cheatUnion') },
                { label: 'g1:&g2', desc: t('limitPanel.cheatIntersect') },
                { label: 'g1:!g2', desc: t('limitPanel.cheatExclude') },
              ].map(({ label, desc }) => (
                <button
                  key={label}
                  onClick={() => onLimitChange(label)}
                  className="px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-700
                    text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all"
                  title={desc}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Per-play breakdown */}
          {plays.map((play, i) => (
            <PlayLimitRow
              key={i}
              play={play}
              inventory={inventory}
              limit={limit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
