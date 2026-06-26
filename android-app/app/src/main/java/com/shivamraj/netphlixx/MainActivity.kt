package com.shivamraj.netphlixx

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.*
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var progressBar: ProgressBar
    private lateinit var offlineLayout: LinearLayout
    
    private var customViewContainer: FrameLayout? = null
    private var customView: View? = null
    private var customViewCallback: WebChromeClient.CustomViewCallback? = null

    companion object {
        private const val WEBAPP_URL = "https://netphlixx.vercel.app"
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        // Must be called before super.onCreate
        installSplashScreen()
        
        super.onCreate(savedInstanceState)

        if (applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE != 0) {
            WebView.setWebContentsDebuggingEnabled(true)
        } else {
            // Force enable for this build to debug Vercel cache issue
            WebView.setWebContentsDebuggingEnabled(true)
        }

        // Set up the back button callback
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                when {
                    // Exit fullscreen video first
                    customView != null -> {
                        customViewCallback?.onCustomViewHidden()
                        customView?.let { customViewContainer?.removeView(it) }
                        customView = null
                        customViewCallback = null
                        customViewContainer?.visibility = View.GONE
                        swipeRefreshLayout.visibility = View.VISIBLE
                        WindowInsetsControllerCompat(window, window.decorView)
                            .show(WindowInsetsCompat.Type.systemBars())
                    }
                    // Navigate back in WebView history
                    webView.canGoBack() -> webView.goBack()
                    // Exit app
                    else -> {
                        isEnabled = false
                        onBackPressedDispatcher.onBackPressed()
                    }
                }
            }
        })

        // Immersive edge-to-edge
        WindowCompat.setDecorFitsSystemWindows(window, false)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        window.statusBarColor = android.graphics.Color.parseColor("#0a0a0c")
        window.navigationBarColor = android.graphics.Color.parseColor("#0a0a0c")

        // ─── UI Setup ──────────────────────────────────────────────────────────

        val root = FrameLayout(this)
        root.setBackgroundColor(android.graphics.Color.parseColor("#0a0a0c"))

        // 1. Progress Bar
        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            max = 100
            visibility = View.GONE
            progressDrawable.setColorFilter(
                android.graphics.Color.parseColor("#E50914"), // Netflix Red
                android.graphics.PorterDuff.Mode.SRC_IN
            )
        }
        val progressParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            (4 * resources.displayMetrics.density).toInt() // 4dp height
        ).apply {
            gravity = Gravity.TOP
            // Push below status bar
            topMargin = getStatusBarHeight()
        }

        // 2. Offline Layout
        offlineLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            visibility = View.GONE
            setBackgroundColor(android.graphics.Color.parseColor("#0a0a0c"))

            val errorText = TextView(this@MainActivity).apply {
                text = "No Internet Connection"
                setTextColor(android.graphics.Color.WHITE)
                textSize = 18f
                gravity = Gravity.CENTER
            }
            
            val retryButton = Button(this@MainActivity).apply {
                text = "Retry"
                setBackgroundColor(android.graphics.Color.parseColor("#E50914"))
                setTextColor(android.graphics.Color.WHITE)
                setOnClickListener {
                    visibility = View.GONE
                    swipeRefreshLayout.visibility = View.VISIBLE
                    webView.reload()
                }
            }
            
            addView(errorText, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).apply { bottomMargin = 32 })
            addView(retryButton, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        }

        // 3. WebView
        webView = WebView(this).apply {

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                mediaPlaybackRequiresUserGesture = false
                allowFileAccess = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportMultipleWindows(true)
                javaScriptCanOpenWindowsAutomatically = true
                cacheMode = WebSettings.LOAD_NO_CACHE
                userAgentString = settings.userAgentString.replace("; wv", "")
            }

            // Clear cache on startup to ensure we get the latest Vercel deployment and invalidate stale Service Workers
            clearCache(true)

            webViewClient = AdBlockWebViewClient(
                onPageFinishedAction = {
                    swipeRefreshLayout.isRefreshing = false
                    // Force unregister Service Worker properly and reload
                    webView.evaluateJavascript("if('serviceWorker' in navigator){navigator.serviceWorker.getRegistrations().then(function(r){if(r.length>0){Promise.all(r.map(function(sw){return sw.unregister()})).then(function(){window.location.reload(true);})}})}", null)
                },
                onNetworkErrorAction = {
                    swipeRefreshLayout.isRefreshing = false
                    swipeRefreshLayout.visibility = View.GONE
                    offlineLayout.visibility = View.VISIBLE
                }
            )

            webChromeClient = AdBlockWebChromeClient(
                activity = this@MainActivity,
                customViewContainer = FrameLayout(this@MainActivity), // placeholder, we will use our real one
                onShowCustomViewAction = { view, callback ->
                    customView = view
                    customViewCallback = callback
                    customViewContainer?.visibility = View.VISIBLE
                    if (view.parent != null) {
                        (view.parent as ViewGroup).removeView(view)
                    }
                    customViewContainer?.addView(view)
                    swipeRefreshLayout.visibility = View.GONE
                    
                    WindowInsetsControllerCompat(window, window.decorView).let { ctrl ->
                        ctrl.hide(WindowInsetsCompat.Type.systemBars())
                        ctrl.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                    }
                },
                onHideCustomViewAction = {
                    customView?.let { v -> customViewContainer?.removeView(v) }
                    customView = null
                    customViewCallback?.onCustomViewHidden()
                    customViewCallback = null
                    customViewContainer?.visibility = View.GONE
                    swipeRefreshLayout.visibility = View.VISIBLE
                    
                    WindowInsetsControllerCompat(window, window.decorView).show(WindowInsetsCompat.Type.systemBars())
                },
                onProgressChangedAction = { progress ->
                    if (progress < 100) {
                        progressBar.visibility = View.VISIBLE
                        progressBar.progress = progress
                    } else {
                        progressBar.visibility = View.GONE
                    }
                }
            )

            setDownloadListener { url, _, _, _, _ ->
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (_: Exception) { }
            }
        }

        // 4. SwipeRefreshLayout
        swipeRefreshLayout = SwipeRefreshLayout(this).apply {
            setColorSchemeColors(android.graphics.Color.parseColor("#E50914"))
            setProgressBackgroundColorSchemeColor(android.graphics.Color.parseColor("#18181b"))
            
            // Push content below status bar
            setPadding(0, getStatusBarHeight(), 0, 0)
            
            setOnRefreshListener {
                webView.reload()
            }
            addView(webView)
        }

        // 5. Fullscreen Video Container
        customViewContainer = FrameLayout(this).apply {
            visibility = View.GONE
            setBackgroundColor(android.graphics.Color.BLACK)
        }

        // Assemble Root Layout
        root.addView(swipeRefreshLayout, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        root.addView(offlineLayout, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
        root.addView(progressBar, progressParams)
        root.addView(customViewContainer, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))

        setContentView(root)

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(WEBAPP_URL)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }

    // Utility to get status bar height for margins
    @SuppressLint("InternalInsetResource", "DiscouragedApi")
    private fun getStatusBarHeight(): Int {
        var result = 0
        val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
        if (resourceId > 0) {
            result = resources.getDimensionPixelSize(resourceId)
        }
        return result
    }
}
