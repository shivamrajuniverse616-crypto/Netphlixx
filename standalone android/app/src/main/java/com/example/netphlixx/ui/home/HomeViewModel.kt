package com.example.netphlixx.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.netphlixx.data.model.Movie
import com.example.netphlixx.data.repository.TmdbRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val heroMovie: Movie? = null,
    val heroLogoUrl: String? = null,
    val trendingAll: List<Movie> = emptyList(),
    val nowPlaying: List<Movie> = emptyList(),
    val upcoming: List<Movie> = emptyList(),
    val trendingTv: List<Movie> = emptyList(),
    val top10: List<Movie> = emptyList(),
    val error: String? = null
)

class HomeViewModel : ViewModel() {
    private val repository = TmdbRepository()

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
                
                val trending = repository.getTrendingAll()
                val nowPlaying = repository.getNowPlayingMovies()
                val upcoming = repository.getUpcomingMovies()
                val tv = repository.getTrendingTv()
                val popular = repository.getPopularMovies()

                val hero = trending.firstOrNull()
                var heroLogo: String? = null
                if (hero != null) {
                    try {
                        val images = repository.getImages(hero.id, hero.mediaType ?: "movie")
                        heroLogo = images.logos.firstOrNull { it.iso_639_1 == "en" }?.filePath ?: images.logos.firstOrNull()?.filePath
                    } catch (e: Exception) {
                        // ignore logo fetch failure
                    }
                }

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    heroMovie = hero,
                    heroLogoUrl = heroLogo,
                    trendingAll = trending.drop(1),
                    nowPlaying = nowPlaying,
                    upcoming = upcoming,
                    trendingTv = tv,
                    top10 = popular.take(10)
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "An unknown error occurred"
                )
            }
        }
    }
}
