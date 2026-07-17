# World Cup event schema

All events are pushed to the existing GTM `dataLayer`. The parent bridge adds `worldcup_event_source`, `worldcup_page_path`, and any available UTM parameters to each event.

| Event | Producer | Required moment | Parameters |
|---|---|---|---|
| `worldcup_view` | Landing page | Once per page load | campaign fields when present |
| `play_click` | Landing page | Any approved play CTA is activated | `cta_label`, `cta_position`, `cta_destination` |
| `game_load_started` | Landing page | Valid game iframe is detected or reloaded | `load_trigger` |
| `game_ready` | Unity game | Game initialization completes and play can begin | `game_version`, `load_time_ms` added by the parent bridge |
| `opponent_selected` | Unity game | Rival changes | `opponent` |
| `match_start` | Unity game | The kickoff player first receives the ball | `opponent` |
| `goal_scored` | Unity game | Either team scores | `scoring_team`, `opponent`, `home_score`, `away_score` |
| `match_complete` | Unity game | Time expires or either team reaches the winning score | `opponent`, `result`, `home_score`, `away_score`, `match_duration_seconds` |
| `game_error` | Unity game or loader | Startup or WebGL instance creation fails | `error_stage`, `error_code` |
| `retry_click` | WebGL loader | Retry button is selected after a loader error | `error_stage` |

## Shared parameters

| Parameter | Type | Example | Notes |
|---|---|---|---|
| `worldcup_event_source` | string | `landing_page` | `landing_page` or `game` |
| `worldcup_page_path` | string | `/worldcup/` | Does not include the query string |
| `utm_source` | string | `instagram` | Session-scoped attribution |
| `utm_medium` | string | `organic_social` | Session-scoped attribution |
| `utm_campaign` | string | `worldcup_game` | Session-scoped attribution |
| `utm_content` | string | `team_spain_reel` | Session-scoped creative identifier |
| `utm_term` | string | `soccer_game` | Optional; never place PII here |

## Allowed values

- `cta_position`: `navigation`, `hero`, `how_to_play`, a section ID, or `unknown`.
- `scoring_team`: `kidnation` or `opponent`.
- `result`: `win`, `loss`, or `draw` from KidNation's perspective.
- `error_stage`: currently `unity_startup` or `unity_loader`.
- `error_code`: currently `startup_failure` or `create_instance_failed`.

Scores, durations, and load times are non-negative integers. Strings are limited to 100 characters after sanitization.

## Cross-origin message envelope

The game sends this browser message to its approved KidNation parent origin:

```json
{
  "source": "kidnation-worldcup-game",
  "version": 1,
  "event": "match_complete",
  "parameters": {
    "opponent": "Brazil",
    "result": "win",
    "home_score": 5,
    "away_score": 3,
    "match_duration_seconds": 91
  }
}
```

The parent page rejects unknown origins, unknown iframe windows, unknown event names, arrays, nested objects, and non-scalar parameter values.
