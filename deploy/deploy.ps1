# Deploy Jobs app to EC2 via SSM
# Run from project root. Requires: AWS CLI, Terraform output, Docker images pushed to ECR.
# Set DB_PASSWORD and ADMIN_PASSWORD environment variables before running.

$ErrorActionPreference = "Stop"
$terraformDir = Join-Path $PSScriptRoot "..\infrastructure\terraform"
$region = "us-east-1"
$dbPassword = $env:DB_PASSWORD
if (-not $dbPassword) {
    Write-Host "Error: DB_PASSWORD environment variable must be set" -ForegroundColor Red
    Write-Host "Set it with: `$env:DB_PASSWORD = 'your-database-password'" -ForegroundColor Yellow
    exit 1
}

$adminPassword = $env:ADMIN_PASSWORD
if (-not $adminPassword) {
    Write-Host "Error: ADMIN_PASSWORD environment variable must be set" -ForegroundColor Red
    Write-Host "Set it with: `$env:ADMIN_PASSWORD = 'your-secure-password'" -ForegroundColor Yellow
    exit 1
}

$cookieSecret = $env:COOKIE_SECRET
if (-not $cookieSecret) {
    Write-Host "Error: COOKIE_SECRET environment variable must be set" -ForegroundColor Red
    Write-Host "Set it with: `$env:COOKIE_SECRET = 'your-32-character-random-string'" -ForegroundColor Yellow
    exit 1
}

$rateLimitMax = $env:RATE_LIMIT_MAX
if (-not $rateLimitMax) { $rateLimitMax = "10" }

Push-Location $terraformDir
try {
    $tf = terraform output -json | ConvertFrom-Json
} finally {
    Pop-Location
}

$dbId = $tf.db_instance_id.value
$backendId = $tf.backend_instance_id.value
$frontendId = $tf.frontend_instance_id.value
$dbIp = $tf.db_private_ip.value
$backendIp = $tf.backend_private_ip.value
$ecrBackend = $tf.ecr_backend_url.value
$ecrFrontend = $tf.ecr_frontend_url.value

Write-Host "DB: $dbId ($dbIp) | Backend: $backendId ($backendIp) | Frontend: $frontendId"
Write-Host "ECR Backend: $ecrBackend | Frontend: $ecrFrontend"

$schema = @"
-- Keep it simple, three main tables
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    position_title VARCHAR(255) NOT NULL,
    job_url TEXT,
    date_applied DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'applied',
    salary_min INTEGER,
    salary_max INTEGER,
    location VARCHAR(255),
    job_description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE interviews (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    interview_date DATE,
    round_type VARCHAR(50),
    interviewer_name VARCHAR(255),
    questions_asked TEXT,
    my_answers TEXT,
    outcome VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_date ON applications(date_applied);
CREATE INDEX idx_interviews_app_id ON interviews(application_id);
CREATE INDEX idx_skills_app_id ON skills(application_id);
"@

$dbScript = @"
set -e
yum install -y docker
systemctl start docker
systemctl enable docker
mkdir -p /opt/jobs
cat > /opt/jobs/schema.sql << 'SCHEMAEOF'
$schema
SCHEMAEOF
docker rm -f jobs-db 2>/dev/null || true
docker run -d --name jobs-db -e POSTGRES_DB=jobs -e POSTGRES_USER=jobs -e POSTGRES_PASSWORD=$dbPassword -v /opt/jobs/schema.sql:/docker-entrypoint-initdb.d/schema.sql -v postgres_data:/var/lib/postgresql/data -p 5432:5432 postgres:15-alpine
echo "DB container started"
"@

$backendScript = @"
set -e
yum install -y docker
systemctl start docker
systemctl enable docker
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $ecrBackend
docker rm -f jobs-backend 2>/dev/null || true
docker run -d --name jobs-backend -e DATABASE_URL=postgresql://jobs:${dbPassword}@${dbIp}:5432/jobs -e PORT=3000 -e NODE_ENV=production -e ADMIN_PASSWORD=$adminPassword -e COOKIE_SECRET=$cookieSecret -e ALLOWED_ORIGIN= -e RATE_LIMIT_MAX=$rateLimitMax -p 3000:3000 $($ecrBackend):latest
echo "Backend container started"
"@

$nginxConf = @"
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    location /api {
        proxy_pass http://BACKEND_IP_PLACEHOLDER:3000;
        proxy_http_version 1.1;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    location / { try_files `$uri /index.html; }
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
"@

$frontendScript = @"
set -e
yum install -y docker
systemctl start docker
systemctl enable docker
mkdir -p /opt/jobs
cat > /opt/jobs/nginx.conf << 'NGINXEOF'
$nginxConf
NGINXEOF
sed -i "s/BACKEND_IP_PLACEHOLDER/$backendIp/g" /opt/jobs/nginx.conf
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin $ecrFrontend
docker rm -f jobs-frontend 2>/dev/null || true
docker run -d --name jobs-frontend -v /opt/jobs/nginx.conf:/etc/nginx/conf.d/default.conf:ro -p 80:80 ${ecrFrontend}:latest
echo "Frontend container started"
"@

function To-Lines { param([string]$s) ($s -split "`n") | ForEach-Object { $_.TrimEnd() } | Where-Object { $_ -ne "" } }

$dbLines = To-Lines $dbScript
$backendLines = To-Lines $backendScript
$frontendLines = To-Lines $frontendScript

$dbParamsFile = [System.IO.Path]::GetTempFileName()
$backendParamsFile = [System.IO.Path]::GetTempFileName()
$frontendParamsFile = [System.IO.Path]::GetTempFileName()

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($dbParamsFile, (@{ commands = @($dbLines) } | ConvertTo-Json -Depth 10), $utf8NoBom)
[System.IO.File]::WriteAllText($backendParamsFile, (@{ commands = @($backendLines) } | ConvertTo-Json -Depth 10), $utf8NoBom)
[System.IO.File]::WriteAllText($frontendParamsFile, (@{ commands = @($frontendLines) } | ConvertTo-Json -Depth 10), $utf8NoBom)

Write-Host "Waiting 45s for SSM agent..."
Start-Sleep -Seconds 45

function Wait-SSM {
    param([string]$CmdId, [string]$InstanceId, [string]$Name)
    for ($i = 0; $i -lt 48; $i++) {
        Start-Sleep -Seconds 5
        $inv = aws ssm get-command-invocation --command-id $CmdId --instance-id $InstanceId --region $region --output json 2>$null | ConvertFrom-Json
        if ($inv.Status -eq "Success") { Write-Host "$Name OK"; return }
        if ($inv.Status -eq "Failed" -or $inv.Status -eq "Cancelled") {
            Write-Host "STDERR: $($inv.StandardErrorContent)"
            Write-Host "STDOUT: $($inv.StandardOutputContent)"
            throw "$Name failed"
        }
        Write-Host "  $Name $($inv.Status)..."
    }
    throw "$Name timed out"
}

Write-Host "Deploying DB..."
$r = aws ssm send-command --instance-ids $dbId --document-name "AWS-RunShellScript" --parameters "file://$($dbParamsFile -replace '\\','/')" --region $region --output json | ConvertFrom-Json
if (-not $r.Command.CommandId) { throw "SSM send-command failed for DB" }
Wait-SSM $r.Command.CommandId $dbId "DB"

Write-Host "Deploying Backend..."
$r = aws ssm send-command --instance-ids $backendId --document-name "AWS-RunShellScript" --parameters "file://$($backendParamsFile -replace '\\','/')" --region $region --output json | ConvertFrom-Json
if (-not $r.Command.CommandId) { throw "SSM send-command failed for Backend" }
Wait-SSM $r.Command.CommandId $backendId "Backend"

Write-Host "Deploying Frontend..."
$r = aws ssm send-command --instance-ids $frontendId --document-name "AWS-RunShellScript" --parameters "file://$($frontendParamsFile -replace '\\','/')" --region $region --output json | ConvertFrom-Json
if (-not $r.Command.CommandId) { throw "SSM send-command failed for Frontend" }
Wait-SSM $r.Command.CommandId $frontendId "Frontend"

$alb = $tf.alb_dns_name.value
Write-Host ""
Write-Host "Deploy complete. App: http://$alb"
