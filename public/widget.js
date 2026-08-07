/**
 * Investigator Events widget loader — auto-resizing script embed.
 *
 * <script src="https://www.investigatorevents.com/widget.js" async
 *   data-ie-widget
 *   data-association="wad"        (optional — one association)
 *   data-country="united-kingdom" (optional — one country)
 *   data-theme="dark"             (optional)
 *   data-accent="1e3a5f"          (optional — hex, no #)
 *   data-limit="5"                (optional)
 *   data-view="compact"           (optional)
 * ></script>
 *
 * The iframe replaces the script tag in place and resizes itself to fit
 * its content, so it never clips or leaves blank space.
 */
(function () {
  'use strict';

  var ORIGIN = 'https://www.investigatorevents.com';

  function boot(script) {
    if (script.getAttribute('data-ie-loaded')) return;
    script.setAttribute('data-ie-loaded', '1');

    var params = new URLSearchParams();
    var map = { association: 'association', country: 'country', theme: 'theme', accent: 'accent', limit: 'limit', view: 'view' };
    for (var key in map) {
      var value = script.getAttribute('data-' + key);
      if (value) params.set(map[key], value);
    }
    var qs = params.toString();

    var iframe = document.createElement('iframe');
    iframe.src = ORIGIN + '/embed/upcoming' + (qs ? '?' + qs : '');
    iframe.title = 'Upcoming investigator events';
    iframe.style.cssText = 'width:100%;border:0;border-radius:16px;display:block;';
    iframe.height = '480';
    iframe.setAttribute('loading', 'lazy');

    script.parentNode.insertBefore(iframe, script);

    window.addEventListener('message', function (event) {
      if (event.origin !== ORIGIN) return;
      if (!event.data || event.data.source !== 'ie-widget') return;
      if (event.source !== iframe.contentWindow) return;
      var height = parseInt(event.data.height, 10);
      if (height > 0) iframe.height = String(height + 2);
    });
  }

  var scripts = document.querySelectorAll('script[data-ie-widget]');
  for (var i = 0; i < scripts.length; i++) boot(scripts[i]);

  // Support the common case of the script tag being the currently-executing one.
  if (!scripts.length && document.currentScript && document.currentScript.hasAttribute('data-ie-widget')) {
    boot(document.currentScript);
  }
})();
