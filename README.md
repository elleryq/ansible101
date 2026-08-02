<div align="center">

```
 █████╗ ███╗   ██╗███████╗██╗██████╗ ██╗     ███████╗   ██╗ ██████╗  ██╗
██╔══██╗████╗  ██║██╔════╝██║██╔══██╗██║     ██╔════╝  ███║██╔═████╗███║
███████║██╔██╗ ██║███████╗██║██████╔╝██║     █████╗    ╚██║██║██╔██║╚██║
██╔══██║██║╚██╗██║╚════██║██║██╔══██╗██║     ██╔══╝     ██║████╔╝██║ ██║
██║  ██║██║ ╚████║███████║██║██████╔╝███████╗███████╗   ██║╚██████╔╝ ██║
╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝╚═════╝ ╚══════╝╚══════╝   ╚═╝ ╚═════╝  ╚═╝
```

**Visual debugger · Logic explainer · Jinja2 sandbox for Ansible playbooks**

**English** | [繁體中文](README.zh-TW.md)

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![ReactFlow](https://img.shields.io/badge/ReactFlow-11-ff0072?style=flat-square)](https://reactflow.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee?style=flat-square)](LICENSE)

</div>

---

## What is Ansible101?

Ansible101 is a **zero-config, browser-only** tool that turns raw Ansible YAML into something you can actually *see* and *understand*.

Paste a playbook, a task snippet, or a Jinja2 expression — the app instantly renders a live execution flowchart, translates every task into plain English, and lets you experiment with mock facts to explore conditional logic without ever touching a real host.

Drop a **whole project** (inventory + `group_vars/` + `host_vars/` + roles + vendored collections) and the app builds a full per-host **variable precedence resolver** — see exactly which value wins for every variable, and why, across all 22 levels of Ansible's precedence order.

> **Not affiliated with Red Hat, Inc.**
> Ansible® is a registered trademark of Red Hat, Inc.

---

## Features

### Clipboard-First Entry
Hit **Ctrl+V** anywhere on the landing screen (or drag & drop a file, folder, or zip) — the app auto-detects what you handed it and opens the right view instantly. No form, no submit button.

| Content dropped/pasted | View opened |
|---|---|
| Full Ansible project (inventory + group_vars/host_vars/roles/collections) | Playbook Mode → **Resolve View** |
| Single full playbook | Playbook Mode → **Flow View** |
| Single task / snippet | Quick-Card: intent, flags, warnings |
| Jinja2 expression | Pipeline Trace: step-by-step filter breakdown |
| Standalone inventory file (INI/YAML/JSON) | Limits Lab, pre-loaded |

Folders and zips are extracted in-browser (full relative paths preserved) so multi-file projects keep their directory structure.

---

### Four Modes

#### 🗺 Playbook Mode
The full three-pane layout: write or paste YAML on the left, watch the execution graph update in real-time in the centre, read a plain-English summary on the right.

- **Play nodes** — blue header cards showing `hosts` target
- **Task nodes** — colour-coded by module type
- **Diamond decision nodes** — for every `when:` conditional
- **Loop badge nodes** — wraps tasks that use `loop:` / `with_items:`
- **Dashed handler edges** — amber lines from `notify:` to the Handlers section
- **Visual Dry-Run** — when Mock Facts are active, branches whose `when:` condition evaluates to `false` are dimmed to 40% opacity so you can see the execution path at a glance

Playbook Mode has two views, toggled in the top bar:

- **Flow** — the execution flowchart described above (default for single-file playbooks)
- **Resolve** — the variable precedence resolver (default when a full project is dropped), see below

#### 🧮 Resolve View — Variable Precedence Resolver
Drop a whole Ansible project and explore exactly how every variable resolves, per host, across Ansible's full **22-level precedence order** — without ever running `ansible-playbook`.

- **Auto-detection** of inventory, playbook(s), `group_vars/`/`host_vars/` (both inventory-adjacent and playbook-adjacent), roles, and vendored collections (`collections/ansible_collections/<ns>/<coll>/roles/...`)
- **Inventory / playbook / host switchers** — re-resolve instantly for any combination
- **Per-variable precedence stack** — every contributing source (role defaults, group_vars, host_vars, play vars, `vars_files`, role vars, task vars, `set_fact`/`register`, role params, `-e`...) shown in order, with the winner highlighted
- **Static analysis handles real-world project shapes**:
  - `import_playbook` — imported playbooks are inlined as if written inline
  - Role `meta/main.yml` `dependencies:` — resolved recursively, dependency vars/defaults included, dependency-supplied params still win over the dependency's own defaults
  - Dynamic `include_role` / `import_role` (not just the static `roles:` list) — contributes defaults/vars/params at the correct levels
  - `vars_files:` first-found-list semantics — when an entry is itself a list, only the first existing file counts
  - Multiple vendored collections, each providing roles used anywhere in the project
- **Extra Vars panel** — layer `-e @file` (uploaded vars files, ordered) and ad-hoc key/value pairs; these always win, last-applied-wins among themselves
- **Runtime mocks** — auto-detects `vars_prompt`, `set_fact`, `register`, and include-params names with no statically-knowable value, and lets you supply a placeholder so they still appear at their correct precedence level
- **Raw + rendered values** — see both the literal winning source value and its Jinja2-rendered form against the resolved host context
- **Hand off** — push the resolved per-host context into Flow View or the Jinja2 sandbox to keep exploring

See [`examples/`](examples/) for a dozen+ ready-to-drop test projects covering YAML/JSON/INI inventories, multi-environment setups, role dependencies, `import_playbook`, dynamic includes, multiple collections, and `vars_files` lists.

#### ⚡ Jinja2 Mode
Paste any Ansible Jinja2 expression (`{{ groups['web'] | map(attribute='ip') | sort | join(',') }}`).  
The **Transformation Trace** breaks the pipe chain into discrete steps, showing:

1. **Input** — the starting value resolved from Mock Facts
2. **Each filter** — plain-English label + intermediate value
3. **Final Output** — the evaluated result

Powered by [Nunjucks](https://mozilla.github.io/nunjucks/) with 40+ Ansible filter polyfills (selectattr, combine, dict2items, zip, …).

#### 🃏 Snippet Mode
Paste a single task object. A **Quick-Card** shows the module, intent, flags, loop info, conditional, and any warnings — great for reviewing tasks in code review without spinning up a full playbook.

#### 🧪 Limits Lab Mode
Build and test inventory targeting logic in a dedicated sandbox:

- Import inventory via paste, drag-and-drop, or file upload (JSON / INI / YAML)
- Edit groups and host membership visually
- Test `--limit` expressions with live per-group match breakdown
- Inspect hostvars directly from matched hosts
- Share the current Limits Lab state (inventory + hostvars + limit pattern) via URL

---

### Human-Speak Sidebar
Every task is translated into a one-line plain English sentence:

| Module | Output |
|---|---|
| `apt` / `yum` / `dnf` | "Installs package "nginx" using apt." |
| `copy` / `template` | "Deploys configuration file to /etc/nginx/nginx.conf." |
| `service` / `systemd` | "Manages background service "nginx" — starts it and enables it on boot." |
| `shell` / `command` | "Runs shell command…" + ⚠ Non-idempotent warning |
| `file` | "Creates directory /var/www/app." |
| `get_url` | "Downloads file from "…" to "…"." |

---

### Mock Context (ansible_facts editor)
An inline JSON panel lets you edit `ansible_facts` and arbitrary variables. Every conditional (`when:`) and Jinja2 expression re-evaluates instantly against the new values — a live "what if" simulator.

---

### Shareable URLs
Current app state is encoded into the URL hash using LZ-string compression.

- Playbook/Snippet/Jinja2: shares current text + mock facts (+ extra files where applicable)
- Limits Lab: shares inventory + hostvars + current `--limit` pattern
- Share button visibility: hidden when there is nothing meaningful to share

### Privacy Note (Important)
Sharing is **URL-only** in the browser.

- No share payload is uploaded to any backend server by this app
- Data is stored in the URL fragment (`#...`) and copied to clipboard when you click Share
- Anyone with the link can read its encoded content, so avoid sharing sensitive data

---

## Tech Stack

| Package | Role |
|---|---|
| [React 18](https://react.dev) + [Vite 6](https://vitejs.dev) | UI framework & build tool |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first styling (Slate-950 dark theme) |
| [ReactFlow 11](https://reactflow.dev) | Execution flowchart (zoom, pan, minimap) |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | In-browser YAML / Jinja2 editor with custom Cyber-Blueprint theme |
| [js-yaml](https://github.com/nodeca/js-yaml) | YAML parsing |
| [Nunjucks](https://mozilla.github.io/nunjucks/) | Jinja2 simulation (browser UMD build) |
| [JSZip](https://stuk.github.io/jszip/) | In-browser zip extraction (project drop/upload) |
| [fflate](https://github.com/101arrowz/fflate) + [lz-string](https://github.com/pieroxy/lz-string) | URL state compression |
| [driver.js](https://driverjs.com) | Guided product tour |
| [Lucide React](https://lucide.dev) | Icons |

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Install & run

```bash
git clone https://github.com/aogunwoolu/ansible101.git
cd ansible101
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

---

## Project Structure

```
src/
├── App.jsx                      Root component — mode/view routing, state, layout
├── main.jsx                     React entry point
├── index.css                    Global styles + Tailwind directives
│
├── components/
│   ├── YamlEditor.jsx           Monaco editor (Cyber-Blueprint theme, line highlight sync)
│   ├── FlowCanvas.jsx           ReactFlow canvas (zoom/pan, minimap, background grid)
│   ├── FlowNodes.jsx            8 custom node types (play, task, loop, diamond, skip, merge, handler, section)
│   ├── HumanSidebar.jsx         Right panel — plain-English task explanations
│   ├── MockContextPanel.jsx     Inline JSON editor for ansible_facts
│   ├── PlayVarsPanel.jsx        Detects undefined Jinja vars in a playbook, lets you set mock values
│   ├── FileExplorer.jsx         Nested project file tree (for dropped projects)
│   ├── FileTabBar.jsx           Open-file tabs above the editor
│   ├── ResolveView.jsx          Variable Resolver UI — inventory/playbook/host switchers + precedence table
│   ├── ExtraVarsPanel.jsx       `-e @file` / key-value extra-vars layering UI
│   ├── RuntimeMocksPanel.jsx    Mock-value inputs for set_fact/register/vars_prompt/include params
│   ├── InventoryLab.jsx        Inventory builder + --limit tester sandbox
│   ├── LimitPanel.jsx           --limit pattern tester + per-group match breakdown
│   ├── PipelineView.jsx         Jinja2 Transformation Trace
│   ├── QuickCard.jsx            Single-task Quick-Card view
│   └── AboutPage.jsx            About/info view
│
└── lib/
    ├── parseYamlToFlow.js        YAML → ReactFlow nodes & edges (with dry-run dimming)
    ├── humanSpeak.js             generateExplanation() — module → English sentence
    ├── jinja2Engine.js           Nunjucks wrapper + 40+ Ansible filter polyfills
    ├── parseJinja2Pipeline.js    Pipe chain tokeniser & step evaluator
    ├── filterTranslations.js     Filter name → conversational English label
    ├── detectContentType.js      Auto-detect project / playbook / snippet / jinja2 / inventory
    ├── projectModel.js           Detects inventory/playbooks/roles/collections/group_vars/host_vars from a dropped project; expands import_playbook, resolves role meta dependencies
    ├── precedence.js             Full 22-level precedence engine — resolveHostVars(), runtime var extraction
    ├── parseInventory.js         INI/YAML/JSON inventory parsing (groups, hostvars, group:vars)
    ├── ansibleLimit.js           --limit pattern matching against an inventory
    ├── useFileDrop.js            Drag/drop + folder + zip ingestion (readDataTransferFiles), preserves paths
    ├── shareUrl.js               fflate/LZ-string + Base64 URL encode/decode (with localStorage fallback for large projects)
    ├── defaultFacts.js           Default mock ansible_facts
    ├── sampleYaml.js             Built-in sample playbook
    ├── sampleInventory.js        Built-in sample inventory
    ├── sampleJinja2.js           Built-in sample Jinja2 expression
    ├── exportFlowText.js         Export the flowchart as plain text
    └── tour.js                   driver.js guided product tour steps
```

See [`examples/`](examples/) for ready-to-drop sample projects exercising the resolver (and a `README.md` describing what each one validates).

---

## Supported Ansible Modules (Human-Speak)

`apt` · `yum` · `dnf` · `pip` · `copy` · `template` · `file` · `lineinfile` · `fetch` · `service` · `systemd` · `get_url` · `uri` · `shell` · `command` · `debug` · `set_fact` · `user` · `include_tasks` · `import_tasks` · `wait_for`

---

## Supported Jinja2 Filters (Nunjucks polyfills)

`default` · `mandatory` · `bool` · `int` · `float` · `string` · `lower` · `upper` · `trim` · `replace` · `regex_replace` · `regex_search` · `split` · `join` · `list` · `unique` · `flatten` · `sort` · `reverse` · `first` · `last` · `length` · `min` · `max` · `sum` · `abs` · `round` · `map` · `select` · `reject` · `selectattr` · `rejectattr` · `combine` · `dict2items` · `items2dict` · `zip` · `b64encode` · `b64decode` · `to_json` · `from_json` · `to_yaml`

---

## License

MIT © [aogunwoolu](https://github.com/aogunwoolu)

---

<div align="center">
  <sub>Ansible101 is an independent community tool — not affiliated with, endorsed by, or sponsored by Red Hat, Inc.</sub>
</div>
