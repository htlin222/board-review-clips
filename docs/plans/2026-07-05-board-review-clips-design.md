# Board Review Clips — 設計文件

日期:2026-07-05

## 目標

把醫學考試複習卡(title / answer / detail / header)自動轉成兩種格式的短影片:

- **LongForm**(16:9,YouTube 一般影片)
- **Shorts**(9:16,YouTube Shorts / Reels)

兩者內容與步驟完全一致,僅排版比例與字幕呈現方式不同。旁白用 `zh-TW` 語音直接唸英文原文(語言確定:中文語音、英文文字,不做翻譯)。系統要能支撐未來大量卡片的批次產出,並讓樣式調整集中化。

## 資料模型

每張卡是一個 JSON 檔,放在 `cards/`:

```json
{
  "id": "scd-median-survival",
  "topic": "Hematology Board Review",
  "author": "Your Name",
  "title": "What is the median overall survival of a patient with SCD?",
  "answer": "The estimated median survival for SCD in developed nations is ~60 years.",
  "detail": [
    "The infant and childhood mortality decreased substantially with the introduction of the pneumococcal vaccine.",
    "Although death related to organ failure does occur in SCD, most deaths occur during a vaso-occlusive crisis related to acute chest syndrome, stroke, or venous thromboembolism (VTE).",
    "Elevated hemoglobin F levels are associated with **improved outcomes**.",
    "Coinheritance of **alpha thalassemia** reduces risk of stroke in SCD."
  ]
}
```

- `detail` 是陣列,每個元素是一個動畫段落。
- 文字內可用 `**word**` 標記重點,觸發手繪 marker 效果。
- `topic` + `author` 組成全程顯示的 header。

## 專案結構

```
board-review-clips/
  cards/                    # 輸入資料,一張卡一個 JSON
  scripts/
    generate-audio.ts       # 呼叫 edge-tts,產生逐句 mp3 + word-timing,含 cache 判斷
    render.ts               # 批次呼叫 remotion render,產出 16:9 / 9:16 mp4
  remotion/
    theme.ts                # 集中化樣式/設計 token
    Root.tsx                # 註冊 LongForm(16:9)、Shorts(9:16) 兩個 composition
    compositions/
      LongForm.tsx
      Shorts.tsx
    components/
      Skeleton.tsx           # shadcn 風格骨架屏
      MarkerText.tsx          # 解析 **bold**,套用手繪 marker + boil 抖動
      KaraokeText.tsx         # 依 word-timing 逐字 highlight(LongForm 用)
      RollingCaption.tsx      # 3~4 行滾動字幕(Shorts 用)
      Header.tsx              # topic/author 固定角落顯示
    audio/                   # generate-audio.ts 產出的 mp3 + timing json
  public/sfx/                # 從 /System/Library/Sounds 複製的音效
```

## Pipeline(兩階段)

1. **Pre-process**(`generate-audio.ts`):讀 `cards/*.json`,把 title、answer、每段 detail 分別丟給 edge-tts(`zh-TW-HsiaoChenNeural`),輸出 mp3 + word-boundary 時間軸 JSON。已存在且來源未變的音檔會跳過,避免整批重跑都重打 TTS API。
2. **Render**(`render.ts`):glob 讀取 `cards/*.json`,把卡片內容 + 音檔時間軸當 `inputProps` 傳進 Remotion,分別渲染 `LongForm` 與 `Shorts`,輸出兩支 mp4。

## 動畫時間軸

1. **Title 階段**:Header 淡入 + 播放 `begin` 音效(`Tink.aiff`)。Title 文字用 `KaraokeText`/`RollingCaption` 逐字 highlight 播出,同步旁白唸 title。Answer/Detail 區域用 `Skeleton` 遮住。
2. **Reveal 階段**:Title 唸完 → 播放 `click` 音效(`Pop.aiff`)→ Skeleton 淡出 → Answer slide-up/fade 顯示 → 旁白唸 Answer,同步 highlight。
3. **Detail 階段**:依序播放 `detail[0..n]`。每次切換:播放 `click` 音效、觸發一次小幅度 camera pan/push、新段落文字淡入唸出。
4. **結尾**:播放 `end` 音效(`Glass.aiff`),畫面停留淡出。

**攝影機**:全程緩慢 Ken Burns zoom(`camera.baseZoomStart` → `baseZoomEnd`),每次 detail 切換疊加一個短暫 pan spring。

**Marker 效果**:`**word**` 底下疊一層手繪 SVG 筆觸(底線/圈選),筆觸套用低幀率(約 10fps)隨機位移做出 boil 抖動感;boil 只套用在筆觸本身,不影響主文字與版面穩定性。

## 版面差異

- **LongForm**(1920×1080):Answer/Detail 全文一次顯示,karaoke 逐字掃過,類似攤開的 Anki 卡片。Header 固定左上角小字。
- **Shorts**(1080×1920):所有文字控制在中央 900×1350 安全區(參考 `youtube-shorts-safe-zone.png`;寬度從原本規劃的 1080 收窄至 900,以留出足夠邊距讓 Ken Burns zoom 在放大到 ~1.10 時不會把貼齊邊緣的文字裁掉)。Answer/Detail 改用 `RollingCaption`,3~4 行一組滾動,講到哪滾到哪。Header 固定上方小字,避開安全區。

兩者共用同一份 card JSON + word-timing 音檔,只有排版元件不同。

## 集中化樣式(`theme.ts`)

```ts
export const theme = {
  colors: { bg: "#FFFFFF", ink: "#111111", skeleton: "#E5E5E5", marker: "#111111" },
  fonts: { family: "Noto Sans, Noto Sans TC, sans-serif", titleSize: 64, bodySize: 44, headerSize: 24 },
  timing: { clickSfxOffsetMs: 0, revealDurationMs: 400, detailGapMs: 300 },
  camera: { baseZoomStart: 1.0, baseZoomEnd: 1.06, switchPushPct: 0.04, switchPushFrames: 10 },
  marker: { boilFps: 10, boilJitterPx: 1.5, strokeWidth: 3 },
  tts: { voice: "zh-TW-HsiaoChenNeural", rate: "+0%" },
  sfx: { begin: "sfx/Tink.aiff", click: "sfx/Pop.aiff", end: "sfx/Glass.aiff" },
  // w=900, not 1080: leaves margin so camera zoom (up to baseZoomEnd + switchPushPct ≈ 1.10) never clips edge text.
  safeZone: { shorts: { w: 900, h: 1350 } },
};
```

所有 component 從 `theme.ts` 讀值,不寫死在 JSX 裡。字級、顏色、zoom 幅度、音效檔、TTS 語音等調整都集中在這一份檔案。未來若要做多套視覺風格,可切換不同 theme 檔案而不動 component 邏輯。

## 批次化考量

`render.ts` / `generate-audio.ts` 都設計成可對整個 `cards/` 資料夾批次執行,而非單卡處理,支撐未來大量產出。

## 測試策略

**Smoke test**:用 SCD 範例卡跑一次完整 pipeline,檢查:
- 兩支 mp4 都成功產出、檔案非空
- 每個音檔都有對應 word-timing json,timestamp 遞增不重疊
- 影片總長度 ≈ 旁白音檔長度總和 + 轉場間隔(誤差 <0.5 秒)
- sfx 確實觸發、無裁切或延遲

**Edge case 清單**:
1. **中英混讀已確認**:`zh-TW` 語音唸英文原文,字體採 Noto Sans。仍需在 prototype 階段實測 edge-tts 對英文醫學縮寫(SCD、VTE、hemoglobin F)的斷句與發音品質,確認 word-timing 對齊 karaoke 沒有明顯錯位。
2. `detail` 陣列只有 1 段 vs 超過 5 段的排版/節奏
3. `**bold**` 多個、巢狀、或未閉合(`**word`)時 parser 優雅降級成純文字
4. 單句過長導致 9:16 safe zone 塞不下 3~4 行,需自動換行或縮字
5. `author` 欄位缺漏時 Header 的合理 fallback
6. 特殊符號(希臘字母 α、文獻標號等)在 Noto Sans 下的渲染正確性
