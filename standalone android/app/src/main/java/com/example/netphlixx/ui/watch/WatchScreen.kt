package com.example.netphlixx.ui.watch

import android.annotation.SuppressLint
import android.content.pm.ActivityInfo
import android.view.ViewGroup
import android.webkit.WebSettings
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WatchScreen(
    id: Int,
    type: String, // "movie" or "tv"
    season: Int = 1,
    episode: Int = 1,
    viewModel: WatchViewModel = viewModel()
) {
    val context = LocalContext.current
    val activity = context as? ComponentActivity
    val uiState by viewModel.uiState.collectAsState()

    var showSettings by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    DisposableEffect(Unit) {
        // Enter landscape and hide system bars
        activity?.let {
            it.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_USER_LANDSCAPE
            WindowInsetsControllerCompat(it.window, it.window.decorView).apply {
                hide(WindowInsetsCompat.Type.systemBars())
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        }

        onDispose {
            // Restore portrait and show system bars
            activity?.let {
                it.requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_USER
                WindowInsetsControllerCompat(it.window, it.window.decorView).apply {
                    show(WindowInsetsCompat.Type.systemBars())
                }
            }
        }
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        if (uiState.selectedProvider == "Fast Player (Native)") {
            if (uiState.isLoadingNative) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
            } else if (uiState.error != null) {
                Text(uiState.error!!, color = Color.Red, modifier = Modifier.align(Alignment.Center))
            } else {
                val exoPlayer = remember {
                    ExoPlayer.Builder(context).build().apply { playWhenReady = true }
                }
                DisposableEffect(uiState.nativeStreamUrl) {
                    uiState.nativeStreamUrl?.let {
                        exoPlayer.setMediaItem(MediaItem.fromUri(it))
                        exoPlayer.prepare()
                    }
                    onDispose { }
                }
                DisposableEffect(Unit) { onDispose { exoPlayer.release() } }

                AndroidView(
                    factory = { ctx ->
                        PlayerView(ctx).apply {
                            player = exoPlayer
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                        }
                    },
                    modifier = Modifier.fillMaxSize()
                )
            }
        } else {
            val url = getIframeUrl(uiState.selectedProvider, id, type, season, episode)
            val webViewClient = remember(uiState.isAdBlockEnabled) {
                AdBlockWebViewClient(
                    onPageFinishedAction = {},
                    onNetworkErrorAction = {},
                    isAdBlockEnabled = uiState.isAdBlockEnabled
                )
            }
            val webChromeClient = remember(uiState.isAdBlockEnabled) {
                AdBlockWebChromeClient(
                    onShowCustomViewAction = { _, _ -> },
                    onHideCustomViewAction = {},
                    onProgressChangedAction = {},
                    isAdBlockEnabled = uiState.isAdBlockEnabled
                )
            }

            AndroidView(
                factory = { ctx ->
                    WebView(ctx).apply {
                        layoutParams = ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                        setBackgroundColor(android.graphics.Color.BLACK)
                        
                        settings.apply {
                            javaScriptEnabled = true
                            domStorageEnabled = true
                            mediaPlaybackRequiresUserGesture = false
                            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            setSupportMultipleWindows(false)
                        }
                        
                        this.webViewClient = webViewClient
                        this.webChromeClient = webChromeClient
                        loadUrl(url)
                    }
                },
                update = { webView ->
                    // Only reload if URL changes, but the AndroidView handles this if we pass url as a key
                    // For now, it will recreate if provider changes because of AndroidView behavior
                    webView.webViewClient = webViewClient
                    webView.webChromeClient = webChromeClient
                    if (webView.url != url) {
                        webView.loadUrl(url)
                    }
                },
                modifier = Modifier.fillMaxSize()
            )
        }

        // Settings Button Overlay
        IconButton(
            onClick = { showSettings = true },
            modifier = Modifier.align(Alignment.TopEnd).padding(16.dp).background(Color.Black.copy(alpha = 0.5f), shape = MaterialTheme.shapes.small)
        ) {
            Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color.White)
        }

        if (showSettings) {
            ModalBottomSheet(
                onDismissRequest = { showSettings = false },
                sheetState = sheetState
            ) {
                Column(modifier = Modifier.padding(16.dp).fillMaxWidth()) {
                    Text("Streaming Settings", style = MaterialTheme.typography.titleLarge)
                    Spacer(modifier = Modifier.height(16.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text("AdBlocker (Recommended for IFrames)", modifier = Modifier.weight(1f))
                        Switch(
                            checked = uiState.isAdBlockEnabled,
                            onCheckedChange = { viewModel.setAdBlockEnabled(it) }
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                    Text("Select Provider", style = MaterialTheme.typography.titleMedium)
                    Spacer(modifier = Modifier.height(8.dp))

                    LazyColumn(modifier = Modifier.fillMaxHeight(0.5f)) {
                        items(streamingProviders) { provider ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        viewModel.selectProvider(provider, id, type, season, episode)
                                        showSettings = false
                                    }
                                    .padding(12.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = uiState.selectedProvider == provider,
                                    onClick = null
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(provider)
                            }
                        }
                    }
                }
            }
        }
    }
}

fun getIframeUrl(provider: String, id: Int, type: String, season: Int, episode: Int): String {
    return when(provider) {
        "VidAPI" -> if(type == "movie") "https://vaplayer.ru/embed/movie/$id?autoplay=1" else "https://vaplayer.ru/embed/tv/$id/$season/$episode?autoplay=1"
        "VidLink" -> if(type == "movie") "https://vidlink.pro/movie/$id" else "https://vidlink.pro/tv/$id/$season/$episode"
        "RGShows" -> if(type == "movie") "https://rgshows.me/player/movies/api1/index.html?id=$id" else "https://rgshows.me/player/tv/api1/index.html?id=$id&s=$season&e=$episode"
        "SmashyStream" -> if(type == "movie") "https://embed.smashystream.com/playere.php?tmdb=$id" else "https://embed.smashystream.com/playere.php?tmdb=$id&season=$season&ep=$episode"
        "VidSrcRU" -> if(type == "movie") "https://vidsrc.ru/movie/$id" else "https://vidsrc.ru/tv/$id/$season/$episode"
        "VSrcSU" -> if(type == "movie") "https://vsrc.su/embed/movie?tmdb=$id" else "https://vsrc.su/embed/tv?tmdb=$id&season=$season&episode=$episode"
        "SuperEmbed" -> if(type == "movie") "https://multiembed.mov/?video_id=$id&tmdb=1" else "https://multiembed.mov/?video_id=$id&tmdb=1&s=$season&e=$episode"
        "2Embed" -> if(type == "movie") "https://www.2embed.cc/embed/$id" else "https://www.2embed.cc/embedtv/$id&s=$season&e=$episode"
        "Peachify" -> if(type == "movie") "https://peachify.top/embed/movie/$id" else "https://peachify.top/embed/tv/$id/$season/$episode"
        else -> if(type == "movie") "https://vsrc.su/embed/movie?tmdb=$id" else "https://vsrc.su/embed/tv?tmdb=$id&season=$season&episode=$episode"
    }
}
