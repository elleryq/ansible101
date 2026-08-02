/**
 * ImportControls.jsx
 * Two explicit, click-driven import buttons — "Choose folder" and "Choose
 * .zip" — shared by the landing screen and ResolveView's empty state.
 * Drag-and-drop keeps working everywhere this is used; these buttons just
 * give folder/zip imports a discoverable click path too.
 */
/* eslint-disable react/prop-types */
import { useTranslation } from 'react-i18next'
import { FolderInput, FileArchive } from 'lucide-react'
import { readFolderInput, readZip, stripCommonRoot } from '../lib/useFileDrop'

export default function ImportControls({ onFiles, onError, onBusyChange, className = '' }) {
  const { t } = useTranslation()
  const handleFolderPick = async (e) => {
    const fileList = e.target.files
    e.target.value = ''
    onBusyChange?.(true)
    try {
      const results = await readFolderInput(fileList)
      if (results.length) onFiles?.(results)
      else onError?.(t('importControls.noFilesInFolder'))
    } catch (err) {
      onError?.(t('importControls.couldntReadFolder', { message: err.message || err }))
    } finally {
      onBusyChange?.(false)
    }
  }

  const handleZipPick = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    onBusyChange?.(true)
    try {
      const results = stripCommonRoot(await readZip(file))
      if (results.length) onFiles?.(results)
      else onError?.(t('importControls.noFilesInZip'))
    } catch (err) {
      onError?.(t('importControls.couldntReadZip', { message: err.message || err }))
    } finally {
      onBusyChange?.(false)
    }
  }

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-700 bg-cyan-950/40 hover:bg-cyan-950/70 hover:border-cyan-500 text-cyan-300 text-sm font-mono transition-all">
        <FolderInput size={14} />
        {t('importControls.chooseFolder')}
        <input type="file" webkitdirectory="" directory="" multiple className="hidden" onChange={handleFolderPick} />
      </label>
      <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-sm font-mono transition-all">
        <FileArchive size={14} />
        {t('importControls.chooseZip')}
        <input type="file" accept=".zip" className="hidden" onChange={handleZipPick} />
      </label>
    </div>
  )
}
