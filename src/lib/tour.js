import { driver } from 'driver.js'
import i18n from '../i18n'

/**
 * Build a driver.js tour for the given mode.
 * Steps use `[data-tour="key"]` selectors so no IDs need to be set
 * on deeply nested elements.
 *
 * Some steps need to flip app state (e.g. switch tabs) the moment they're
 * reached, so the user doesn't have to click anything first. Pass a `hooks`
 * map of { [hookKey]: fn } and reference it from a step via `hookKey` - the
 * hook fires as soon as that step starts highlighting.
 *
 * Titles/descriptions are resolved from i18n at call time (not at module
 * load) so the tour always reflects the language active when it's started.
 */
export function startTour(mode, hooks = {}) {
  const steps = STEPS[mode]
  if (!steps || steps.length === 0) return

  const t = i18n.t.bind(i18n)

  const d = driver({
    showProgress: true,
    smoothScroll: true,
    nextBtnText: t('tour.common.next'),
    prevBtnText: t('tour.common.prev'),
    doneBtnText: t('tour.common.done'),
    steps: steps.map(({ selector, key, side, align, hookKey }) => {
      const hook = hookKey && hooks[hookKey]
      return {
        element: selector,
        onHighlightStarted: hook ? () => hook() : undefined,
        popover: {
          title: t(`tour.${mode}.${key}.title`),
          description: t(`tour.${mode}.${key}.description`),
          side: side ?? 'bottom',
          align: align ?? 'start',
        },
      }
    }),
  })

  d.drive()
}

const STEPS = {
  playbook: [
    { selector: '[data-tour="mode-tabs"]', key: 'modeTabs', side: 'bottom', align: 'center' },
    { selector: '[data-tour="editor-pane"]', key: 'editorPane', side: 'right' },
    { selector: '[data-tour="file-explorer"]', key: 'fileExplorer', side: 'right' },
    { selector: '[data-tour="flow-pane"]', key: 'flowPane', side: 'left' },
    { selector: '[data-tour="human-sidebar"]', key: 'humanSidebar', side: 'left' },
    { selector: '[data-tour="btn-vars"]', key: 'btnVars', side: 'bottom' },
    { selector: '[data-tour="btn-facts"]', key: 'btnFacts', side: 'bottom' },
    {
      selector: '[data-tour="view-tabs"]', key: 'viewTabs', side: 'bottom', align: 'center',
      hookKey: 'switchToResolve',
    },
    { selector: '[data-tour="resolver-pickers"]', key: 'resolverPickers', side: 'bottom', align: 'start' },
    { selector: '[data-tour="resolver-actions"]', key: 'resolverActions', side: 'bottom', align: 'end' },
    { selector: '[data-tour="resolver-groups"]', key: 'resolverGroups', side: 'bottom', align: 'start' },
    { selector: '[data-tour="resolver-filters"]', key: 'resolverFilters', side: 'bottom', align: 'start' },
    { selector: '[data-tour="resolver-extravars"]', key: 'resolverExtravars', side: 'bottom', align: 'start' },
    { selector: '[data-tour="resolver-mocks"]', key: 'resolverMocks', side: 'top', align: 'start' },
    { selector: '[data-tour="resolver-table"]', key: 'resolverTable', side: 'top', align: 'center' },
    {
      selector: '[data-tour="resolver-stack"]', key: 'resolverStack', side: 'left', align: 'start',
      hookKey: 'selectFirstVar',
    },
    { selector: '[data-tour="btn-share"]', key: 'btnShare', side: 'bottom' },
  ],

  snippet: [
    { selector: '[data-tour="mode-tabs"]', key: 'modeTabs', side: 'bottom', align: 'center' },
    { selector: '[data-tour="editor-pane"]', key: 'editorPane', side: 'right' },
    { selector: '[data-tour="snippet-pane"]', key: 'snippetPane', side: 'left' },
    { selector: '[data-tour="btn-facts"]', key: 'btnFacts', side: 'bottom' },
  ],

  jinja2: [
    { selector: '[data-tour="mode-tabs"]', key: 'modeTabs', side: 'bottom', align: 'center' },
    { selector: '[data-tour="editor-pane"]', key: 'editorPane', side: 'right' },
    { selector: '[data-tour="jinja2-pane"]', key: 'jinja2Pane', side: 'left' },
    { selector: '[data-tour="btn-facts"]', key: 'btnFacts', side: 'bottom' },
  ],

  limits: [
    { selector: '[data-tour="mode-tabs"]', key: 'modeTabs', side: 'bottom', align: 'center' },
    { selector: '[data-tour="inventory-editor"]', key: 'inventoryEditor', side: 'right' },
    { selector: '[data-tour="inventory-import"]', key: 'inventoryImport', side: 'right' },
    { selector: '[data-tour="limit-input"]', key: 'limitInput', side: 'bottom' },
    { selector: '[data-tour="limit-results"]', key: 'limitResults', side: 'top' },
  ],
}
