<div align="center">

```
 █████╗ ███╗   ██╗███████╗██╗██████╗ ██╗     ███████╗   ██╗ ██████╗  ██╗
██╔══██╗████╗  ██║██╔════╝██║██╔══██╗██║     ██╔════╝  ███║██╔═████╗███║
███████║██╔██╗ ██║███████╗██║██████╔╝██║     █████╗    ╚██║██║██╔██║╚██║
██╔══██║██║╚██╗██║╚════██║██║██╔══██╗██║     ██╔══╝     ██║████╔╝██║ ██║
██║  ██║██║ ╚████║███████║██║██████╔╝███████╗███████╗   ██║╚██████╔╝ ██║
╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝╚═════╝ ╚══════╝╚══════╝   ╚═╝ ╚═════╝  ╚═╝
```

**視覺化偵錯器 · 邏輯解說器 · Ansible playbook 的 Jinja2 沙盒**

[English](README.md) | **繁體中文**

[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![ReactFlow](https://img.shields.io/badge/ReactFlow-11-ff0072?style=flat-square)](https://reactflow.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-22d3ee?style=flat-square)](LICENSE)

</div>

---

## Ansible101 是什麼？

Ansible101 是一個**零設定、完全在瀏覽器內執行**的工具，能把原始的 Ansible YAML 轉換成你真正能*看懂*的東西。

貼上一份 playbook、一段 task 片段，或是一個 Jinja2 表達式 — 應用程式會立即畫出即時的執行流程圖、把每個 task 翻譯成白話文，並讓你透過模擬（mock）的 facts 來實驗條件邏輯，完全不需要碰到真正的主機。

丟進**整個專案**（inventory + `group_vars/` + `host_vars/` + roles + 已下載的 collections）,應用程式會建立完整的每主機**變數優先權解析器**——精確顯示每個變數最終是哪個值勝出、為什麼，涵蓋 Ansible 全部 22 層優先權順序。

> **與 Red Hat, Inc. 無任何關聯**
> Ansible® 為 Red Hat, Inc. 的註冊商標。

---

## 功能特色

### 剪貼簿優先的操作方式
在首頁畫面任何地方按下 **Ctrl+V**（或拖放檔案、資料夾、zip）— 應用程式會自動判斷你貼上/丟入的內容類型，並立即開啟對應的檢視畫面。不需要表單，不需要送出按鈕。

| 貼上/拖放的內容 | 開啟的檢視畫面 |
|---|---|
| 完整 Ansible 專案（inventory + group_vars/host_vars/roles/collections） | Playbook 模式 → **Resolve 檢視** |
| 單一完整 playbook | Playbook 模式 → **Flow 檢視** |
| 單一 task / 片段 | Quick-Card：意圖、旗標、警告 |
| Jinja2 表達式 | Pipeline Trace：逐步拆解 filter 鏈 |
| 獨立的 inventory 檔案（INI/YAML/JSON） | Limits Lab，並預先載入 |

資料夾與 zip 會在瀏覽器內解壓縮（保留完整相對路徑），因此多檔案專案能維持原本的目錄結構。

---

### 四種模式

#### 🗺 Playbook 模式
完整的三欄式版面：左側撰寫或貼上 YAML，中間即時更新執行流程圖，右側則是白話文摘要。

- **Play 節點** — 顯示 `hosts` 目標的藍色標頭卡片
- **Task 節點** — 依模組類型上色
- **菱形決策節點** — 對應每一個 `when:` 條件
- **迴圈標籤節點** — 包住使用 `loop:` / `with_items:` 的 task
- **虛線 handler 邊** — 從 `notify:` 連到 Handlers 區塊的琥珀色線條
- **視覺化 Dry-Run** — 當 Mock Facts 啟用時，`when:` 條件評估為 `false` 的分支會被調暗至 40% 透明度，讓你一眼看出實際執行路徑

Playbook 模式有兩種檢視畫面，可在上方工具列切換：

- **Flow** — 上述的執行流程圖（單一檔案 playbook 的預設畫面）
- **Resolve** — 變數優先權解析器（丟入完整專案時的預設畫面），見下方說明

#### 🧮 Resolve 檢視 — 變數優先權解析器
丟入整個 Ansible 專案，探索每個變數如何跨越 Ansible 完整的 **22 層優先權順序**，依主機逐一解析——完全不需要執行 `ansible-playbook`。

- **自動偵測** inventory、playbook(s)、`group_vars/`/`host_vars/`（inventory 旁與 playbook 旁兩種位置皆支援）、roles，以及已下載的 collections（`collections/ansible_collections/<ns>/<coll>/roles/...`）
- **Inventory / playbook / host 切換器** — 任意組合都能立即重新解析
- **每個變數的優先權堆疊** — 每個貢獻來源（role defaults、group_vars、host_vars、play vars、`vars_files`、role vars、task vars、`set_fact`/`register`、role 參數、`-e`……）依順序列出，並標示出最終勝出者
- **靜態分析涵蓋真實世界的專案樣貌**：
  - `import_playbook` — 被匯入的 playbook 會如同直接寫在原地一樣被展開
  - Role `meta/main.yml` 的 `dependencies:` — 遞迴解析，依賴項目的 vars/defaults 都會納入，且依賴項目提供的參數仍會贏過該依賴項目自己的 defaults
  - 動態的 `include_role` / `import_role`（不只是靜態的 `roles:` 清單）— 會在正確的層級貢獻 defaults/vars/params
  - `vars_files:` 的「取第一個存在的檔案」清單語意 — 當某個項目本身是清單時，只有第一個存在的檔案會被採用
  - 多個已下載的 collections，各自提供專案中任何地方會用到的 roles
- **Extra Vars 面板** — 疊加 `-e @file`（已上傳的 vars 檔案，依順序）與臨時的 key/value 組合；這些永遠勝出，彼此之間後套用者優先
- **執行期模擬值** — 自動偵測 `vars_prompt`、`set_fact`、`register`，以及無法靜態得知值的 include 參數名稱，讓你提供一個佔位值，使其仍能出現在正確的優先權層級
- **原始值 + 渲染後的值** — 同時查看勝出來源的字面值，以及它對照已解析主機情境所渲染出的 Jinja2 結果
- **交接使用** — 把解析出的每主機情境送進 Flow 檢視或 Jinja2 沙盒，繼續深入探索

參考 [`examples/`](examples/) 目錄，裡面有超過十幾個可直接丟入測試的專案，涵蓋 YAML/JSON/INI inventory、多環境設定、role 依賴、`import_playbook`、動態 include、多個 collections，以及 `vars_files` 清單。

#### ⚡ Jinja2 模式
貼上任何 Ansible Jinja2 表達式（例如 `{{ groups['web'] | map(attribute='ip') | sort | join(',') }}`）。
**Transformation Trace** 會把管線鏈拆解成一步步的過程，顯示：

1. **輸入** — 從 Mock Facts 解析出的起始值
2. **每個 filter** — 白話文標籤 + 中間結果值
3. **最終輸出** — 評估後的結果

底層由 [Nunjucks](https://mozilla.github.io/nunjucks/) 驅動，並內建 40 多個 Ansible filter 的相容實作（selectattr、combine、dict2items、zip……）。

#### 🃏 Snippet 模式
貼上單一個 task 物件。**Quick-Card** 會顯示模組、意圖、旗標、迴圈資訊、條件式，以及任何警告——非常適合在 code review 時檢視 task，不需要啟動完整的 playbook。

#### 🧪 Limits Lab 模式
在專屬的沙盒中建立並測試 inventory 目標鎖定邏輯：

- 透過貼上、拖放或上傳檔案（JSON / INI / YAML）匯入 inventory
- 以視覺化方式編輯群組與主機成員關係
- 測試 `--limit` 表達式，即時顯示各群組的比對結果
- 直接從比對到的主機檢視 hostvars
- 透過 URL 分享目前的 Limits Lab 狀態（inventory + hostvars + limit pattern）

---

### 白話文側邊欄（Human-Speak Sidebar）
每個 task 都會被翻譯成一句白話英文說明：

| 模組 | 輸出範例 |
|---|---|
| `apt` / `yum` / `dnf` | "Installs package "nginx" using apt." |
| `copy` / `template` | "Deploys configuration file to /etc/nginx/nginx.conf." |
| `service` / `systemd` | "Manages background service "nginx" — starts it and enables it on boot." |
| `shell` / `command` | "Runs shell command…" + ⚠ 非幂等（non-idempotent）警告 |
| `file` | "Creates directory /var/www/app." |
| `get_url` | "Downloads file from "…" to "…"." |

---

### 模擬情境（ansible_facts 編輯器）
內建的 JSON 面板讓你編輯 `ansible_facts` 與任意變數。每個條件式（`when:`）與 Jinja2 表達式都會針對新的值立即重新評估——就像一個即時的「如果……會怎樣」模擬器。

---

### 可分享的網址
目前的應用程式狀態會透過 LZ-string 壓縮編碼進 URL hash。

- Playbook/Snippet/Jinja2：分享目前的文字內容 + mock facts（適用時還包含額外檔案）
- Limits Lab：分享 inventory + hostvars + 目前的 `--limit` pattern
- 分享按鈕可見性：沒有任何值得分享的內容時會自動隱藏

### 隱私聲明（重要）
分享機制**僅透過 URL**在瀏覽器內完成。

- 這個應用程式不會把任何分享內容上傳到後端伺服器
- 資料儲存在 URL fragment（`#...`）中，點擊分享時會複製到剪貼簿
- 任何拿到連結的人都能讀取其中編碼的內容，請避免分享敏感資料

---

## 技術架構

| 套件 | 用途 |
|---|---|
| [React 18](https://react.dev) + [Vite 6](https://vitejs.dev) | UI 框架與建置工具 |
| [Tailwind CSS 3](https://tailwindcss.com) | Utility-first 樣式（Slate-950 深色主題） |
| [ReactFlow 11](https://reactflow.dev) | 執行流程圖（縮放、平移、小地圖） |
| [Monaco Editor](https://microsoft.github.io/monaco-editor/) | 瀏覽器內的 YAML / Jinja2 編輯器，搭配自訂 Cyber-Blueprint 主題 |
| [js-yaml](https://github.com/nodeca/js-yaml) | YAML 解析 |
| [Nunjucks](https://mozilla.github.io/nunjucks/) | Jinja2 模擬引擎（瀏覽器 UMD 版本） |
| [JSZip](https://stuk.github.io/jszip/) | 瀏覽器內 zip 解壓縮（專案拖放/上傳） |
| [fflate](https://github.com/101arrowz/fflate) + [lz-string](https://github.com/pieroxy/lz-string) | URL 狀態壓縮 |
| [driver.js](https://driverjs.com) | 導覽式產品教學 |
| [Lucide React](https://lucide.dev) | 圖示 |

---

## 開始使用

### 前置需求
- Node.js ≥ 18
- npm ≥ 9

### 安裝與執行

```bash
git clone https://github.com/aogunwoolu/ansible101.git
cd ansible101
npm install
npm run dev
```

在瀏覽器開啟 **http://localhost:5173**。

### 建置正式版

```bash
npm run build    # 輸出到 dist/
npm run preview  # 在本機預覽正式版建置結果
```

---

## 專案結構

```
src/
├── App.jsx                      根元件 — 模式/檢視畫面路由、狀態、版面配置
├── main.jsx                     React 進入點
├── index.css                    全域樣式 + Tailwind 指令
│
├── components/
│   ├── YamlEditor.jsx           Monaco 編輯器（Cyber-Blueprint 主題、行高亮同步）
│   ├── FlowCanvas.jsx           ReactFlow 畫布（縮放/平移、小地圖、背景網格）
│   ├── FlowNodes.jsx            8 種自訂節點類型（play、task、loop、diamond、skip、merge、handler、section）
│   ├── HumanSidebar.jsx         右側面板 — 白話文 task 說明
│   ├── MockContextPanel.jsx     ansible_facts 的內建 JSON 編輯器
│   ├── PlayVarsPanel.jsx        偵測 playbook 中未定義的 Jinja 變數，讓你設定 mock 值
│   ├── FileExplorer.jsx         巢狀專案檔案樹（用於拖放進來的專案）
│   ├── FileTabBar.jsx           編輯器上方的已開啟檔案分頁
│   ├── ResolveView.jsx          變數解析器 UI — inventory/playbook/host 切換器 + 優先權表格
│   ├── ExtraVarsPanel.jsx       `-e @file` / key-value extra-vars 疊加 UI
│   ├── RuntimeMocksPanel.jsx    set_fact/register/vars_prompt/include 參數的模擬值輸入
│   ├── InventoryLab.jsx        Inventory 建構器 + --limit 測試沙盒
│   ├── LimitPanel.jsx           --limit pattern 測試器 + 各群組比對結果
│   ├── PipelineView.jsx         Jinja2 Transformation Trace
│   ├── QuickCard.jsx            單一 task 的 Quick-Card 檢視
│   └── AboutPage.jsx            關於/資訊頁面
│
└── lib/
    ├── parseYamlToFlow.js        YAML → ReactFlow 節點與邊（含 dry-run 調暗效果）
    ├── humanSpeak.js             generateExplanation() — 模組 → 英文白話說明
    ├── jinja2Engine.js           Nunjucks 包裝器 + 40+ 個 Ansible filter 相容實作
    ├── parseJinja2Pipeline.js    管線鏈 tokeniser 與逐步求值器
    ├── filterTranslations.js     Filter 名稱 → 白話英文標籤
    ├── detectContentType.js      自動偵測 project / playbook / snippet / jinja2 / inventory
    ├── projectModel.js           從拖放進來的專案偵測 inventory/playbooks/roles/collections/group_vars/host_vars；展開 import_playbook、解析 role meta 依賴
    ├── precedence.js             完整 22 層優先權引擎 — resolveHostVars()、執行期變數擷取
    ├── parseInventory.js         INI/YAML/JSON inventory 解析（groups、hostvars、group:vars）
    ├── ansibleLimit.js           --limit pattern 對 inventory 的比對邏輯
    ├── useFileDrop.js            拖放 + 資料夾 + zip 匯入（readDataTransferFiles），保留路徑結構
    ├── shareUrl.js               fflate/LZ-string + Base64 URL 編碼/解碼（大型專案時會退回 localStorage）
    ├── defaultFacts.js           預設的 mock ansible_facts
    ├── sampleYaml.js             內建範例 playbook
    ├── sampleInventory.js        內建範例 inventory
    ├── sampleJinja2.js           內建範例 Jinja2 表達式
    ├── exportFlowText.js         將流程圖匯出為純文字
    └── tour.js                   driver.js 導覽式產品教學步驟
```

參考 [`examples/`](examples/) 目錄，裡面有可直接丟入測試的範例專案來體驗解析器（以及一份 `README.md` 說明每個範例分別驗證了什麼）。

---

## 支援的 Ansible 模組（Human-Speak）

`apt` · `yum` · `dnf` · `pip` · `copy` · `template` · `file` · `lineinfile` · `fetch` · `service` · `systemd` · `get_url` · `uri` · `shell` · `command` · `debug` · `set_fact` · `user` · `include_tasks` · `import_tasks` · `wait_for`

---

## 支援的 Jinja2 Filters（Nunjucks 相容實作）

`default` · `mandatory` · `bool` · `int` · `float` · `string` · `lower` · `upper` · `trim` · `replace` · `regex_replace` · `regex_search` · `split` · `join` · `list` · `unique` · `flatten` · `sort` · `reverse` · `first` · `last` · `length` · `min` · `max` · `sum` · `abs` · `round` · `map` · `select` · `reject` · `selectattr` · `rejectattr` · `combine` · `dict2items` · `items2dict` · `zip` · `b64encode` · `b64decode` · `to_json` · `from_json` · `to_yaml`

---

## 授權

MIT © [aogunwoolu](https://github.com/aogunwoolu)

---

<div align="center">
  <sub>Ansible101 是一個獨立的社群工具 — 與 Red Hat, Inc. 沒有任何關聯、非其背書，亦非其贊助。</sub>
</div>
