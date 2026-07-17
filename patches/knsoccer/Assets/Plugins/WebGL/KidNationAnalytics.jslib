mergeInto(LibraryManager.library, {
  KidNationTrackGameEvent: function (eventNamePointer, payloadPointer) {
    try {
      var eventName = UTF8ToString(eventNamePointer);
      var payloadJson = UTF8ToString(payloadPointer);

      if (typeof window.KidNationTrackGameEvent === 'function') {
        window.KidNationTrackGameEvent(eventName, payloadJson);
      }
    } catch (error) {
      // Analytics is intentionally best-effort and must never stop the game.
    }
  }
});
