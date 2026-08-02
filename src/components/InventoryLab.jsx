/**
 * InventoryLab.jsx
 * Full-page sandbox for building an Ansible inventory and testing
 * --limit patterns against it.
 *
 * Layout:
 *   Left  — Inventory builder (groups + hosts, visual editor + import)
 *   Right — Limit tester (pattern input + per-group result breakdown)
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import {
  Server, Users, Plus, Trash2, Filter, X,
  CheckCircle2, XCircle, ChevronRight, AlertTriangle,
  RefreshCw, ChevronDown, Upload, ClipboardPaste, FileInput, Copy, Check,
  ArrowRightLeft,
} from 'lucide-react'
import { matchHostPattern } from '../lib/ansibleLimit'
import { parseInventoryText, mergeInventories } from '../lib/parseInventory'

// ── Default sandbox inventory ────────────────────────────────────────────────
const DEFAULT_INVENTORY = {
  all:        ['web-01', 'web-02', 'db-01', 'db-02', 'cache-01'],
  web:        ['web-01', 'web-02'],
  db:         ['db-01', 'db-02'],
  cache:      ['cache-01'],
  production: ['web-01', 'db-01', 'cache-01'],
  staging:    ['web-02', 'db-02'],
}

// ── Replace/Append modal ─────────────────────────────────────────────────────

function ImportModal({ parsed, format, onConfirm, onCancel }) {
  const { t } = useTranslation()
  const groupCount = Object.keys(parsed).length
  const hostCount  = new Set(Object.values(parsed).flat()).size
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="rounded-xl border border-slate-700 bg-slate-900 shadow-2xl p-6 w-[calc(100%-2rem)] max-w-[380px] flex flex-col gap-4 animate-scale-in">
        <div className="flex items-center gap-2">
          <FileInput size={16} className="text-emerald-400" />
          <span className="text-emerald-400 font-mono font-semibold text-sm uppercase tracking-widest">{t('inventoryLab.importModal.title')}</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          {t('inventoryLab.importModal.detected')} <span className="text-amber-300 font-mono">{format.toUpperCase()}</span> {t('inventoryLab.importModal.inventoryWith')}{' '}
          <span className="text-cyan-300 font-mono">{t('inventoryLab.importModal.groupCount', { count: groupCount })}</span> {t('inventoryLab.importModal.and')}{' '}
          <span className="text-cyan-300 font-mono">{t('inventoryLab.importModal.hostCount', { count: hostCount })}</span>.
        </p>
        <p className="text-slate-400 text-xs">{t('inventoryLab.importModal.whatToDo')}</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => onConfirm('replace')}
            className="flex-1 py-2 rounded border border-red-800 bg-red-950 text-red-300
              text-xs font-mono hover:border-red-600 hover:text-red-200 transition-all"
          >
            {t('inventoryLab.importModal.replace')}
          </button>
          <button
            onClick={() => onConfirm('append')}
            className="flex-1 py-2 rounded border border-emerald-700 bg-emerald-950 text-emerald-300
              text-xs font-mono hover:border-emerald-500 hover:text-emerald-200 transition-all"
          >
            {t('inventoryLab.importModal.append')}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 rounded border border-slate-700 text-slate-500
              text-xs font-mono hover:text-slate-300 transition-all"
          >
            {t('inventoryLab.importModal.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Inventory Editor ─────────────────────────────────────────────────────────

function HostPill({ name, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2 pr-1 py-1 sm:py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
      {name}
      <button
        onClick={onRemove}
        className="text-slate-600 hover:text-red-400 transition-colors ml-0.5 p-1"
      >
        <XCircle size={11} />
      </button>
    </span>
  )
}

function GroupRow({ groupName, hosts, allHosts, onAddHost, onRemoveHost, onRemoveGroup, isAll }) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const [open, setOpen] = useState(false)

  const handleAdd = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onAddHost(groupName, trimmed)
    setInput('')
  }

  return (
    <div className="rounded border border-slate-800 bg-slate-900 mb-2 overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border-b border-slate-800">
        <button onClick={() => setOpen(v => !v)} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <Users size={12} className="text-emerald-500 shrink-0" />
        <span className="text-emerald-300 font-mono text-xs font-semibold flex-1">{groupName}</span>
        <span className="text-slate-600 text-[10px] font-mono">{t('inventoryLab.groupRow.hostCount', { count: hosts.length })}</span>
        {!isAll && (
          <button
            onClick={() => onRemoveGroup(groupName)}
            className="text-slate-700 hover:text-red-400 transition-colors ml-1 p-1"
            title={t('inventoryLab.groupRow.removeGroup')}
          >
            <Trash2 size={11} />
          </button>
        )}
      </div>

      {open && (
        <div className="px-3 py-2 animate-fade-in">
          {/* Host pills */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {hosts.length === 0 && (
              <span className="text-slate-700 text-[10px] font-mono italic">{t('inventoryLab.groupRow.noHosts')}</span>
            )}
            {hosts.map((h) => (
              <HostPill
                key={h}
                name={h}
                onRemove={() => onRemoveHost(groupName, h)}
              />
            ))}
          </div>

          {/* Add host row */}
          <div className="flex items-center gap-1.5 mt-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder={t('inventoryLab.groupRow.hostnamePlaceholder')}
              list={`hosts-datalist-${groupName}`}
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-600
                rounded px-2 py-0.5 text-[10px] font-mono text-slate-200
                outline-none transition-colors placeholder:text-slate-700 min-w-0"
            />
            <datalist id={`hosts-datalist-${groupName}`}>
              {allHosts.filter((h) => !hosts.includes(h)).map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
            <button
              onClick={handleAdd}
              disabled={!input.trim()}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700
                text-[10px] font-mono text-slate-500 hover:text-emerald-300 hover:border-emerald-700 min-h-[36px] sm:min-h-0
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={10} />
              {t('inventoryLab.groupRow.add')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InventoryEditor({ inventory, hostvars, onInventoryChange, onHostvarsChange, onSyncToPlaybook }) {
  const { t } = useTranslation()
  const [newGroup, setNewGroup]       = useState('')
  const [isDragging, setIsDragging]   = useState(false)
  const [importError, setImportError] = useState(null)
  const [pending, setPending]         = useState(null)
  const [cmdCopied, setCmdCopied]     = useState(false)
  const fileInputRef = useRef(null)

  const allHosts = useMemo(() => [...new Set(Object.values(inventory).flat())].sort(), [inventory])

  // ── Mutation helpers ──────────────────────────────────────────
  const handleAddHost = useCallback((group, host) => {
    const trimmed = host.trim()
    if (!trimmed) return
    onInventoryChange((prev) => ({
      ...prev,
      [group]: prev[group].includes(trimmed) ? prev[group] : [...prev[group], trimmed],
      ...(group !== 'all' && prev.all && !prev.all.includes(trimmed)
        ? { all: [...prev.all, trimmed] }
        : {}),
    }))
  }, [onInventoryChange])

  const handleRemoveHost = useCallback((group, host) => {
    onInventoryChange((prev) => ({
      ...prev,
      [group]: prev[group].filter((h) => h !== host),
    }))
  }, [onInventoryChange])

  const handleRemoveGroup = useCallback((group) => {
    onInventoryChange((prev) => {
      const next = { ...prev }
      delete next[group]
      return next
    })
  }, [onInventoryChange])

  const handleAddGroup = () => {
    const name = newGroup.trim()
    if (!name || inventory[name]) return
    onInventoryChange((prev) => ({ ...prev, [name]: [] }))
    setNewGroup('')
  }

  const handleReset = () => { onInventoryChange(DEFAULT_INVENTORY); onHostvarsChange({}) }

  // ── Import pipeline ───────────────────────────────────────────
  const tryImport = useCallback((text) => {
    setImportError(null)
    const { groups, format, hostvars, error } = parseInventoryText(text)
    if (error || !groups) {
      setImportError(error || t('inventoryLab.editor.couldNotParse'))
      return
    }
    setPending({ groups, format, hostvars: hostvars ?? {} })
  }, [t])

  const handleConfirm = useCallback((mode) => {
    if (!pending) return
    onInventoryChange((prev) => mergeInventories(prev, pending.groups, mode))
    if (mode === 'replace') {
      onHostvarsChange(pending.hostvars ?? {})
    } else {
      onHostvarsChange((prev) => ({ ...prev, ...(pending.hostvars ?? {}) }))
    }
    setPending(null)
  }, [pending, onInventoryChange, onHostvarsChange])

  // File upload
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => tryImport(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }, [tryImport])

  // Drag & drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => tryImport(ev.target.result)
      reader.readAsText(file)
    } else {
      // Plain text dragged in
      const text = e.dataTransfer.getData('text/plain')
      if (text) tryImport(text)
    }
  }, [tryImport])

  // Paste anywhere on this panel
  const handlePaste = useCallback((e) => {
    const text = e.clipboardData?.getData('text/plain')
    if (text && text.trim()) {
      e.preventDefault()
      tryImport(text)
    }
  }, [tryImport])

  const groupOrder = ['all', ...Object.keys(inventory).filter((g) => g !== 'all').sort()]

  return (
    <>
      {pending && (
        <ImportModal
          parsed={pending.groups}
          format={pending.format}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}

      <div
        className={`flex flex-col h-full overflow-hidden transition-colors
          ${isDragging ? 'bg-emerald-950/20' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="rounded-xl border-2 border-dashed border-emerald-500/60 bg-emerald-950/70 px-8 py-6 flex flex-col items-center gap-2">
              <Upload size={24} className="text-emerald-400" />
              <span className="text-emerald-300 text-xs font-mono">{t('inventoryLab.editor.dropInventoryFile')}</span>
            </div>
          </div>
        )}

        {/* Section header */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0">
          <Server size={14} className="text-emerald-400" />
          <span className="text-emerald-400 text-xs font-mono font-semibold uppercase tracking-widest flex-1">
            {t('inventoryLab.editor.title')}
          </span>
          <span className="text-slate-600 text-[10px] font-mono">{t('inventoryLab.editor.hostCount', { count: allHosts.length })}</span>
          {allHosts.length > 0 && (
            <button
              onClick={() => onSyncToPlaybook?.({ inventory, hostvars })}
              title={t('inventoryLab.editor.useInPlaybookTitle')}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700
                text-[10px] font-mono text-slate-500 hover:text-cyan-300 hover:border-cyan-700 transition-all min-h-[36px] sm:min-h-0"
            >
              <ArrowRightLeft size={10} />
              {t('inventoryLab.editor.useInPlaybook')}
            </button>
          )}
          <button
            data-tour="inventory-import"
            onClick={() => fileInputRef.current?.click()}
            title={t('inventoryLab.editor.uploadTitle')}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700
              text-[10px] font-mono text-slate-500 hover:text-emerald-300 hover:border-emerald-700 transition-all min-h-[36px] sm:min-h-0"
          >
            <Upload size={10} />
            {t('inventoryLab.editor.import')}
          </button>
          <input ref={fileInputRef} type="file" accept=".json,.ini,.cfg,.yml,.yaml,.inv,*" className="hidden" onChange={handleFileChange} />
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700
              text-[10px] font-mono text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all min-h-[36px] sm:min-h-0"
          >
            <RefreshCw size={10} />
            {t('inventoryLab.editor.reset')}
          </button>
        </div>

        {/* Command hint + import bar */}
        <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-950 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[10px] font-mono shrink-0">{t('inventoryLab.editor.exportFrom')}</span>
            <code className="flex-1 min-w-0 overflow-x-auto whitespace-nowrap bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[10px] font-mono text-emerald-300 select-all">
              ansible-inventory -i &lt;source&gt; --list &gt; inventory.json
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText('ansible-inventory -i <source> --list > inventory.json')
                setCmdCopied(true)
                setTimeout(() => setCmdCopied(false), 2000)
              }}
              title={t('inventoryLab.editor.copyCommandTitle')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono transition-all
                min-h-[36px] sm:min-h-0
                ${cmdCopied
                  ? 'border-emerald-700 text-emerald-300 bg-emerald-950'
                  : 'border-slate-700 text-slate-500 hover:text-emerald-300 hover:border-emerald-700'}`}
            >
              {cmdCopied ? <Check size={10} /> : <Copy size={10} />}
              {cmdCopied ? t('inventoryLab.editor.copied') : t('inventoryLab.editor.copy')}
            </button>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-slate-600 text-[10px] font-mono flex flex-wrap items-center gap-1.5">
              {t('inventoryLab.editor.thenPart')} <ClipboardPaste size={10} /> {t('inventoryLab.editor.pastePart')} <Upload size={10} /> {t('inventoryLab.editor.dragPart')}
            </span>
            {importError && (
              <span className="flex items-center gap-1 text-red-400 text-[10px] font-mono sm:ml-auto">
                <AlertTriangle size={10} />{importError}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 relative">
          {groupOrder.map((group) => (
            inventory[group] !== undefined && (
              <GroupRow
                key={group}
                groupName={group}
                hosts={inventory[group]}
                allHosts={allHosts}
                onAddHost={handleAddHost}
                onRemoveHost={handleRemoveHost}
                onRemoveGroup={handleRemoveGroup}
                isAll={group === 'all'}
              />
            )
          ))}

          {/* Add group row */}
          <div className="flex flex-col gap-2 mt-2 sm:flex-row sm:items-center">
            <input
              type="text"
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
              placeholder={t('inventoryLab.editor.newGroupPlaceholder')}
              className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-700
                rounded px-2 py-1 text-[10px] font-mono text-slate-300
                outline-none transition-colors placeholder:text-slate-700"
            />
            <button
              onClick={handleAddGroup}
              disabled={!newGroup.trim() || !!inventory[newGroup.trim()]}
              className="flex items-center gap-1 px-3 py-1 rounded border border-slate-700
                text-[10px] font-mono text-slate-500 hover:text-emerald-300 hover:border-emerald-700 min-h-[36px] sm:min-h-0
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Plus size={10} />
              {t('inventoryLab.editor.addGroup')}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Host detail modal ─────────────────────────────────────────────────────────────

// ── Host detail sidebar ──────────────────────────────────────────────────────────

function HostDetailSidebar({ host, hostvars, inventory, onClose, onGroupClick }) {
  const { t } = useTranslation()
  const attrs = hostvars?.[host] ?? {}
  const entries = Object.entries(attrs)
  const [copiedKey, setCopiedKey] = useState(null)
  const [isMobile, setIsMobile] = useState(() => globalThis.innerWidth < 768)

  useEffect(() => {
    const mq = globalThis.matchMedia('(max-width: 767px)')
    const handler = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const copyValue = useCallback((k, v) => {
    navigator.clipboard?.writeText(String(v))
    setCopiedKey(k)
    setTimeout(() => setCopiedKey(null), 2000)
  }, [])

  const groups = useMemo(
    () => Object.entries(inventory)
      .filter(([g, hosts]) => g !== 'all' && hosts.includes(host))
      .map(([g]) => g)
      .sort(),
    [host, inventory]
  )

  const content = (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0 bg-slate-900">
        <Server size={13} className="text-emerald-400 shrink-0" />
        <span className="text-emerald-300 font-mono font-semibold text-xs flex-1 truncate" title={host}>{host}</span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white transition-colors rounded p-0.5 hover:bg-slate-700"
          title={t('inventoryLab.hostDetail.closeTitle')}
        >
          <X size={13} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group membership */}
        <div className="px-4 py-3 border-b border-slate-800/60">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2">{t('inventoryLab.hostDetail.memberOf')}</p>
          {groups.length === 0 ? (
            <span className="text-slate-700 text-[10px] font-mono italic">{t('inventoryLab.hostDetail.noGroups')}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {groups.map((g) => (
                <button
                  key={g}
                  onClick={() => onGroupClick?.(g)}
                  title={t('inventoryLab.hostDetail.addToLimitTitle', { group: g })}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono
                    bg-slate-900 border border-slate-700 text-slate-300
                    hover:border-emerald-600 hover:text-emerald-300 hover:bg-emerald-950/30 min-h-[32px] sm:min-h-0
                    transition-all cursor-pointer"
                >
                  <Users size={8} className="text-emerald-500 shrink-0" />
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Host variables */}
        <div className="px-4 py-3">
          <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-3">{t('inventoryLab.hostDetail.hostVariables')}</p>
          {entries.length === 0 ? (
            <p className="text-slate-600 text-[11px] font-mono leading-relaxed">
              {t('inventoryLab.hostDetail.noVariablesPrefix')} <code className="text-slate-500">_meta.hostvars</code>.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {entries.map(([k, v]) => (
                <div key={k}>
                  <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-0.5">{k}</p>
                  <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 flex items-center gap-2 group">
                    <span className="text-[11px] font-mono text-cyan-300 break-all flex-1">{String(v)}</span>
                    <button
                      onClick={() => copyValue(k, v)}
                      title={t('inventoryLab.hostDetail.copyValueTitle')}
                      className={`shrink-0 transition-colors ${
                        copiedKey === k ? 'text-emerald-400' : 'text-slate-600 hover:text-cyan-400'
                      }`}
                    >
                      {copiedKey === k ? <Check size={10} /> : <Copy size={10} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )

  // Desktop: render inline as a sidebar panel in the flex row
  if (!isMobile) {
    return (
      <div className="w-64 shrink-0 border-l border-slate-800 flex flex-col overflow-hidden">
        {content}
      </div>
    )
  }

  // Mobile: portal to body so fixed positioning isn't broken by overflow-y-auto ancestors
  return createPortal(
    <>
      <button
        aria-label={t('inventoryLab.hostDetail.closeHostDetails')}
        className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-40 max-h-[65vh] rounded-t-xl border border-slate-800 bg-slate-950 flex flex-col overflow-hidden animate-slide-in-drawer">
        {content}
      </div>
    </>,
    document.body
  )
}

// ── Limit autocomplete input ───────────────────────────────────────────────────

function LimitInput({ value, onChange, inventory, dataTour }) {
  const { t } = useTranslation()
  const [showSugg, setShowSugg] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const inputRef = useRef(null)

  const allGroups = useMemo(() => Object.keys(inventory).sort(), [inventory])
  const allHosts  = useMemo(() => [...new Set(Object.values(inventory).flat())].sort(), [inventory])

  // Token currently being typed — text after the last operator char
  const currentToken = useMemo(() => {
    const m = value.match(/(?:^|[:|!&,])([^:|!&,]*)$/)
    return m ? m[1] : ''
  }, [value])

  const suggestions = useMemo(() => {
    if (!currentToken) return []
    const q = currentToken.toLowerCase()
    const groups = allGroups
      .filter((g) => g.toLowerCase().startsWith(q))
      .map((g) => ({ name: g, kind: 'group' }))
    const hosts = allHosts
      .filter((h) => h.toLowerCase().startsWith(q) && !allGroups.includes(h))
      .map((h) => ({ name: h, kind: 'host' }))
    return [...groups, ...hosts].slice(0, 14)
  }, [currentToken, allGroups, allHosts])

  const apply = useCallback((name) => {
    const next = value.replace(/([^:|!&,]*)$/, name)
    onChange(next)
    setShowSugg(false)
    inputRef.current?.focus()
  }, [value, onChange])

  const handleKeyDown = (e) => {
    if (!showSugg || suggestions.length === 0) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Tab' || e.key === 'Enter') { e.preventDefault(); apply(suggestions[activeIdx]?.name ?? '') }
    if (e.key === 'Escape')    { setShowSugg(false) }
  }

  return (
    <div data-tour={dataTour} className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setShowSugg(true); setActiveIdx(0) }}
        onKeyDown={handleKeyDown}
        onFocus={() => { setShowSugg(true); setActiveIdx(0) }}
        onBlur={() => setTimeout(() => setShowSugg(false), 150)}
        placeholder={t('inventoryLab.limitInput.placeholder')}
        className="w-full bg-slate-900 border border-slate-700 focus:border-amber-600
          rounded px-3 py-1.5 text-[12px] font-mono text-slate-200
          outline-none transition-colors placeholder:text-slate-700"
      />
      {showSugg && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-30 mt-1 rounded border border-slate-700 bg-slate-900 shadow-xl overflow-hidden animate-slide-down">
          {suggestions.map((s, i) => (
            <button
              key={s.name}
              onMouseDown={(e) => { e.preventDefault(); apply(s.name) }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono text-left transition-colors
                ${i === activeIdx ? 'bg-amber-950 text-amber-200' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
            >
              <span className={`text-[9px] px-1.5 py-px rounded font-bold
                ${s.kind === 'group' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                {s.kind === 'group' ? 'G' : 'H'}
              </span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Host result badge ─────────────────────────────────────────────────────────────


function MatchedHostBadge({ name, matched, hasHostvars, onClick, style }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      style={style}
      title={hasHostvars ? t('inventoryLab.limitTester.clickToViewAttrs') : name}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono border transition-all animate-pop-in
        min-h-[34px] sm:min-h-0
        ${matched
          ? 'bg-emerald-950 border-emerald-700 text-emerald-300 hover:border-emerald-500 hover:bg-emerald-900'
          : 'bg-slate-900 border-slate-800 text-slate-600 line-through hover:border-slate-600'
        }
        ${hasHostvars ? 'cursor-pointer' : 'cursor-default'}`}
    >
      {matched ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
      {name}
      {hasHostvars && <Server size={8} className="opacity-40 ml-0.5" />}
    </button>
  )
}

// ── Group result card ────────────────────────────────────────────────────────

const EXAMPLE_PATTERNS = [
  { pattern: 'web',              descKey: 'inventoryLab.limitTester.examples.singleGroup' },
  { pattern: 'web:db',           descKey: 'inventoryLab.limitTester.examples.union' },
  { pattern: 'production:&web',  descKey: 'inventoryLab.limitTester.examples.intersection' },
  { pattern: 'all:!staging',     descKey: 'inventoryLab.limitTester.examples.excludeGroup' },
  { pattern: 'web-0*',           descKey: 'inventoryLab.limitTester.examples.wildcard' },
  { pattern: 'web-01,db-01',     descKey: 'inventoryLab.limitTester.examples.commaList' },
]

function GroupResultCard({ groupName, groupHosts, matchedSet, limit, hostvars, onHostClick }) {
  const { t } = useTranslation()
  const hasLimit = limit && limit.trim()
  const matchCount = groupHosts.filter((h) => matchedSet.has(h)).length

  const isFullMatch = matchCount === groupHosts.length
  const isNoMatch   = matchCount === 0
  const isPartial   = !isFullMatch && !isNoMatch

  let borderColor = 'border-slate-800'
  if (hasLimit) {
    if (isFullMatch && groupHosts.length > 0) borderColor = 'border-emerald-800'
    else if (isNoMatch && groupHosts.length > 0) borderColor = 'border-red-900/60'
    else if (isPartial) borderColor = 'border-amber-800/60'
  }

  return (
    <div className={`rounded border ${borderColor} bg-slate-900 p-3 mb-2`}>
      <div className="flex items-center gap-2 mb-2">
        <Users size={11} className="text-emerald-500 shrink-0" />
        <span className="text-emerald-300 font-mono text-xs font-semibold">{groupName}</span>
        {hasLimit && groupHosts.length > 0 && (
          <span className={`ml-auto text-[10px] font-mono
            ${isFullMatch ? 'text-emerald-400' : isNoMatch ? 'text-red-400' : 'text-amber-400'}`}
          >
            {t('inventoryLab.limitTester.groupMatched', { matched: matchCount, total: groupHosts.length })}
          </span>
        )}
        {!hasLimit && (
          <span className="ml-auto text-slate-600 text-[10px] font-mono">
            {t('inventoryLab.editor.hostCount', { count: groupHosts.length })}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {groupHosts.length === 0 && (
          <span className="text-slate-700 text-[10px] italic">{t('inventoryLab.limitTester.empty')}</span>
        )}
        {groupHosts.map((h, idx) => (
          <MatchedHostBadge
            key={h}
            name={h}
            matched={!hasLimit || matchedSet.has(h)}
            hasHostvars={!!(hostvars?.[h] && Object.keys(hostvars[h]).length > 0)}
            onClick={() => onHostClick?.(h)}
            style={{ animationDelay: `${idx * 18}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

function LimitTester({ inventory, hostvars, selectedHost, onHostClick, limit, onLimitChange }) {
  const { t } = useTranslation()
  const [showRef, setShowRef] = useState(false)

  // Also support comma-separated (ansible accepts both : and ,)
  const normalisedLimit = limit.replace(/,/g, ':')

  const matchedSet = useMemo(() => {
    if (!normalisedLimit.trim()) return null
    return matchHostPattern(normalisedLimit, inventory)
  }, [normalisedLimit, inventory])

  const allHosts = useMemo(() => [...new Set(Object.values(inventory).flat())].sort(), [inventory])

  const totalMatched = matchedSet ? matchedSet.size : allHosts.length

  const groupOrder = ['all', ...Object.keys(inventory).filter((g) => g !== 'all').sort()]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Section header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 shrink-0">
        <Filter size={14} className="text-amber-400" />
        <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest flex-1">
          {t('inventoryLab.limitTester.title')}
        </span>
        {matchedSet && (
          <span className={`text-[10px] font-mono ${totalMatched === 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {t('inventoryLab.limitTester.matchedCount', { matched: totalMatched, total: allHosts.length, count: allHosts.length })}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Pattern input */}
        <div className="mb-4">
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
            {t('inventoryLab.limitTester.limitPatternLabel')}
          </label>
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
            <code className="text-slate-600 text-[11px] font-mono shrink-0">--limit</code>
            <LimitInput
              value={limit}
              onChange={onLimitChange}
              inventory={inventory}
              dataTour="limit-input"
            />
            {limit && (
              <button
                onClick={() => onLimitChange('')}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
              >
                {t('inventoryLab.limitTester.clear')}
              </button>
            )}
          </div>

          {/* Zero-match warning */}
          {matchedSet && totalMatched === 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-red-400 text-[11px] font-mono">
              <AlertTriangle size={11} />
              {t('inventoryLab.limitTester.noHostsMatch')}
            </div>
          )}
        </div>

        {/* Examples + Syntax reference — collapsible */}
        <div className="mb-4 rounded border border-slate-800 overflow-hidden">
          <button
            onClick={() => setShowRef((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 transition-colors text-left"
          >
            <ChevronRight size={12} className={`text-slate-500 transition-transform ${showRef ? 'rotate-90' : ''}`} />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{t('inventoryLab.limitTester.examplesAndSyntax')}</span>
          </button>

          {showRef && (
            <div className="px-3 pb-3 bg-slate-900/60 flex flex-col gap-3 pt-2">
              {/* Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {EXAMPLE_PATTERNS.map(({ pattern, descKey }) => (
                  <button
                    key={pattern}
                    onClick={() => onLimitChange(pattern)}
                    className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded border text-[10px] font-mono text-left transition-all
                      ${limit === pattern
                        ? 'border-amber-700 bg-amber-950 text-amber-300'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                  >
                    <span>{pattern}</span>
                    <span className="text-slate-600 text-[9px]">{t(descKey)}</span>
                  </button>
                ))}
              </div>

              {/* Syntax reference */}
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[10px] font-mono border-t border-slate-800 pt-2">
                <code className="text-amber-300">group1:group2</code><span className="text-slate-400">{t('inventoryLab.limitTester.syntaxUnion')}</span>
                <code className="text-amber-300">group1:&amp;group2</code><span className="text-slate-400">{t('inventoryLab.limitTester.syntaxIntersection')}</span>
                <code className="text-amber-300">group1:!group2</code><span className="text-slate-400">{t('inventoryLab.limitTester.syntaxDifference')}</span>
                <code className="text-amber-300">web-0*</code><span className="text-slate-400">{t('inventoryLab.limitTester.syntaxWildcard')}</span>
                <code className="text-amber-300">all</code><span className="text-slate-400">{t('inventoryLab.limitTester.syntaxAll')}</span>
                <code className="text-amber-300">host1,host2</code><span className="text-slate-400">{t('inventoryLab.limitTester.syntaxComma')}</span>
              </div>
            </div>
          )}
        </div>

        {/* Per-group breakdown */}
        <div data-tour="limit-results">
        <div className="text-[10px] font-mono text-slate-600 uppercase tracking-wider mb-2">
          {t('inventoryLab.limitTester.groupsHeader')}
        </div>
        {groupOrder.map((group) => (
          inventory[group] !== undefined && (
            <GroupResultCard
              key={group}
              groupName={group}
              groupHosts={inventory[group]}
              matchedSet={matchedSet ?? new Set(allHosts)}
              limit={limit}
              hostvars={hostvars}
              onHostClick={onHostClick}
            />
          )
        ))}
        </div>
      </div>
    </div>
  )
}

// ── Page root ────────────────────────────────────────────────────────────────

const LS_INVENTORY = 'ansible101:inventory'
const LS_HOSTVARS  = 'ansible101:hostvars'

function loadInventory() {
  try {
    const raw = localStorage.getItem(LS_INVENTORY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return DEFAULT_INVENTORY
}

function loadHostvars() {
  try {
    const raw = localStorage.getItem(LS_HOSTVARS)
    if (raw) return JSON.parse(raw)
  } catch {}
  return {}
}

export default function InventoryLab({ initialShareState = null, onShareStateChange, onSyncToPlaybook }) {
  const [inventory, setInventoryRaw] = useState(() => initialShareState?.inventory ?? loadInventory())
  const [hostvars, setHostvarsRaw]   = useState(() => initialShareState?.hostvars ?? loadHostvars())
  const [selectedHost, setSelectedHost] = useState(null)
  const [limit, setLimit] = useState(() => initialShareState?.limit ?? '')

  useEffect(() => {
    if (!initialShareState) return
    setInventoryRaw(initialShareState.inventory ?? DEFAULT_INVENTORY)
    setHostvarsRaw(initialShareState.hostvars ?? {})
    setLimit(initialShareState.limit ?? '')
    setSelectedHost(null)
  }, [initialShareState])

  const handleGroupClick = useCallback((g) => {
    setLimit((prev) => prev ? prev + ':' + g : g)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSelectedHost(null) }
    globalThis.addEventListener('keydown', handler)
    return () => globalThis.removeEventListener('keydown', handler)
  }, [])

  const setInventory = useCallback((updater) => {
    setInventoryRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try { localStorage.setItem(LS_INVENTORY, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  const setHostvars = useCallback((updater) => {
    setHostvarsRaw((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      try { localStorage.setItem(LS_HOSTVARS, JSON.stringify(next)) } catch {}
      return next
    })
  }, [])

  useEffect(() => {
    onShareStateChange?.({ inventory, hostvars, limit })
  }, [inventory, hostvars, limit, onShareStateChange])

  return (
    <div className="flex flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden animate-fade-up">
      {/* Left — inventory builder */}
      <div data-tour="inventory-editor" className="w-full h-[50vh] shrink-0 border-b border-slate-800 overflow-hidden flex flex-col relative md:h-auto md:w-[40%] md:min-w-[280px] md:border-b-0 md:border-r">
        <InventoryEditor
          inventory={inventory}
          hostvars={hostvars}
          onInventoryChange={setInventory}
          onHostvarsChange={setHostvars}
          onSyncToPlaybook={onSyncToPlaybook}
        />
      </div>

      {/* Middle — limit tester */}
      <div className="flex-1 h-[45vh] shrink-0 overflow-hidden flex flex-col min-w-0 md:h-auto md:min-h-0">
        <LimitTester
          inventory={inventory}
          hostvars={hostvars}
          selectedHost={selectedHost}
          onHostClick={setSelectedHost}
          limit={limit}
          onLimitChange={setLimit}
        />
      </div>

      {/* Right — host detail sidebar (slides in when a host is selected) */}
      {selectedHost && (
        <HostDetailSidebar
          host={selectedHost}
          hostvars={hostvars}
          inventory={inventory}
          onClose={() => setSelectedHost(null)}
          onGroupClick={handleGroupClick}
        />
      )}
    </div>
  )
}
