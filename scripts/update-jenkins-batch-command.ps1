$ErrorActionPreference = 'Stop'

$user = 'Akshay03Vadde'
$pass = 'Akshay@123'
$pair = "${user}:${pass}"
$auth = 'Basic ' + [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes($pair))
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$headers = @{ Authorization = $auth }

$crumb = Invoke-RestMethod -Uri 'http://localhost:7070/crumbIssuer/api/json' -Headers $headers -WebSession $session
$configUrl = 'http://localhost:7070/job/Playwright-OCT-Automation03/config.xml'
$configXml = (Invoke-WebRequest -Uri $configUrl -Headers $headers -WebSession $session -UseBasicParsing).Content

$updatedXml = $configXml `
  -replace '(?m)^npm ci$', 'call npm ci' `
  -replace '(?m)^npx playwright install$', 'call npx playwright install' `
  -replace '(?m)^npx playwright test tests/OCT_Regression/4689052_InHeaderImports\.spec\.js --project=chromium --reporter=line,html$', 'call npx playwright test tests/OCT_Regression/4689052_InHeaderImports.spec.js --project=chromium --reporter=line,html'

if ($updatedXml -eq $configXml) {
  Write-Host 'NO_CHANGES_NEEDED'
  exit 0
}

$postHeaders = @{ Authorization = $auth }
$postHeaders[$crumb.crumbRequestField] = $crumb.crumb
Invoke-WebRequest -Uri $configUrl -Method Post -ContentType 'application/xml' -Headers $postHeaders -WebSession $session -Body $updatedXml -UseBasicParsing | Out-Null

Write-Host 'CONFIG_UPDATED_OK'
