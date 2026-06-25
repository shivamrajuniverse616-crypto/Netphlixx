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
    val heroMovies: List<Pair<Movie, String?>> = emptyList(),
    val trendingAll: List<Movie> = emptyList(),
    val nowPlaying: List<Movie> = emptyList(),
    val upcoming: List<Movie> = emptyList(),
    val trendingTv: List<Movie> = emptyList(),
    val top10: List<Movie> = emptyList(),
    val actionMovies: List<Movie> = emptyList(),
    val sciFiMovies: List<Movie> = emptyList(),
    val comedyMovies: List<Movie> = emptyList(),
    val actionTv: List<Movie> = emptyList(),
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
                
                val action = repository.getActionMovies()
                val sciFi = repository.getSciFiMovies()
                val comedy = repository.getComedyMovies()
                val actionTv = repository.getActionTv()

                val heroMoviesList = mutableListOf<Pair<Movie, String?>>()
                for (hero in trending.take(5)) {
                    var heroLogo: String? = null
                    try {
                        val images = repository.getImages(hero.id, hero.mediaType ?: "movie")
                        heroLogo = images.logos.firstOrNull { it.iso_639_1 == "en" }?.filePath ?: images.logos.firstOrNull()?.filePath
                    } catch (e: Exception) {
                        // ignore logo fetch failure
                    }
                    heroMoviesList.add(Pair(hero, heroLogo))
                }

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    heroMovies = heroMoviesList,
                    trendingAll = trending.drop(5),
                    nowPlaying = nowPlaying,
                    upcoming = upcoming,
                    trendingTv = tv,
                    top10 = popular.take(10),
                    actionMovies = action,
                    sciFiMovies = sciFi,
                    comedyMovies = comedy,
                    actionTv = actionTv
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
