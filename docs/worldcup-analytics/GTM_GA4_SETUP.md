# GTM and GA4 setup

Use the site's existing Google tag and consent configuration. This package intentionally does not contain a GA4 measurement ID or GTM container ID.

## 1. Create Data Layer Variables

Create Version 2 Data Layer Variables for the following names:

```text
worldcup_event_source
worldcup_page_path
utm_source
utm_medium
utm_campaign
utm_content
utm_term
cta_label
cta_position
cta_destination
load_trigger
game_version
load_time_ms
opponent
scoring_team
home_score
away_score
result
match_duration_seconds
error_stage
error_code
```

Use clear variable names such as `DLV - World Cup - opponent`.

## 2. Create one Custom Event trigger

Create a **Custom Event** trigger with regular-expression matching enabled.

```regex
^(worldcup_view|play_click|game_load_started|game_ready|opponent_selected|match_start|goal_scored|match_complete|game_error|retry_click)$
```

Restrict it to Page Path equals `/worldcup/` when the container's structure makes that practical.

## 3. Create the GA4 event tag

Create one GA4 Event tag using the site's existing Google tag.

- Event name: the built-in `{{Event}}` variable.
- Trigger: the World Cup Custom Event trigger above.
- Event parameters: map each Data Layer Variable to the parameter with the same unprefixed name.

Do not set `user_id`, `user_properties`, advertising parameters, or free-text parameters in this tag.

If the site's consent platform denies analytics storage, the tag must continue to respect that state. Do not add a consent override solely for this game.

## 4. GA4 custom definitions

Register only the dimensions and metrics needed for reporting. Suggested event-scoped definitions:

### Dimensions

- `worldcup_event_source`
- `cta_position`
- `opponent`
- `scoring_team`
- `result`
- `error_stage`
- `error_code`
- `load_trigger`

Campaign fields are already understood by GA4 when acquisition is configured correctly, but the explicit event parameters are useful for debugging and exported data.

### Metrics

- `load_time_ms`
- `match_duration_seconds`
- `home_score`
- `away_score`

## 5. Key events

Recommended initial key event:

- `match_complete`

Treat `play_click` and `game_ready` as funnel milestones rather than business conversions. Add a separate parent-directed post-game conversion event only after that experience exists and has been approved.

## 6. Validation before publish

In Tag Assistant preview mode, complete a full match and verify:

```text
worldcup_view
play_click
game_load_started
game_ready
match_start
goal_scored (zero or more)
match_complete
```

Then verify the same events in GA4 DebugView. Confirm that each event fires once at the intended moment, parameters contain no PII, and the acquisition values match the test URL.

Example test URL:

```text
https://www.kidnation.com/worldcup/?utm_source=qa&utm_medium=test&utm_campaign=worldcup_analytics&utm_content=desktop_chrome
```
