=== KidNation World Cup Analytics Bridge ===
Contributors: kidnation
Tags: analytics, google-tag-manager, ga4, webgl
Requires at least: 6.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: Proprietary

A privacy-conscious dataLayer bridge for the KidNation World Cup landing page and embedded Unity game.

== Description ==

The plugin loads only on the WordPress page whose slug is `worldcup`. It tracks the landing-page view, approved play CTAs, UTM attribution, and the embedded game's allowlisted cross-origin messages. It does not send a network request or create a cookie by itself.

== Installation ==

1. Place this directory in `wp-content/plugins/` or upload it as a ZIP through WordPress.
2. Activate **KidNation World Cup Analytics Bridge**.
3. Clear WordPress and CDN caches.
4. Configure GTM and GA4 using the repository documentation.
5. Deploy the matching Unity instrumentation before expecting gameplay events.

== Changelog ==

= 1.0.0 =
* Initial World Cup funnel and cross-origin game event bridge.
