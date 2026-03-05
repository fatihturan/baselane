# Baselane Website Scripts

Frontend scripts and assets for the Baselane marketing site (baselane.com). These files are served via CloudFront CDN at `dev-static.baselane.com`.

## Architecture

```
baselane-website-scripts repo (push to master)
  |
  +-- CodePipeline (Source -> Build)
        |
        +-- CodeBuild: aws s3 sync -> CloudFront invalidation
                          |
CloudFront (dev-static.baselane.com)
  |
  +-- /*  ->  S3 bucket (private, OAC-locked)
               Cache-Control: 1 day (86400s)
               Referer check + CORS restricted to allowed origins

Security:
  - OAC: S3 only accessible via CloudFront (no direct S3 URLs)
  - CloudFront Function: Referer header whitelist (viewer-request)
  - Response Headers Policy: CORS restricted to allowed origins
```

## How It Works

1. Push changes to `master` branch
2. AWS CodePipeline detects the push (via CodeStar GitHub connection)
3. CodeBuild runs `buildspec.yml`:
   - Syncs all JS/CSS/assets to the S3 bucket
   - Triggers a CloudFront cache invalidation (`/*`)
4. Files are available at `https://dev-static.baselane.com/<filename>`

## Using Scripts in Webflow

Reference scripts in Webflow custom code using the CDN URL:

```html
<script src="https://dev-static.baselane.com/carry-url-queries.js"></script>
<script src="https://dev-static.baselane.com/load-segment-analytics.js"></script>
<link rel="stylesheet" href="https://dev-static.baselane.com/global.css">
```

## Allowed Domains (CORS & Referer Whitelist)

Only these domains can load scripts from this CDN:

- `https://www.baselane.com`
- `https://get.baselane.com`
- `https://baselane-design-system.webflow.io`
- `https://baselane-main-website.webflow.io`
- `https://baselane-landing.design.webflow.com`

To add a new domain, update the CloudFront Function and Response Headers Policy in the `aws-infrastructure` repo (`module/cloudfront/`).

## Adding a New Script

1. Add your `.js` or `.css` file to the repo root (or a subdirectory)
2. Push to `master`
3. CodePipeline will automatically deploy it to `dev-static.baselane.com/<path>`
4. Reference it in Webflow using the CDN URL

## Clearing the Cache

Cache is automatically invalidated on every deploy. To manually clear:

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

Or invalidate a specific file:

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/carry-url-queries.js"
```

Browser cache TTL is 24 hours (`Cache-Control: public, max-age=86400`). Users may see stale files for up to 24 hours after a deploy unless they hard-refresh.

## File Overview

| File | Purpose |
|---|---|
| `carry-url-queries.js` | Preserves URL query parameters across page navigation |
| `load-segment-analytics.js` | Initializes Segment analytics with device detection |
| `form-submit-tracking.js` | Tracks form submissions via Segment, handles redirects |
| `custom-element-tracking.js` | Click tracking on elements with `track-event` attribute |
| `save-utm-queries-to-cookies.js` | First-touch/last-touch UTM attribution via cookies |
| `save-referrer-url-to-cookie.js` | Saves external referrer URL to cookie |
| `custom-smooth-scroll.js` | Smooth scrolling behavior |
| `custom-lightbox.js` | Lightbox component |
| `custom-color-variables.js` | CSS custom property injection |
| `custom-text-variables.js` | Text variable injection |
| `obie-popup.js` / `obie-popup-v2.js` | Popup components |
| `global.css` | Global styles |
| `typography-kit.css` | Typography system |
| `rental-property-calculator/` | Interactive rental property investment calculator |

## Workers (Future Migration)

The `workers/` directory contains two Cloudflare Workers that are currently deployed separately:

- `workers/price-my-rental.js` - Proxy to Rentometer API (hides API key)
- `workers/todays-rate-table.js` - Google Sheets to JSON API with caching

These will be migrated to AWS (API Gateway + Lambda) in a future phase and served from `dev-static.baselane.com/api/`.

## Infrastructure

All infrastructure is defined in the `aws-infrastructure` repo:

- S3 bucket + CloudFront distribution: `module/cloudfront/`
- CodePipeline: `website-scripts-pipeline.tf`
- DNS record: `hosted-zone.tf`
