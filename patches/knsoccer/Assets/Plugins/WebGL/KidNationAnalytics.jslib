mergeInto(LibraryManager.library, {
  KidNationTrackGameEvent: function (eventNamePointer, payloadPointer) {
    try {
      var eventName = UTF8ToString(eventNamePointer);
      var payloadJson = UTF8ToString(payloadPointer);
      if (!/^[a-z0-9_]{1,40}$/.test(eventName)) {
        return;
      }

      var parameters = {};
      try {
        parameters = payloadJson ? JSON.parse(payloadJson) : {};
      } catch (parseError) {
        parameters = {};
      }
      if (!parameters || typeof parameters !== 'object' || Array.isArray(parameters)) {
        parameters = {};
      }

      var allowedParents = {
        'https://www.kidnation.com': true,
        'https://kidnation.com': true
      };
      var parentOrigin = window.__kidNationAnalyticsParentOrigin || '';
      if (!parentOrigin) {
        try {
          var referrerOrigin = document.referrer ? new URL(document.referrer).origin : '';
          if (allowedParents[referrerOrigin]) {
            parentOrigin = referrerOrigin;
            window.__kidNationAnalyticsParentOrigin = parentOrigin;
          }
        } catch (referrerError) {
          parentOrigin = '';
        }
      }

      if (!parentOrigin || window.parent === window) {
        return;
      }

      window.parent.postMessage({
        source: 'kidnation-worldcup-game',
        version: 1,
        event: eventName,
        parameters: parameters
      }, parentOrigin);
    } catch (error) {
      // Analytics is best-effort and must never interrupt gameplay.
    }
  }
});
