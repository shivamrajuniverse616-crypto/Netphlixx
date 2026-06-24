package com.shivamraj.netphlixx

import android.app.Activity
import android.os.Message
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.widget.FrameLayout

/**
 * Custom WebChromeClient that:
 * 1. Blocks popup windows (ad popups) — prevents window.open() from ads
 * 2. Handles fullscreen video playback (entering/exiting fullscreen)
 */
class AdBlockWebChromeClient(
    private val activity: Activity,
    private val customViewContainer: FrameLayout,
    private val onShowCustomViewAction: (View, CustomViewCallback) -> Unit,
    private val onHideCustomViewAction: () -> Unit,
    private val onProgressChangedAction: (Int) -> Unit
) : WebChromeClient() {

    // ── Block popup windows ────────────────────────────────────────────────
    override fun onCreateWindow(
        view: WebView?,
        isDialog: Boolean,
        isUserGesture: Boolean,
        resultMsg: Message?
    ): Boolean {
        // We do NOT want to open any new windows or redirect popups into our main view.
        // Ad iframes often use user-gestures to spawn popups when the video is clicked. 
        // Returning false causes the WebView to drop the popup request entirely.
        return false
    }

    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        onProgressChangedAction.invoke(newProgress)
    }

    // ── Fullscreen video support ───────────────────────────────────────────
    override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
        if (view != null && callback != null) {
            onShowCustomViewAction.invoke(view, callback)
        }
    }

    override fun onHideCustomView() {
        onHideCustomViewAction.invoke()
    }
}
