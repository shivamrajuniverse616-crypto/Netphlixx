package com.shivamraj.netphlixx

import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import java.io.ByteArrayInputStream

/**
 * Custom WebViewClient that intercepts all network requests and blocks known
 * ad/tracker domains. Also injects CSS to hide ad overlay elements after page load.
 */
class AdBlockWebViewClient(
    private val onPageFinishedAction: () -> Unit,
    private val onNetworkErrorAction: () -> Unit
) : WebViewClient() {

    @Volatile
    private var isWatchPage = false

    override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
        super.doUpdateVisitedHistory(view, url, isReload)
        isWatchPage = url?.contains("/watch") == true
    }

    companion object {

        // ── Blocked ad / tracker domains ───────────────────────────────────
        private val BLOCKED_DOMAINS = setOf(
            // Google Ads
            "doubleclick.net",
            "googlesyndication.com",
            "googleadservices.com",
            "pagead2.googlesyndication.com",
            "adservice.google.com",
            "google-analytics.com",
            "googletagmanager.com",
            "googletagservices.com",

            // Major ad networks
            "adnxs.com",
            "adsrvr.org",
            "adcolony.com",
            "advertising.com",
            "rubiconproject.com",
            "pubmatic.com",
            "openx.net",
            "casalemedia.com",
            "criteo.com",
            "criteo.net",
            "taboola.com",
            "outbrain.com",
            "revcontent.com",
            "mgid.com",
            "media.net",
            "amazon-adsystem.com",
            "2mdn.net",
            "serving-sys.com",
            "smaato.net",
            "moatads.com",
            "doubleverify.com",
            "adsafeprotected.com",
            "iasds01.com",
            "flashtalking.com",
            "innovid.com",

            // Popup / popunder networks
            "popads.net",
            "popcash.net",
            "popunder.net",
            "popmyads.com",
            "juicyads.com",
            "exoclick.com",
            "exosrv.com",
            "trafficjunky.com",
            "trafficfactory.biz",
            "hilltopads.net",
            "propellerads.com",
            "propellercodes.com",
            "clickadu.com",
            "clickaine.com",
            "a-ads.com",
            "adsterra.com",
            "ad-maven.com",
            "admaven.com",
            "onclickmax.com",
            "onclickmega.com",
            "onclickrev.com",

            // Streaming-specific ad networks
            "vidoomy.com",
            "streamads.net",
            "betterstreams.co",
            "brid.tv",
            "spotxchange.com",
            "springserve.com",
            "vid.springserve.com",
            "ads.stickyadstv.com",
            "cdn.spotx.tv",

            // Programmatic / exchange
            "connectad.io",
            "33across.com",
            "bidswitch.net",
            "sharethrough.com",
            "triplelift.com",
            "yieldmo.com",
            "indexexchange.com",

            // Tracking / analytics (aggressive block for ad-free experience)
            "mixpanel.com",
            "hotjar.com",
            "mouseflow.com",
            "fullstory.com",
            "clarity.ms",
            "newrelic.com",
            "segment.io",
            "amplitude.com",

            // Crypto miners / malware
            "coinhive.com",
            "coin-hive.com",
            "cryptoloot.pro",
            "authedmine.com",

            // URL shortener ad walls
            "adf.ly",
            "linkbucks.com",
            "shorte.st",
            "sh.st",
            "bc.vc",
            "fas.li",

            // Notification / push spam
            "pushwoosh.com",
            "onesignal.com",
            "gravitec.net",
            "pushcrew.com",
            "subscribers.com",

            // Redirect / affiliate tracking
            "go.redirectingat.com",
            "track.wg-aff.com",

            // Social widgets (remove clutter)
            "widgets.outbrain.com",
            "cdn.taboola.com",
            "static.ads-twitter.com",
            "whos.amung.us",
        )

        // ── Blocked URL path patterns ──────────────────────────────────────
        private val BLOCKED_PATH_PATTERNS = listOf(
            "/ads/",
            "/ads.",
            "/ad/",
            "/ad.",
            "/advert",
            "/pop.js",
            "/popunder",
            "/popup",
            "/banner",
            "/sponsor",
            "/prebid",
            "/vast/",
            "/vpaid/",
            "/pagead/",
            "/adserver",
            "/admanager",
            "/adsense",
            "/click?",
            "/track?",
            "/tracker",
            "/pixel.",
            "/beacon.",
            "ad_iframe",
            "ad_slot",
        )

        // ── CSS injected to hide ad overlay elements ───────────────────────
        private val AD_HIDE_CSS = """
            [class*="ad-overlay"], [class*="ad_overlay"],
            [class*="ad-container"], [class*="ad_container"],
            [class*="ad-wrapper"], [class*="ad_wrapper"],
            [class*="ad-banner"], [class*="ad_banner"],
            [class*="popupAd"], [class*="popup-ad"],
            [id*="ad-overlay"], [id*="ad_overlay"],
            [id*="ad-container"], [id*="ad_container"],
            [data-ad], [data-ads], [data-ad-slot],
            div[class*="AdSlot"], div[class*="adslot"],
            iframe[src*="ads"], iframe[src*="pop"],
            iframe[src*="doubleclick"], iframe[src*="googlesyndication"],
            .ad-container, .ad-wrapper, .ad-overlay, .ad-banner,
            .popupAd, .popup-overlay-ad {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                width: 0 !important;
                max-height: 0 !important;
                max-width: 0 !important;
                overflow: hidden !important;
                pointer-events: none !important;
                position: absolute !important;
                left: -9999px !important;
            }
        """.trimIndent()

        // Reusable empty response for blocked requests
        private val EMPTY_RESPONSE = WebResourceResponse(
            "text/plain",
            "utf-8",
            ByteArrayInputStream(ByteArray(0))
        )
    }

    // ── Request interception ───────────────────────────────────────────────
    override fun shouldInterceptRequest(
        view: WebView?,
        request: WebResourceRequest?
    ): WebResourceResponse? {
        if (!isWatchPage) return null
        
        val url = request?.url?.toString() ?: return null
        val host = request.url.host?.lowercase() ?: return null

        // 1. Block known ad domains
        if (isBlockedDomain(host)) {
            return EMPTY_RESPONSE
        }

        // 2. Block known ad URL path patterns
        val path = request.url.path?.lowercase() ?: ""
        if (BLOCKED_PATH_PATTERNS.any { path.contains(it) }) {
            return EMPTY_RESPONSE
        }

        // 3. Block common ad query params
        val query = request.url.query?.lowercase() ?: ""
        if (query.contains("adserver") || query.contains("adsense")) {
            return EMPTY_RESPONSE
        }

        return null // Allow the request through
    }

    // ── Navigation interception ────────────────────────────────────────────
    override fun shouldOverrideUrlLoading(
        view: WebView?,
        request: WebResourceRequest?
    ): Boolean {
        if (!isWatchPage) return false

        val host = request?.url?.host?.lowercase() ?: return false

        // Block navigation to ad domains (popup redirects)
        if (isBlockedDomain(host)) {
            return true
        }

        return false
    }

    // ── Post-load CSS injection ────────────────────────────────────────────
    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        onPageFinishedAction.invoke()

        if (!isWatchPage) return

        // Inject CSS to hide any ad overlay elements that made it through
        // Note: Do not hide 'iframe' or we will break the embedded video players!
        view?.evaluateJavascript(
            """
            (function() {
                var style = document.createElement('style');
                style.innerHTML = `
                    .ad-container, .sponsored, [id^="ad-banner"] {
                        display: none !important;
                    }
                `;
                document.head.appendChild(style);
            })();
            """.trimIndent(),
            null
        )
    }

    override fun onReceivedError(
        view: WebView?,
        request: WebResourceRequest?,
        error: WebResourceError?
    ) {
        super.onReceivedError(view, request, error)
        if (request?.isForMainFrame == true) {
            val code = error?.errorCode
            if (code == ERROR_HOST_LOOKUP || code == ERROR_CONNECT || code == ERROR_TIMEOUT || code == ERROR_UNKNOWN) {
                onNetworkErrorAction.invoke()
            }
        }
    }

    // ── Domain matching ────────────────────────────────────────────────────
    private fun isBlockedDomain(host: String): Boolean {
        return BLOCKED_DOMAINS.any { domain ->
            host == domain || host.endsWith(".$domain")
        }
    }
}
