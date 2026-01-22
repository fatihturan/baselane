/**
 * Cloudflare Worker – Rental Price API Proxy (Module Worker)
 *
 * This Worker acts as a secure proxy layer between frontend applications and
 * the Rentometer API. It is implemented as a **Module Worker** and exposes a
 * single POST endpoint that accepts rental-related input (address, bedrooms,
 * optional fields) and forwards the request to Rentometer on behalf of the client.
 *
 * Key responsibilities:
 * - Protects the Rentometer API key by keeping it server-side (env.RENTOMETER_API_KEY)
 * - Enforces request validation (required fields such as address and bedrooms)
 * - Restricts allowed HTTP methods to POST (OPTIONS for CORS preflight)
 * - Applies strict CORS rules with an allowlist of approved origins
 * - Normalizes error handling and response format for frontend consumption
 *
 * Request flow:
 * 1. Browser sends a POST request with JSON body (address, bedrooms, etc.)
 * 2. Worker validates the payload
 * 3. Worker constructs a GET request to the Rentometer summary endpoint
 * 4. Rentometer response is returned directly as JSON
 *
 * CORS behavior:
 * - Only predefined origins are allowed
 * - OPTIONS requests are handled explicitly for preflight
 * - Origin-based responses use the `Vary: Origin` header for proper caching behavior
 *
 * Typical use cases:
 * - Frontend apps (Webflow, React, etc.) that need rental price data
 * - Avoiding direct exposure of third-party API keys in client-side code
 * - Centralized validation, logging, and error handling for external API calls
 */

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

async function handleRequest(request, env) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(request),
    });
  }

  if (request.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: getCorsHeaders(request),
    });
  }

  try {
    const requestData = await request.json();

    if (!requestData.address || !requestData.bedrooms) {
      return new Response(
        JSON.stringify({ error: "Address and bedrooms are required fields" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request),
          },
        }
      );
    }

    const apiUrl = new URL("https://www.rentometer.com/api/v1/summary");
    apiUrl.searchParams.append("api_key", env.RENTOMETER_API_KEY);
    apiUrl.searchParams.append("address", requestData.address);
    apiUrl.searchParams.append("bedrooms", requestData.bedrooms);

    if (requestData.baths) apiUrl.searchParams.append("baths", requestData.baths);
    if (requestData.building_type) apiUrl.searchParams.append("building_type", requestData.building_type);

    const apiResponse = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: { "User-Agent": "Cloudflare-Worker-Rental-Proxy/1.0" },
    });

    if (!apiResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch rental data", status: apiResponse.status }),
        {
          status: apiResponse.status,
          headers: {
            "Content-Type": "application/json",
            ...getCorsHeaders(request),
          },
        }
      );
    }

    const apiData = await apiResponse.json();

    return new Response(JSON.stringify(apiData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...getCorsHeaders(request),
      },
    });
  } catch (error) {
    console.error("Worker error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error", message: error?.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...getCorsHeaders(request),
        },
      }
    );
  }
}

function getCorsHeaders(request) {
  const allowedOrigins = [
    "https://baselane-design-system.webflow.io",
    "https://baselane-main-website.webflow.io",
    "https://baselane-landing.design.webflow.com",
    "https://get.baselane.com",
    "https://www.baselane.com",
  ];

  const origin = request.headers.get("Origin");
  const isAllowedOrigin = allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : allowedOrigins[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}