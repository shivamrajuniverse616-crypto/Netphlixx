package com.example.netphlixx.ui.details

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.netphlixx.data.model.CastMember
import com.example.netphlixx.data.model.Movie
import com.example.netphlixx.data.model.MovieDetails
import com.example.netphlixx.data.repository.TmdbRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

import com.example.netphlixx.data.model.CrewMember
import com.example.netphlixx.data.model.Video

data class DetailsUiState(
    val isLoading: Boolean = true,
    val details: MovieDetails? = null,
    val logoUrl: String? = null,
    val ageRating: String? = null,
    val director: CrewMember? = null,
    val trailer: Video? = null,
    val cast: List<CastMember> = emptyList(),
    val similar: List<Movie> = emptyList(),
    val error: String? = null
)

class DetailsViewModel(
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val repository = TmdbRepository()

    private val mediaId: Int = checkNotNull(savedStateHandle["id"])
    private val mediaType: String = checkNotNull(savedStateHandle["type"])

    private val _uiState = MutableStateFlow(DetailsUiState())
    val uiState: StateFlow<DetailsUiState> = _uiState.asStateFlow()

    init {
        loadDetails()
    }

    private fun loadDetails() {
        viewModelScope.launch {
            try {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)

                val details = if (mediaType == "movie") repository.getMovieDetails(mediaId) else repository.getTvDetails(mediaId)
                val credits = if (mediaType == "movie") repository.getMovieCredits(mediaId) else repository.getTvCredits(mediaId)
                val similar = if (mediaType == "movie") repository.getSimilarMovies(mediaId) else repository.getSimilarTvShows(mediaId)

                var logoUrl: String? = null
                var trailer: Video? = null
                var ageRating: String? = null

                try {
                    val images = repository.getImages(mediaId, mediaType)
                    logoUrl = images.logos.firstOrNull { it.iso_639_1 == "en" }?.filePath ?: images.logos.firstOrNull()?.filePath
                } catch (e: Exception) {}

                try {
                    val videos = repository.getVideos(mediaId, mediaType).results
                    trailer = videos.firstOrNull { it.type == "Trailer" && it.site == "YouTube" } ?: videos.firstOrNull { it.site == "YouTube" }
                } catch (e: Exception) {}

                try {
                    if (mediaType == "movie") {
                        val releases = repository.getMovieReleaseDates(mediaId).results
                        val usRelease = releases.firstOrNull { it.iso_3166_1 == "US" }
                        ageRating = usRelease?.releaseDates?.firstOrNull { it.certification.isNotEmpty() }?.certification
                    } else {
                        val ratings = repository.getTvContentRatings(mediaId).results
                        val usRating = ratings.firstOrNull { it.iso_3166_1 == "US" }
                        ageRating = usRating?.rating
                    }
                } catch (e: Exception) {}

                val director = credits.crew.firstOrNull { it.job == "Director" }

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    details = details,
                    logoUrl = logoUrl,
                    ageRating = ageRating,
                    director = director,
                    trailer = trailer,
                    cast = credits.cast,
                    similar = similar
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
