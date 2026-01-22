/**
 * Cloudflare Worker – Google Sheets → JSON API with KV Caching
 *
 * This Worker runs on Cloudflare Workers and acts as a lightweight API layer.
 * It fetches data from a publicly published Google Sheets document (CSV output),
 * parses and formats the data, and returns it as JSON with proper CORS headers
 * so it can be consumed directly from browsers or frontend applications.
 *
 * Caching strategy:
 * - The processed JSON response is stored in Cloudflare KV (`RATE_SHEET_CACHE`)
 *   for 24 hours (86400 seconds).
 * - On each request, the Worker first checks KV and returns cached data if
 *   available, avoiding unnecessary requests to Google Sheets.
 * - Adding the query parameter `?clearcache=true` forces a cache bypass:
 *   fresh data is fetched from Google Sheets and the cache is refreshed.
 * - If KV is not configured or available, the Worker still functions without
 *   caching and always fetches live data.
 *
 * Typical use cases:
 * - Rate sheets or pricing tables maintained in Google Sheets
 * - Read-only configuration or reference data
 * - Fast, low-cost, globally distributed APIs with minimal external requests
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // CORS headers for browser requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(request.url)
  
  // Check for cache clear parameter
  const clearCache = url.searchParams.get('clearcache') === 'true'
  
  try {
    // Try to get cached data first (unless clearing cache)
    let cachedData = null
    if (!clearCache && typeof RATE_SHEET_CACHE !== 'undefined') {
      cachedData = await RATE_SHEET_CACHE.get('rate_sheet_data', { type: 'json' })
    }
    
    if (cachedData && !clearCache) {
      return new Response(JSON.stringify(cachedData), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      })
    }

    // Fetch fresh data from Google Sheets
    const sheetId = "13mm3PD-P0ILsz0BcC84J46_1a4TvhFnUFdrE_oO26-Q"
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/pub?output=csv`
    
    const response = await fetch(csvUrl)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const csvText = await response.text()
    
    if (!csvText.trim()) {
      throw new Error('Empty response received')
    }

    // Parse CSV data
    const rows = parseCSV(csvText)
    
    if (rows.length === 0) {
      throw new Error('No data found')
    }

    // Get headers and latest row
    const headers = rows[0]
    const latestRow = rows[rows.length - 1]

    // Format today's date
    const today = new Date().toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })

    // Replace date in the latest row with today's date
    const updatedLatestRow = [...latestRow]
    headers.forEach((header, index) => {
      if (header.toLowerCase() === 'date updated' || header.toLowerCase() === 'date') {
        updatedLatestRow[index] = today
      }
    })

    // Add the static loan type column
    const finalHeaders = ['Loan Type', ...headers]
    const finalLatestRow = ['30 year DSCR loan', ...updatedLatestRow]

    const formattedData = {
      headers: finalHeaders,
      latest_row: finalLatestRow,
      last_updated: new Date().toISOString()
    }

    // Cache the data for 24 hours if KV storage is available
    if (typeof RATE_SHEET_CACHE !== 'undefined') {
      await RATE_SHEET_CACHE.put('rate_sheet_data', JSON.stringify(formattedData), {
        expirationTtl: 86400 // 24 hours
      })
    }

    return new Response(JSON.stringify(formattedData), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })

  } catch (error) {
    console.error('Error fetching rate sheet data:', error)
    
    return new Response(JSON.stringify({
      error: 'Failed to fetch rate sheet data',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    })
  }
}

// Simple CSV parser function
function parseCSV(text) {
  const rows = []
  const lines = text.split('\n')
  
  for (let line of lines) {
    if (line.trim()) {
      // Simple CSV parsing - handles basic cases
      const row = []
      let currentField = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          row.push(currentField.trim())
          currentField = ''
        } else {
          currentField += char
        }
      }
      
      // Add the last field
      row.push(currentField.trim())
      rows.push(row)
    }
  }
  
  return rows
}