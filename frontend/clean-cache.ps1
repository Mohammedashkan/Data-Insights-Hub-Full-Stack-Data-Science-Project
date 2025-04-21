# Clean Next.js cache and reinstall dependencies

Write-Host "Cleaning Next.js cache..." -ForegroundColor Yellow

# Remove .next directory
if (Test-Path -Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Remove node_modules
Write-Host "Removing node_modules..." -ForegroundColor Yellow
if (Test-Path -Path "node_modules") {
    # Use PowerShell's Remove-Item instead of rimraf
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
}

# Reinstall dependencies
Write-Host "Reinstalling dependencies..." -ForegroundColor Yellow
npm install

# Install Next.js 13 with compatible TailwindCSS
Write-Host "Installing Next.js 13 and compatible TailwindCSS..." -ForegroundColor Yellow
npm install next@13.4.19 react@18.2.0 react-dom@18.2.0
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest @tailwindcss/postcss

# Update PostCSS config
Write-Host "Updating PostCSS configuration..." -ForegroundColor Yellow
$postcssConfig = @"
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
"@
Set-Content -Path "postcss.config.js" -Value $postcssConfig

# Initialize TailwindCSS if config doesn't exist
Write-Host "Creating TailwindCSS configuration..." -ForegroundColor Yellow
if (-not (Test-Path -Path "tailwind.config.js")) {
    $tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@
    Set-Content -Path "tailwind.config.js" -Value $tailwindConfig
}

# Update globals.css to include Tailwind directives
$globalsPath = "src\app\globals.css"
if (Test-Path -Path $globalsPath) {
    $content = Get-Content -Path $globalsPath -Raw
    if (-not ($content -match "@tailwind")) {
        Write-Host "Adding Tailwind directives to globals.css..." -ForegroundColor Yellow
        $tailwindDirectives = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

"@
        $tailwindDirectives + $content | Set-Content -Path $globalsPath
    }
}

Write-Host "Cache cleaned and dependencies reinstalled!" -ForegroundColor Green
Write-Host "Now run 'npm run dev' to start the development server." -ForegroundColor Cyan