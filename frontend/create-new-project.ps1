# Create a new Next.js project with TailwindCSS

Write-Host "Creating a temporary directory for the new project..." -ForegroundColor Yellow
$tempDir = "C:\Users\ashka\Desktop\temp-next-project"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

# Navigate to the temporary directory
Set-Location -Path $tempDir

# Create a new Next.js project with TailwindCSS
Write-Host "Creating a new Next.js project with TailwindCSS..." -ForegroundColor Yellow
npx create-next-app@latest . --typescript --tailwind --eslint

# Copy the new project files to the original directory
Write-Host "Copying the new project files to the original directory..." -ForegroundColor Yellow
$originalDir = "C:\Users\ashka\Desktop\Data-Insights-Hub-Full-Stack-Data-Science-Project\frontend"

# Backup the src directory if it exists
if (Test-Path -Path "$originalDir\src") {
    Write-Host "Backing up the src directory..." -ForegroundColor Yellow
    Copy-Item -Path "$originalDir\src" -Destination "$originalDir\src.bak" -Recurse -Force
}

# Copy the new project files, excluding node_modules and .git
Write-Host "Copying configuration files..." -ForegroundColor Yellow
Copy-Item -Path "$tempDir\package.json" -Destination "$originalDir\package.json" -Force
Copy-Item -Path "$tempDir\postcss.config.js" -Destination "$originalDir\postcss.config.js" -Force
Copy-Item -Path "$tempDir\tailwind.config.ts" -Destination "$originalDir\tailwind.config.ts" -Force
Copy-Item -Path "$tempDir\tsconfig.json" -Destination "$originalDir\tsconfig.json" -Force
Copy-Item -Path "$tempDir\next.config.js" -Destination "$originalDir\next.config.js" -Force

# Navigate back to the original directory
Set-Location -Path $originalDir

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "New project created and configured!" -ForegroundColor Green
Write-Host "Your original src directory has been backed up to src.bak" -ForegroundColor Cyan
Write-Host "Now run 'npm run dev' to start the development server." -ForegroundColor Cyan