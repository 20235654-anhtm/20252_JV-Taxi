# =========================================================================
# SCRIPT TỰ ĐỘNG BUILD - PUSH DOCKER - REDEPLOY LÊN RENDER
# =========================================================================

# 1. Điền thông tin cấu hình của bạn ở đây:
$DOCKER_USERNAME = "kazei2809"
$IMAGE_NAME = "jv-taxi-backend"
$DEPLOY_HOOK_URL = "https://api.render.com/deploy/srv-d861hmdi849s738akvgg?key=gnlecqkEhyQ"

# Tạo tag đầy đủ cho Docker Image (dùng ngoặc nhọn để tránh lỗi PowerShell hiểu nhầm dấu hai chấm ':')
$FULL_IMAGE_TAG = "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"

# -------------------------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "1. Bắt đầu build Docker Image local..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
docker build -t $FULL_IMAGE_TAG .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build Docker Image thất bại! Vui lòng kiểm tra lại code." -ForegroundColor Red
    exit
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "2. Đẩy Docker Image lên Docker Hub..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan
docker push $FULL_IMAGE_TAG

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Push Docker Image thất bại! Bạn đã chạy 'docker login' chưa?" -ForegroundColor Red
    exit
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "3. Gửi tín hiệu kích hoạt tự động Redeploy lên Render..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Cyan

if ($DEPLOY_HOOK_URL -eq "<PASTE_YOUR_RENDER_DEPLOY_HOOK_URL_HERE>" -or $DEPLOY_HOOK_URL -eq "") {
    Write-Host "⚠️ Chưa cấu hình DEPLOY_HOOK_URL. Bạn hãy tự bấm deploy thủ công trên Render Dashboard." -ForegroundColor Yellow
} else {
    # Gọi webhook kích hoạt Render deploy
    $response = Invoke-RestMethod -Uri $DEPLOY_HOOK_URL -Method Post
    Write-Host "✅ Đã kích hoạt Render redeploy thành công!" -ForegroundColor Green
    Write-Host "Render Response:" -ForegroundColor Gray
    $response | ConvertTo-Json
}

Write-Host "`n🎉 Hoàn thành quy trình!" -ForegroundColor Green
