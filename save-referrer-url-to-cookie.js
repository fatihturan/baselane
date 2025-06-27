function setCookie(name, value, daysToLive) {
	var cookie = name + "=" + encodeURIComponent(value) + "; path=/";
	if (typeof daysToLive === "number") {
		cookie += "; max-age=" + (daysToLive * 24 * 60 * 60);
		cookie += "; domain=.baselane.com; path=/";
		document.cookie = cookie;
	}
}

var referrer = document.referrer;
var urlArray = [
	"https://get.baselane.com", 
	"https://www.baselane.com",
	"https://baselane-landing.webflow.io",
	"https://baselane-main-website.webflow.io/"
];
var urlArrayLength = urlArray.length;

var isMatch = urlArray.find(function(url) {
	var regExpRule = new RegExp("^"+url+"(\/?)(.*)$");
	return referrer.match(regExpRule);
});

if(!isMatch && referrer) {
	setCookie("baselaneCookieReferrer", referrer, 30);
}