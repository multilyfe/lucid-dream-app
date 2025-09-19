try {
    Write-Host "Starting Next.js development server..."
    npm run dev
} catch {
    Write-Host "Error starting dev server: $_"
    exit 1
} finally {
    Write-Host "`nShutting down cleanly..."
}