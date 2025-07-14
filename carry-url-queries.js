document.addEventListener("DOMContentLoaded", function () {
    var params = window.location.search;

    document.querySelectorAll('a[href]:not(.disable-url-carrying):not(a[rel="noopener"]):not(a[href^="#"])')
        .forEach(function (link) {
        var paramsObject = new URLSearchParams(params);
        paramsObject.delete("query");
        params = "?" + paramsObject.toString();

        // Check if params is not empty
        if (params !== "?") {
            if (link.getAttribute("href").indexOf("?") === -1) {
                link.setAttribute(
                    "href",
                    link.getAttribute("href") + params
                );
            } else {
                link.setAttribute(
                    "href",
                    link.getAttribute("href") + "&" + params.substring(1)
                );
            }
        }
    });
});