package com.example.netphlixx.ui.player

import android.annotation.SuppressLint
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import java.io.ByteArrayInputStream
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PlayerScreen(
    mediaId: Int,
    mediaType: String,
    onBack: () -> Unit,
    viewModel: PlayerViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(mediaId, mediaType) {
        viewModel.loadMedia(mediaId, mediaType)
    }

    val availableServers = listOf("Fast", "VidAPI", "SuperEmbed", "VidLink", "RGShows", "SmashyStream", "Peachify")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(uiState.mediaDetails?.title ?: uiState.mediaDetails?.name ?: "Loading...") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Black,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        containerColor = Color.Black
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
        ) {
            // Video Player Section
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .background(Color.Black)
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = Color.Red
                    )
                } else if (uiState.selectedServer == "Fast" && uiState.nativeStreamUrl != null) {
                    NativeVideoPlayer(
                        videoUrl = uiState.nativeStreamUrl!!,
                        modifier = Modifier.fillMaxSize()
                    )
                } else if (uiState.iframeUrl != null) {
                    IframeVideoPlayer(
                        url = uiState.iframeUrl!!,
                        modifier = Modifier.fillMaxSize()
                    )
                } else {
                    Text(
                        text = uiState.error ?: "Stream not available.",
                        color = Color.White,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Server Selection
            Text(
                text = "Select Server",
                color = Color.White,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
            )
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(availableServers) { server ->
                    ServerPill(
                        text = server,
                        isSelected = uiState.selectedServer == server,
                        onClick = { viewModel.setServer(server) }
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // TV Show Episodes UI
            if (mediaType == "tv" && uiState.mediaDetails != null) {
                Text(
                    text = "Seasons & Episodes",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                // Simple Season/Episode toggles for demonstration
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Previous Episode Button
                    Button(
                        onClick = { 
                            if (uiState.selectedEpisode > 1) {
                                viewModel.setEpisode(uiState.selectedSeason, uiState.selectedEpisode - 1)
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray)
                    ) {
                        Text("Prev Ep")
                    }

                    Text(
                        text = "S${uiState.selectedSeason} E${uiState.selectedEpisode}",
                        color = Color.White,
                        modifier = Modifier.align(Alignment.CenterVertically)
                    )

                    // Next Episode Button
                    Button(
                        onClick = { 
                            viewModel.setEpisode(uiState.selectedSeason, uiState.selectedEpisode + 1)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                    ) {
                        Text("Next Ep")
                    }
                }
            }
        }
    }
}

@Composable
fun ServerPill(text: String, isSelected: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(if (isSelected) Color.Red else Color.DarkGray)
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = text,
            color = Color.White,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun IframeVideoPlayer(url: String, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.mediaPlaybackRequiresUserGesture = false
                
                // Inject Popup Blocker
                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        val requestUrl = request?.url?.toString() ?: return false
                        val allowedDomains = listOf("vaplayer", "vidlink", "rgshows", "smashystream", "multiembed", "peachify", "vsrc")
                        val isAllowed = allowedDomains.any { requestUrl.contains(it) }
                        
                        // Block navigation if it's not one of our known video providers
                        return !isAllowed
                    }

                    override fun shouldInterceptRequest(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): WebResourceResponse? {
                        val requestUrl = request?.url?.toString() ?: ""
                        // Basic Ad blocking by matching known ad domains
                        val adDomains = listOf("ads.", "tracking.", "popads.", "onclickads.", "betting", "casino")
                        val isAd = adDomains.any { requestUrl.contains(it) }
                        
                        if (isAd) {
                            val emptyStream = ByteArrayInputStream(ByteArray(0))
                            return WebResourceResponse("text/plain", "UTF-8", emptyStream)
                        }
                        return super.shouldInterceptRequest(view, request)
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        // Disable window.open to prevent popups on click
                        view?.evaluateJavascript("window.open = function() {};", null)
                    }
                }
                
                webChromeClient = WebChromeClient()
                setBackgroundColor(android.graphics.Color.BLACK)
                loadUrl(url)
            }
        },
        update = { webView ->
            webView.loadUrl(url)
        },
        modifier = modifier
    )
}
