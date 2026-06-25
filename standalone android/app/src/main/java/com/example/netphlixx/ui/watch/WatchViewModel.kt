package com.example.netphlixx.ui.watch

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.netphlixx.data.api.StreamApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

data class WatchUiState(
    val selectedProvider: String = "VSrcSU",
    val isAdBlockEnabled: Boolean = true,
    val nativeStreamUrl: String? = null,
    val isLoadingNative: Boolean = false,
    val error: String? = null
)

val streamingProviders = listOf(
    "Fast Player (Native)",
    "VidAPI",
    "VidLink",
    "RGShows",
    "SmashyStream",
    "VidSrcRU",
    "VSrcSU",
    "SuperEmbed",
    "2Embed",
    "Peachify"
)

class WatchViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(WatchUiState())
    val uiState: StateFlow<WatchUiState> = _uiState

    fun setAdBlockEnabled(enabled: Boolean) {
        _uiState.value = _uiState.value.copy(isAdBlockEnabled = enabled)
    }

    fun selectProvider(provider: String, id: Int, type: String, season: Int, episode: Int) {
        _uiState.value = _uiState.value.copy(selectedProvider = provider)
        if (provider == "Fast Player (Native)") {
            fetchNativeStream(id, type, season, episode)
        }
    }

    private fun fetchNativeStream(id: Int, type: String, season: Int, episode: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingNative = true, error = null)
            try {
                val response = if (type == "movie") {
                    StreamApi.retrofitService.getMovieStreams(id)
                } else {
                    StreamApi.retrofitService.getTvStreams(id, season, episode)
                }
                
                val url = response.sources?.firstOrNull()?.url
                if (url != null) {
                    _uiState.value = _uiState.value.copy(nativeStreamUrl = url, isLoadingNative = false)
                } else {
                    _uiState.value = _uiState.value.copy(error = "No native stream found", isLoadingNative = false)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(error = e.message ?: "Unknown error", isLoadingNative = false)
            }
        }
    }
}
