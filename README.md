# 選餐廳轉盤

不知道吃什麼？輸入條件，抽一個出來。

一個完全免費、純前端的選餐廳小工具：搜尋附近餐廳、依你的條件篩選，
再用轉盤隨機抽出一間，附上 Google 地圖連結讓你直接導航或訂位。

🔗 **線上使用：** https://e063047.github.io/pick-a-restaurant/

## 功能

- **距離**：500 公尺 / 1 公里 / 3 公里 / 5 公里
- **飲食偏好**：全部 / 素食（只認明確標註 vegetarian/vegan 的店）/ 葷食
- **種類**：全部 / 飲料 / 甜點 / 正餐（依店家標籤自動分類，見下方限制說明）
- **用餐日期與時間**：自動濾掉該時段確定休息的店，營業時間不明的店會保留並標示「營業時間未知」
- **轉盤抽選**：篩選後隨機取最多 10 間候選，轉盤抽出最終要去的店
- **一鍵導航**：抽中後直接給 Google 地圖連結，導航、看評論、訂位都在 Google 地圖上完成

## 使用方式

1. 打開 [https://e063047.github.io/pick-a-restaurant/](https://e063047.github.io/pick-a-restaurant/)
2. 選擇搜尋距離、飲食偏好、種類、用餐日期與時間
3. 按「找餐廳」，允許瀏覽器定位（若拒絕定位，畫面會出現地址欄位，手動輸入地址即可）
4. 按「轉動轉盤」，抽出一間餐廳
5. 按「在 Google 地圖開啟」，直接在 Google 地圖上查看、導航或訂位

## 架構

純前端靜態網站，**沒有後端、沒有資料庫、沒有 build 流程**，用原生 HTML/CSS/JavaScript（ES modules）寫成，可以部署到任何免費的靜態網站主機。

```
index.html          表單、轉盤、結果卡片的 DOM 結構
style.css            樣式
js/
  app.js             主控制器：串接所有模組、處理 UI 事件（唯一碰 DOM 的檔案）
  geo.js             定位（瀏覽器 Geolocation API）+ 地址轉座標（Nominatim）
  overpass.js        查詢附近店家（OpenStreetMap Overpass API，兩節點備援）
  category.js        依 amenity/shop/cuisine 標籤分類「飲料／甜點／正餐」
  filters.js         葷素篩選、營業時間篩選
  openingHours.js    包裝 opening_hours.js 函式庫，判斷指定時間是否營業
  sample.js          Fisher-Yates 洗牌，隨機抽最多 10 間候選
  wheel.js           Canvas 畫轉盤、旋轉動畫、決定得獎者
  mapsLink.js        組出 Google 地圖搜尋連結（純網址組合，不呼叫任何 Google API）
```

每個模組職責單一、互相用明確的函式介面溝通，`app.js` 負責把它們串成完整流程：

```
使用者定位 / 手動輸入地址
  → 呼叫 Overpass API 查詢附近店家
  → 依序套用篩選：葷素 → 種類 → 營業時間
  → 隨機抽最多 10 間候選
  → 畫轉盤 → 使用者轉動 → 顯示得獎結果 + Google 地圖連結
```

### 為什麼不用 Google Maps API？

Google Places API 需要綁定信用卡且有機會超額產生費用，不符合「完全免費」的需求。改用完全免費、無需 API Key 的 **OpenStreetMap（Overpass API 查詢 + Nominatim 地址轉座標）**。Google 地圖只用來組出跳轉連結，不呼叫任何 Google API。

### 已知限制

- **素食判斷**：OSM 資料很多店家沒有標註葷素，選「素食」時只會顯示明確標註 `diet:vegetarian`/`diet:vegan` 的店，會比實際素食可選店家數量少。
- **種類分類是啟發式猜測**：依 OSM 的 `amenity`/`shop`/`cuisine` 標籤判斷，不是所有店家都能準確分類。
- **沒有「小吃」分類**：OSM 沒有對應「小吃」的標籤，最接近的 `fast_food` 標籤查出來的多是麥當勞、摩斯漢堡等西式速食連鎖，不是台式小吃店；真正的小吃店和一般餐廳標籤相同、無法用資料區分，因此沒有做這個分類。
- **人均價位、Google 星等評價**：OSM 沒有這類資料，因此沒有這兩項篩選條件。

## 本機開發

不需要安裝任何套件或跑 build，但因為用了 ES modules，不能直接用 `file://` 開啟 `index.html`（瀏覽器會擋跨來源限制），需要起一個本機伺服器：

```bash
python3 -m http.server 8000
```

再用瀏覽器開啟 `http://localhost:8000/`。

## 技術棧

- 原生 HTML / CSS / JavaScript（ES modules），無框架、無 build 工具
- [OpenStreetMap Overpass API](https://overpass-api.de/)：搜尋附近店家
- [Nominatim](https://nominatim.openstreetmap.org/)：地址轉座標
- [opening_hours.js](https://github.com/opening-hours/opening_hours.js)：解析 OSM 營業時間格式（透過 CDN 載入）
- [GitHub Pages](https://pages.github.com/)：免費靜態網站部署

## 專案文件

- 設計文件：[`docs/superpowers/specs/2026-09-11-選餐廳-design.md`](docs/superpowers/specs/2026-09-11-選餐廳-design.md)
- 實作計畫：[`docs/superpowers/plans/2026-09-11-選餐廳.md`](docs/superpowers/plans/2026-09-11-選餐廳.md)
