(function () {
    var analytics = window.analytics = window.analytics || [];
    if (!analytics.initialize) {
        if (analytics.invoked) {
            window.console && console.error && console.error("Segment snippet included twice.");
        } else {
            analytics.invoked = !0;
            analytics.methods = ["trackSubmit", "trackClick", "trackLink", "trackForm", "pageview", "identify", "reset", "group", "track", "ready", "alias", "debug", "page", "screen", "once", "off", "on", "addSourceMiddleware", "addIntegrationMiddleware", "setAnonymousId", "addDestinationMiddleware", "register"];
            
            analytics.factory = function (e) {
                return function () {
                    if (window.analytics.initialized) return window.analytics[e].apply(window.analytics, arguments);
                    var t = Array.prototype.slice.call(arguments);
                    if (["track", "screen", "alias", "group", "page", "identify"].indexOf(e) > -1) {
                        var c = document.querySelector("link[rel='canonical']");
                        t.push({
                            __t: "bpc",
                            c: c && c.getAttribute("href") || void 0,
                            p: location.pathname,
                            u: location.href,
                            s: location.search,
                            t: document.title,
                            r: document.referrer
                        });
                    }
                    t.unshift(e);
                    analytics.push(t);
                    return analytics;
                };
            };
            
            for (var e = 0; e < analytics.methods.length; e++) {
                var key = analytics.methods[e];
                analytics[key] = analytics.factory(key);
            }
            
            analytics.load = function (key, options) {
                var t = document.createElement("script");
                t.type = "text/javascript";
                t.async = !0;
                t.fetchpriority = "high";
                t.src = "https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";
                var n = document.getElementsByTagName("script")[0];
                n.parentNode.insertBefore(t, n);
                analytics._loadOptions = options;
            };
            
            analytics._writeKey = "7lS4EOsMISdOoQCq0J01ESmf0EMwL3PB";
            analytics.SNIPPET_VERSION = "5.2.0";
            analytics.load("7lS4EOsMISdOoQCq0J01ESmf0EMwL3PB", { integrations: { All: true, 'Intercom': false } });
            
            function loadScript(src, callback) {
                var script = document.createElement("script");
                script.src = src;
                script.async = true;
                script.onload = callback;
                document.head.appendChild(script);
            }
            
            function trackUserInfo() {
                var parser = new UAParser();
                var result = parser.getResult();
                
                var userData = {
                    device_info: {
                        isMobile: /mobile|android|iphone|ipad|ipod/i.test(navigator.userAgent),
                        model: result.device.model || "Unknown",
                        os: result.os.name || "Unknown",
                        osVersion: result.os.version || "Unknown",
                        ua: navigator.userAgent,
                        vendor: result.device.vendor || "Unknown",
                    }
                };
                
                analytics.page(undefined, userData);
            }
            
            loadScript("https://cdn.jsdelivr.net/npm/ua-parser-js/dist/ua-parser.min.js", trackUserInfo);
        }
    }
})();