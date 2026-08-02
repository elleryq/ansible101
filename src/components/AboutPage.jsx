/* eslint-disable react/prop-types */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { BookOpen, Scale, ShieldCheck, ExternalLink } from 'lucide-react'

export default function AboutPage({ onNavigateHome }) {
  const { t } = useTranslation()
  return (
    <div className="h-screen md:h-[100dvh] overflow-y-auto bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-cyan-400 transition-colors hover:text-cyan-300"
          >
            <BookOpen size={18} />
            <span className="font-mono text-sm font-bold tracking-wider">
              Ansible<sup className="text-[8px] align-super">®</sup><span className="text-white">101</span>
            </span>
          </button>
          <span className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-slate-400">
            {t('about.badge')}
          </span>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
        <section className="max-w-3xl">
          <div className="mb-3 flex items-center gap-3 text-cyan-400">
            <Scale size={18} />
            <h1 className="font-mono text-2xl font-bold tracking-tight text-white">
              {t('about.heading')}
            </h1>
          </div>
          <p className="text-sm leading-7 text-slate-300">
            {t('about.intro')}
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={BookOpen}
            title={t('about.purpose.title')}
            body={t('about.purpose.body')}
          />
          <InfoCard
            icon={ShieldCheck}
            title={t('about.independence.title')}
            body={t('about.independence.body')}
          />
          <InfoCard
            icon={Scale}
            title={t('about.trademark.title')}
            body={t('about.trademark.body')}
          />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="mb-3 font-mono text-sm font-semibold uppercase tracking-widest text-cyan-400">
            {t('about.legalSummary.title')}
          </h2>
          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <p>
              {t('about.legalSummary.para1')}
            </p>
            <p>
              {t('about.legalSummary.para2')}
            </p>
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="font-mono">{t('about.needOfficialDocs')}</span>
          <a
            href="https://docs.ansible.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded border border-slate-700 px-3 py-1.5 font-mono text-cyan-400 transition-colors hover:border-cyan-700 hover:text-cyan-300"
          >
            docs.ansible.com
            <ExternalLink size={12} />
          </a>
        </section>
      </main>
    </div>
  )
}

function InfoCard({ icon: Icon, title, body }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center gap-2 text-cyan-400">
        <Icon size={16} />
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-white">
          {title}
        </h2>
      </div>
      <p className="text-sm leading-6 text-slate-300">{body}</p>
    </article>
  )
}
