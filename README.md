# TMC Clinic editorial front-end demo — v2

A local design concept built with plain HTML, CSS and JavaScript. Run `python3 -m http.server 8000` in this folder and open `http://localhost:8000`. No packages or build step are needed. Location requires localhost or HTTPS; Google Maps requires internet access.

## What's new

- Service clinic names link to their supplied Google Maps listing where a suitable link is available. Names with missing or questionable listings remain plain text pending verification. Service names were reconciled with the branch directory using explicit aliases; all matches still require client confirmation.
- Each service has a disabled Book Now placeholder. Add the client's confirmed Messenger URL before enabling it. There is no booking system.
- The promotion carousel is manually controlled, with arrows and touch swipe. The reviewer control compares A: homepage carousel, and B: carousel plus an example promotions page. The second promotion is sample content.
- The original design, locator and concept images are retained. The reviewer control is for this demo and is not part of the intended visitor experience.

## Files

- `index.html`: page structure and copy.
- `style.css`: responsive styles.
- `script.js`: navigation, locator, service lists, carousel and review options.
- `branches.js`: 70 branch records and preliminary coordinates.
- `services.js`: service descriptions and branch IDs. Keep IDs consistent with `branches.js`.
- `assets/`: client-supplied logo, fonts and promo artwork; AI-generated concept photos.
- `QA-REPORT.md`: checks and remaining limitations.

## Before launch

All branch details, service availability, map links, locations and coordinates require client confirmation. Some map links are missing or ambiguous and are intentionally withheld. The locator has 61 preliminary coordinate pins, and nearest results can be incomplete; distances are straight-line estimates. The map panel is a placeholder, not an embedded live map. Location is requested only when the user clicks the button.

Messenger destination, promo terms, expiry handling, final promo scope, hosting, domain, privacy and analytics need confirmation. No backend, CMS, booking page or live promotion management is included. The vaccination artwork is client-supplied and dated 26 Oct–30 Nov 2026. Other copy and AI-generated photographs are concept placeholders, subject to approval. This is not a deployed or approved website.
