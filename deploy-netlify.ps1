# Deploy the frontend to Netlify

Write-Host "Preparing Data Insights Hub for Netlify deployment..." -ForegroundColor Green

# Navigate to the frontend directory
cd $PSScriptRoot\frontend

# Create netlify.toml configuration file
$netlifyConfig = @"
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NEXT_PUBLIC_API_URL = "https://your-backend-api-url.com"
"@

Set-Content -Path "netlify.toml" -Value $netlifyConfig

# Build the project first
Write-Host "Building the Next.js project..." -ForegroundColor Yellow
npm run build

# Install Netlify CLI if not already installed
if (-not (Get-Command netlify -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Netlify CLI..." -ForegroundColor Yellow
    npm install -g netlify-cli
}

# Check if user is logged in to Netlify
$loginStatus = netlify status
if ($loginStatus -match "Not logged in") {
    Write-Host "Please log in to your Netlify account:" -ForegroundColor Yellow
    netlify login
}

# Deploy to Netlify
Write-Host "Deploying to Netlify..." -ForegroundColor Cyan
netlify deploy --prod --dir="out"

Write-Host "Deployment process completed!" -ForegroundColor Green
Write-Host "Note: You may need to configure environment variables in the Netlify dashboard." -ForegroundColor Yellow
Write-Host "For the backend, consider deploying to a service like Heroku, Azure, or AWS." -ForegroundColor Yellow