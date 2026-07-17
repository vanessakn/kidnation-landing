(function () {
  'use strict';

  var config = Object.assign({
    pagePath: '/worldcup/',
    gameOrigin: 'https://miasstack.github.io',
    gamePathPrefix: '/knsoccer',
    iframeSelector: 'iframe[src*="miasstack.github.io/knsoccer"]',
    ctaLabels: ['play now', 'kick off', 'start the match'],
    dataLayerName: 'dataLayer'
  }, window.KidNationWorldCupAnalyticsConfig || {});

  function normalizePath(pathname) {
    var value = String(pathname || '/').replace(/\/{2,}/g, '/');
    return value.length > 1 && value.charAt(value.length - 1) !== '/' ? value + '/' : value;
  }

  if (normalizePath(window.location.pathname) !== normalizePath(config.pagePath)) {
    return;
  }

  var dataLayerName = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(config.dataLayerName)
    ? config.dataLayerName
    : 'dataLayer';
  window[dataLayerName] = window[dataLayerName] || [];
  var dataLayer = window[dataLayerName];

  var campaignKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var campaignStorageKey = 'kidnation_worldcup_campaign_v1';
  var allowedGameEvents = {
    game_load_started: ['game_version'],
    game_ready: ['load_time_ms', 'game_version'],
    opponent_selected: ['opponent'],
    match_start: ['opponent'],
    goal_scored: ['scoring_team', 'opponent', 'home_score', 'away_score'],
    match_complete: ['opponent', 'result', 'home_score', 'away_score', 'match_duration_seconds'],
    game_error: ['error_stage', 'error_code'],
    retry_click: ['error_stage']
  };

  function cleanString(value, maxLength) {
    if (typeof value !== 'string') {
      return '';
    }

    return value
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .trim()
      .slice(0, maxLength || 100);
  }

  function cleanScalar(value, key) {
    if (typeof value === 'string') {
      return cleanString(value, 100);
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      if (/_score$/.test(key) || /_seconds$/.test(key) || /_ms$/.test(key)) {
        return Math.max(0, Math.round(value));
      }
      return value;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    return undefined;
  }

  function readCampaign() {
    var campaign = {};
    var searchParams = new URLSearchParams(window.location.search);

    campaignKeys.forEach(function (key) {
      var value = cleanString(searchParams.get(key) || '', 100);
      if (value) {
        campaign[key] = value;
      }
    });

    try {
      if (Object.keys(campaign).length) {
        window.sessionStorage.setItem(campaignStorageKey, JSON.stringify(campaign));
      } else {
        var stored = JSON.parse(window.sessionStorage.getItem(campaignStorageKey) || '{}');
        campaignKeys.forEach(function (key) {
          var value = cleanString(stored[key] || '', 100);
          if (value) {
            campaign[key] = value;
          }
        });
      }
    } catch (error) {
      // Storage can be unavailable in hardened or private browser modes.
    }

    return campaign;
  }

  var campaign = readCampaign();

  function pushEvent(eventName, parameters, source) {
    var model = Object.assign({
      event: eventName,
      worldcup_event_source: source,
      worldcup_page_path: normalizePath(window.location.pathname)
    }, campaign, parameters || {});

    dataLayer.push(model);
  }

  function normalizedText(element) {
    return cleanString((element.textContent || '').replace(/\s+/g, ' '), 80).toLowerCase();
  }

  function isPlayCta(element) {
    if (element.hasAttribute('data-worldcup-cta')) {
      return true;
    }

    return config.ctaLabels.indexOf(normalizedText(element)) !== -1;
  }

  function inferCtaPosition(element) {
    var explicit = cleanString(
      element.getAttribute('data-worldcup-cta-position') ||
      element.getAttribute('data-cta-position') ||
      '',
      50
    );
    if (explicit) {
      return explicit;
    }

    var label = normalizedText(element);
    if (label === 'play now') {
      return 'navigation';
    }
    if (label === 'kick off') {
      return 'hero';
    }
    if (label === 'start the match') {
      return 'how_to_play';
    }

    var section = element.closest('nav, header, section, main, footer');
    if (section && section.id) {
      return cleanString(section.id, 50);
    }

    return 'unknown';
  }

  function safeDestination(element) {
    var href = cleanString(element.getAttribute('href') || '', 200);
    if (!href) {
      return '';
    }

    if (href.charAt(0) === '#') {
      return href;
    }

    try {
      var url = new URL(href, window.location.href);
      return url.origin === window.location.origin
        ? cleanString(url.pathname + url.hash, 200)
        : cleanString(url.hostname + url.pathname, 200);
    } catch (error) {
      return '';
    }
  }

  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element
      ? event.target.closest('a, button, [role="button"]')
      : null;

    if (!target || !isPlayCta(target)) {
      return;
    }

    pushEvent('play_click', {
      cta_label: cleanString(target.textContent || '', 80),
      cta_position: inferCtaPosition(target),
      cta_destination: safeDestination(target)
    }, 'landing_page');
  }, true);

  function findGameFrame() {
    var frame = document.querySelector(config.iframeSelector);
    if (!frame || !frame.src) {
      return null;
    }

    try {
      var url = new URL(frame.src, window.location.href);
      if (url.origin !== config.gameOrigin || url.pathname.indexOf(config.gamePathPrefix) !== 0) {
        return null;
      }
    } catch (error) {
      return null;
    }

    return frame;
  }

  var gameFrame = null;
  var gameLoadStartedAt = 0;
  var gameFrameLoadCount = 0;

  function beginGameLoad(source) {
    gameLoadStartedAt = window.performance && typeof window.performance.now === 'function'
      ? window.performance.now()
      : Date.now();
    pushEvent('game_load_started', { load_trigger: source }, 'landing_page');
  }

  function registerGameFrame() {
    var frame = findGameFrame();
    if (!frame || frame === gameFrame) {
      return;
    }

    gameFrame = frame;
    gameFrameLoadCount = 0;
    beginGameLoad('iframe_detected');

    frame.addEventListener('load', function () {
      gameFrameLoadCount += 1;
      if (gameFrameLoadCount > 1) {
        beginGameLoad('iframe_reloaded');
      }
    });
  }

  registerGameFrame();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerGameFrame, { once: true });
  }

  var frameObserver = new MutationObserver(registerGameFrame);
  frameObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });

  function cleanGameParameters(eventName, parameters) {
    var clean = {};
    var keys = allowedGameEvents[eventName] || [];
    var source = parameters && typeof parameters === 'object' && !Array.isArray(parameters)
      ? parameters
      : {};

    keys.forEach(function (key) {
      var value = cleanScalar(source[key], key);
      if (value !== undefined && value !== '') {
        clean[key] = value;
      }
    });

    return clean;
  }

  window.addEventListener('message', function (messageEvent) {
    if (messageEvent.origin !== config.gameOrigin) {
      return;
    }

    registerGameFrame();
    if (!gameFrame || messageEvent.source !== gameFrame.contentWindow) {
      return;
    }

    var message = messageEvent.data;
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      return;
    }

    if (message.source !== 'kidnation-worldcup-game' || message.version !== 1) {
      return;
    }

    var eventName = cleanString(message.event || '', 40);
    if (!Object.prototype.hasOwnProperty.call(allowedGameEvents, eventName)) {
      return;
    }

    var parameters = cleanGameParameters(eventName, message.parameters);
    if (eventName === 'game_ready' && parameters.load_time_ms === undefined && gameLoadStartedAt) {
      var now = window.performance && typeof window.performance.now === 'function'
        ? window.performance.now()
        : Date.now();
      parameters.load_time_ms = Math.max(0, Math.round(now - gameLoadStartedAt));
    }

    pushEvent(eventName, parameters, 'game');
  });

  // Fires once per real page load. The script does not call GA4 directly; GTM or
  // another approved analytics layer decides whether and where this event is sent.
  if (!window.__kidNationWorldCupViewTracked) {
    window.__kidNationWorldCupViewTracked = true;
    pushEvent('worldcup_view', {}, 'landing_page');
  }
}());
