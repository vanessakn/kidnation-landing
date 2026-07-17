# KidNation World Cup analytics implementation

This package connects the `/worldcup/` landing page, the cross-origin Unity WebGL game, Google Tag Manager, and GA4 without sending names, email addresses, free text, or persistent child identifiers.

## Architecture

1. The WordPress bridge runs only on `/worldcup/`.
2. It records the landing-page view, the three play CTAs, UTM attribution, and iframe load start in the existing `dataLayer`.
3. The Unity WebGL game posts an allowlisted event envelope to its KidNation parent page.
4. The parent page verifies both the game origin and iframe window, sanitizes parameters, and pushes the approved event to `dataLayer`.
5. GTM decides whether the event may be sent to GA4 under the site's existing consent and privacy configuration.

The bridge itself makes no analytics network request and creates no cookie.

## Repository contents

- `wordpress/kidnation-worldcup-analytics/` — installable WordPress plugin source.
- `patches/knsoccer/Assets/Scripts/WorldCupAnalytics.cs` — Unity event sender.
- `patches/knsoccer/Assets/Plugins/WebGL/KidNationAnalytics.jslib` — secure WebGL-to-parent message bridge.
- `patches/knsoccer/ArcadeSoccerMatch.analytics.patch` — match lifecycle instrumentation.
- `patches/knsoccer/SuperSoccerSkiesWebGlBuild.analytics.patch` — loader-error and retry instrumentation.
- `docs/worldcup-analytics/EVENT_SCHEMA.md` — event and parameter contract.
- `docs/worldcup-analytics/GTM_GA4_SETUP.md` — GTM and GA4 configuration.
- `docs/worldcup-analytics/QA_CHECKLIST.md` — release acceptance tests.

## Deployment order

### 1. WordPress

Zip the `wordpress/kidnation-worldcup-analytics` directory, upload it through **Plugins → Add New → Upload Plugin**, and activate it. Clear the WordPress/CDN cache after activation.

The plugin uses fallback CTA labels that match the current page: `Play Now`, `Kick Off`, and `Start the Match`. For more durable tracking, add these attributes to the corresponding links or buttons when editing the page:

```html
data-worldcup-cta
data-worldcup-cta-position="navigation|hero|how_to_play"
```

### 2. Google Tag Manager and GA4

Follow `GTM_GA4_SETUP.md`. Do not publish the GTM container until Tag Assistant and GA4 DebugView show the expected event sequence and the site's privacy/consent owner has approved the configuration.

### 3. Unity game

The connected GitHub account has read access, but not push access, to `miasstack/knsoccer`. A maintainer of that repository must:

1. Copy the two new Unity assets and their `.meta` files to the matching paths.
2. Apply both patch files from the repository root.
3. Build the WebGL target through the project's existing build command.
4. Deploy the regenerated `Builds/WebGL` output to GitHub Pages.

Suggested commands after copying this package into a checkout:

```bash
git apply patches/knsoccer/ArcadeSoccerMatch.analytics.patch
git apply patches/knsoccer/SuperSoccerSkiesWebGlBuild.analytics.patch
```

### 4. Release validation

Complete every check in `QA_CHECKLIST.md` before publishing the GTM container or treating the data as production-ready.

## Privacy guardrails

- No user ID, child ID, email, name, date of birth, free text, or raw exception text is accepted.
- Messages are accepted only from `https://miasstack.github.io` and only from the recognized game iframe.
- Game messages are sent only to `https://www.kidnation.com` or `https://kidnation.com`, based on the iframe referrer.
- Event and parameter names are allowlisted.
- Strings are stripped of control characters and length-limited.
- UTM values are stored only in browser session storage and must never contain personal information.
- Advertising features and remarketing are outside this package and should remain disabled unless separately approved for the child-directed experience.
