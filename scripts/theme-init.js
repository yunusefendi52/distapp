// Injected inline into <head> before first paint to avoid a theme flash (FOUC).
// Keep the cookie name and class names in sync with utils/theme.ts.
(function () {
    try {
        var match = document.cookie.match(/(?:^|;\s*)app-theme=([^;]+)/);
        var preference = match ? decodeURIComponent(match[1]) : 'system';
        if (preference === 'd') {
            preference = 'dark';
        } else if (preference === 'l') {
            preference = 'light';
        }
        var isDark = preference === 'system' ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches : preference === 'dark';
        var root = document.documentElement;
        root.classList.remove('appdark', 'applight');
        root.classList.add(isDark ? 'appdark' : 'applight');
        var setThemeColor = function () {
            var meta = document.querySelector('meta[name="theme-color"]');
            if (meta) {
                meta.setAttribute('content', isDark ? 'black' : 'white');
            }
        };
        setThemeColor();
        if (!document.querySelector('meta[name="theme-color"]')) {
            document.addEventListener('DOMContentLoaded', setThemeColor, { once: true });
        }
    } catch (e) {
        console.error('[theme-init] failed to apply initial theme', e);
    }
})();
