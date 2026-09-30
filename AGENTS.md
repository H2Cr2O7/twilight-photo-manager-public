# トワイライト — Base44 開発環境メモ

## 概要
静的ビルドの React SPA（`index.html` + `assets/`）。ビルドステップなし、ソースは `index.html` にインラインの React ランタイムと `assets/index-CrHOYhKx-fix.js` のバンドル。

## 起動方法
```bash
docker compose -f docker-compose.base44.yml up -d
```
nginx:alpine でホスト 3000 → 80 を公開。ソースは bind-mount なので `index.html` や `assets/` の編集は即時反映（要リロード）。

## iPad 白画面問題（修正済み）
古い iPad（iPadOS < 15.4）で `dvh`/`svh` CSS 単位と `Array.prototype.at()` / `crypto.randomUUID()` が未対応で画面が真っ白になる問題を、`index.html` の `<head>` に JS ポリフィルと `vh` フォールバック CSS を追加して修正。

## 注意
- サービスワーカー (`service-worker.js`) は network-first 戦略なので、キャッシュされた旧版は再訪時に自動更新される。
- `assets/` の JS はミニファイド済みバンドル。ソースコード（`client/src/`）はリポジトリに含まれていない。
