# World Cup analytics release checklist

## Deployment checks

- [ ] WordPress plugin is active only on `/worldcup/`.
- [ ] WordPress and CDN caches have been cleared.
- [ ] Unity analytics assets and `.meta` files are in the expected paths.
- [ ] Both Unity patch files apply without rejected hunks.
- [ ] The WebGL build succeeds and the current build is deployed to GitHub Pages.
- [ ] GTM workspace contains the documented variables, trigger, and GA4 event tag.
- [ ] GTM consent settings match the site's approved policy.

## Functional funnel

Using Tag Assistant and GA4 DebugView:

- [ ] `worldcup_view` fires once on page load.
- [ ] Each of `Play Now`, `Kick Off`, and `Start the Match` produces one `play_click` with the correct `cta_position`.
- [ ] `game_load_started` fires when the valid iframe appears.
- [ ] `game_ready` fires after Unity initialization and contains a non-negative `load_time_ms`.
- [ ] `match_start` fires once per match, after the kickoff delay.
- [ ] `opponent_selected` contains the newly selected rival.
- [ ] `goal_scored` contains the correct scoring team and score.
- [ ] `match_complete` contains the correct result, final score, opponent, and duration.
- [ ] A forced startup failure produces `game_error` without raw exception text.
- [ ] A forced WebGL loader failure produces `game_error` with `error_stage=unity_loader`.
- [ ] Selecting the loader retry button produces `retry_click` before reload.

## Attribution

- [ ] Test UTMs appear on landing-page and game events.
- [ ] UTMs persist for the browser tab after a page reload without query parameters.
- [ ] Query strings are not included in `worldcup_page_path`.
- [ ] No email address, name, username, child identifier, or full referrer URL is present.

## Security

- [ ] A `postMessage` from another origin is ignored.
- [ ] A message from another window at the game origin is ignored.
- [ ] An unknown event name is ignored.
- [ ] Nested objects, arrays, and overlong strings are not forwarded.
- [ ] Directly opening the GitHub Pages game does not attempt to post events to an unknown parent.

## Device matrix

Run at least one full match on each:

- [ ] Desktop Chrome.
- [ ] Desktop Safari or Firefox.
- [ ] iPhone Safari in landscape.
- [ ] Android Chrome in landscape.
- [ ] iPad or Android tablet.
- [ ] A throttled mobile connection.

Record browser, operating system, device, `game_ready` result, `load_time_ms`, errors, and match completion result for each test.

## Reporting acceptance

- [ ] GA4 Explorations can calculate play-through, game-ready, match-start, completion, and error rates.
- [ ] Device/browser breakdowns are available for `game_ready` and `game_error`.
- [ ] `match_complete` is marked as a key event only after validation.
- [ ] The privacy or legal owner has approved production measurement for this child-directed experience.
