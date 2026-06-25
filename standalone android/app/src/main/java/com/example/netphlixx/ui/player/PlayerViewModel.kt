package com.example.netphlixx.ui.player

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.netphlixx.data.model.MovieDetails
import com.example.netphlixx.data.model.StreamSource
import com.example.netphlixx.data.repository.TmdbRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class PlayerUiState(
    val isLoading: Boolean = false,
    val mediaDetails: MovieDetails? = null,
    val fastStreams: List<StreamSource> = emptyList(),
    val nativeStreamUrl: String? = null,
    val nativeStreamType: String? = "m3u8",
    val error: String? = null,
    
    // Server switching
    val selectedServer: String = "Fast",
    val iframeUrl: String? = null,
    
    // TV Show logic
    val selectedSeason: Int = 1,
    val selectedEpisode: Int = 1,
    val totalSeasons: Int = 1
)

class PlayerViewModel : ViewModel() {
    private val repository = TmdbRepository()

    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState: StateFlow<PlayerUiState> = _uiState.asStateFlow()

    private var mediaId: Int = 0
    private var mediaType: String = "movie"

    fun loadMedia(id: Int, type: String) {
        mediaId = id
        mediaType = type
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            try {
                // 1. Fetch TMDB Details
                val details = if (type == "tv") {
                    repository.getTvDetails(id)
                } else {
                    repository.getMovieDetails(id)
                }

                _uiState.update { 
                    it.copy(
                        mediaDetails = details,
                        totalSeasons = details.numberOfSeasons ?: 1
                    ) 
                }

                // 2. Fetch Streams
                fetchStreams()
            } catch (e: Exception) {
                _uiState.update { it.copy(isLoading = false, error = e.message) }
            }
        }
    }

    private suspend fun fetchStreams() {
        val currentState = _uiState.value
        try {
            _uiState.update { it.copy(isLoading = true) }
            
            val response = if (mediaType == "tv") {
                repository.getTvStreams(mediaId, currentState.selectedSeason, currentState.selectedEpisode)
            } else {
                repository.getMovieStreams(mediaId)
            }

            if (response.success && !response.streams.isNullOrEmpty()) {
                val streams = response.streams
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        fastStreams = streams,
                        nativeStreamUrl = streams.firstOrNull()?.url,
                        nativeStreamType = streams.firstOrNull()?.type ?: "m3u8"
                    )
                }
            } else {
                _uiState.update { it.copy(isLoading = false, error = "No streams found on Fast API") }
            }
        } catch (e: Exception) {
            _uiState.update { it.copy(isLoading = false, error = "Error fetching streams: ${e.message}") }
        }
        
        updateIframeUrl()
    }

    fun setServer(serverName: String) {
        _uiState.update { it.copy(selectedServer = serverName) }
        updateIframeUrl()
    }

    fun setEpisode(season: Int, episode: Int) {
        _uiState.update { 
            it.copy(selectedSeason = season, selectedEpisode = episode)
        }
        viewModelScope.launch {
            fetchStreams()
        }
    }

    private fun updateIframeUrl() {
        val state = _uiState.value
        val server = state.selectedServer
        val id = mediaId
        val s = state.selectedSeason
        val e = state.selectedEpisode

        val url = if (mediaType == "tv") {
            when (server) {
                "VidAPI" -> "https://vaplayer.ru/embed/tv/$id/$s/$e?autoplay=1"
                "VidLink" -> "https://vidlink.pro/tv/$id/$s/$e"
                "RGShows" -> "https://rgshows.me/player/tv/api1/index.html?id=$id&s=$s&e=$e"
                "SmashyStream" -> "https://embed.smashystream.com/playere.php?tmdb=$id&season=$s&ep=$e"
                "SuperEmbed" -> "https://multiembed.mov/?video_id=$id&tmdb=1&s=$s&e=$e"
                "Peachify" -> "https://peachify.top/embed/tv/$id/$s/$e"
                else -> null
            }
        } else {
            when (server) {
                "VidAPI" -> "https://vaplayer.ru/embed/movie/$id?autoplay=1"
                "VidLink" -> "https://vidlink.pro/movie/$id"
                "RGShows" -> "https://rgshows.me/player/movies/api1/index.html?id=$id"
                "SmashyStream" -> "https://embed.smashystream.com/playere.php?tmdb=$id"
                "SuperEmbed" -> "https://multiembed.mov/?video_id=$id&tmdb=1"
                "Peachify" -> "https://peachify.top/embed/movie/$id"
                else -> null
            }
        }

        _uiState.update { it.copy(iframeUrl = url) }
    }
}
