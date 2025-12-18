#!/bin/bash

# .env 파일 백업 스크립트
# 사용법: ./backup-env.sh

echo "🔐 .env 파일 백업 스크립트"
echo "=========================="
echo ""

# .env 파일 존재 확인
if [ ! -f ".env" ]; then
    echo "❌ .env 파일을 찾을 수 없습니다!"
    exit 1
fi

# 백업 디렉토리 생성
BACKUP_DIR="$HOME/Desktop/church-website-backup"
mkdir -p "$BACKUP_DIR"

# 현재 날짜로 백업 파일명 생성
BACKUP_FILE="$BACKUP_DIR/.env.backup-$(date +%Y%m%d-%H%M%S)"

# 백업 실행
cp .env "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ .env 파일이 성공적으로 백업되었습니다!"
    echo "📁 백업 위치: $BACKUP_FILE"
    echo ""
    echo "⚠️  중요: 이 파일을 안전한 곳에 보관하세요!"
    echo "   - USB 드라이브에 복사"
    echo "   - 암호화된 클라우드 저장소 (1Password, LastPass 등)"
    echo "   - 안전한 이메일로 자신에게 전송"
    echo ""
    echo "🔍 백업된 내용 확인:"
    echo "-------------------"
    cat "$BACKUP_FILE"
else
    echo "❌ 백업 실패!"
    exit 1
fi
