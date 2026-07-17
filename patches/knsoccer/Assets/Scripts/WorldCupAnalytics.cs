#nullable enable

using System;
using System.Runtime.InteropServices;
using UnityEngine;

internal static class WorldCupAnalytics
{
#if UNITY_WEBGL && !UNITY_EDITOR
    [DllImport("__Internal")]
    private static extern void KidNationTrackGameEvent(string eventName, string payloadJson);
#endif

    public static void TrackOpponentSelected(string opponent)
    {
        Send("opponent_selected", new EventPayload
        {
            opponent = opponent,
        });
    }

    public static void TrackMatchStart(string opponent)
    {
        Send("match_start", new EventPayload
        {
            opponent = opponent,
        });
    }

    public static void TrackGoalScored(string scoringTeam, string opponent, int homeScore, int awayScore)
    {
        Send("goal_scored", new EventPayload
        {
            scoring_team = scoringTeam,
            opponent = opponent,
            home_score = homeScore,
            away_score = awayScore,
        });
    }

    public static void TrackMatchComplete(
        string opponent,
        string result,
        int homeScore,
        int awayScore,
        int matchDurationSeconds)
    {
        Send("match_complete", new EventPayload
        {
            opponent = opponent,
            result = result,
            home_score = homeScore,
            away_score = awayScore,
            match_duration_seconds = matchDurationSeconds,
        });
    }

    public static void TrackGameError(string errorStage, string errorCode)
    {
        Send("game_error", new EventPayload
        {
            error_stage = errorStage,
            error_code = errorCode,
        });
    }

    private static void Send(string eventName, EventPayload payload)
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        try
        {
            KidNationTrackGameEvent(eventName, JsonUtility.ToJson(payload));
        }
        catch (Exception)
        {
            // Analytics must never interrupt play. Do not forward raw exception
            // text because it can contain implementation details or URLs.
        }
#endif
    }

    [Serializable]
    private sealed class EventPayload
    {
        public string opponent = string.Empty;
        public string result = string.Empty;
        public string scoring_team = string.Empty;
        public string error_stage = string.Empty;
        public string error_code = string.Empty;
        public int home_score;
        public int away_score;
        public int match_duration_seconds;
    }
}
