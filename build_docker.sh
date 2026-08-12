#!/bin/bash
# 停止腳本如果遇到任何錯誤
set -e

echo "🚀 開始於本地編譯 Chatwoot 自訂 Docker 映像檔..."
echo "------------------------------------------------"

# 執行 Docker Build，這會自動使用多階段編譯，並在內部自動跑 assets:precompile 進行前端打包
docker build -f docker/Dockerfile -t chatwoot-local:latest .

echo "------------------------------------------------"
echo "✅ 編譯完成！自訂映像檔 'chatwoot-local:latest' 已準備就緒。"
echo "💡 您現在可以在 docker-compose.production.yaml 中將映像檔改為 'chatwoot-local:latest'，並移除本地目錄的 volumes 掛載。"
