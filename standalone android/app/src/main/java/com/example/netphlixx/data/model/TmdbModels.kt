package com.example.netphlixx.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class TmdbResponse<T>(
    val page: Int = 1,
    val results: List<T> = emptyList(),
    @SerialName("total_pages") val totalPages: Int = 1,
    @SerialName("total_results") val totalResults: Int = 0
)

@Serializable
data class Movie(
    val id: Int,
    val title: String? = null,
    val name: String? = null,
    val overview: String? = null,
    @SerialName("poster_path") val posterPath: String? = null,
    @SerialName("backdrop_path") val backdropPath: String? = null,
    @SerialName("release_date") val releaseDate: String? = null,
    @SerialName("first_air_date") val firstAirDate: String? = null,
    @SerialName("vote_average") val voteAverage: Double? = null,
    @SerialName("media_type") val mediaType: String? = null,
    val runtime: Int? = null,
    @SerialName("episode_run_time") val episodeRunTime: List<Int>? = null
) {
    val displayTitle: String get() = title ?: name ?: "Unknown"
    val releaseYear: String get() = (releaseDate ?: firstAirDate)?.take(4) ?: ""
}

@Serializable
data class MovieDetails(
    val id: Int,
    val title: String? = null,
    val name: String? = null,
    val overview: String? = null,
    @SerialName("poster_path") val posterPath: String? = null,
    @SerialName("backdrop_path") val backdropPath: String? = null,
    @SerialName("release_date") val releaseDate: String? = null,
    @SerialName("first_air_date") val firstAirDate: String? = null,
    val runtime: Int? = null,
    val genres: List<Genre> = emptyList(),
    @SerialName("production_companies") val productionCompanies: List<ProductionCompany> = emptyList()
) {
    val displayTitle: String get() = title ?: name ?: "Unknown"
    val releaseYear: String get() = (releaseDate ?: firstAirDate)?.take(4) ?: ""
}

@Serializable
data class Genre(
    val id: Int,
    val name: String
)

@Serializable
data class ProductionCompany(
    val id: Int,
    val name: String,
    @SerialName("logo_path") val logoPath: String? = null
)

@Serializable
data class CreditsResponse(
    val id: Int,
    val cast: List<CastMember> = emptyList(),
    val crew: List<CrewMember> = emptyList()
)

@Serializable
data class CastMember(
    val id: Int,
    val name: String,
    val character: String? = null,
    @SerialName("profile_path") val profilePath: String? = null
)

@Serializable
data class CrewMember(
    val id: Int,
    val name: String,
    val job: String,
    @SerialName("profile_path") val profilePath: String? = null
)

@Serializable
data class ImagesResponse(
    val id: Int,
    val logos: List<ImageLogo> = emptyList()
)

@Serializable
data class ImageLogo(
    @SerialName("aspect_ratio") val aspectRatio: Double,
    @SerialName("file_path") val filePath: String,
    @SerialName("iso_639_1") val iso_639_1: String? = null
)

@Serializable
data class VideosResponse(
    val id: Int,
    val results: List<Video> = emptyList()
)

@Serializable
data class Video(
    val id: String,
    val key: String,
    val name: String,
    val site: String,
    val type: String
)

@Serializable
data class ReleaseDatesResponse(
    val id: Int,
    val results: List<ReleaseDateItem> = emptyList()
)

@Serializable
data class ReleaseDateItem(
    @SerialName("iso_3166_1") val iso_3166_1: String,
    @SerialName("release_dates") val releaseDates: List<ReleaseDate> = emptyList()
)

@Serializable
data class ReleaseDate(
    val certification: String
)

@Serializable
data class ContentRatingsResponse(
    val id: Int,
    val results: List<ContentRating> = emptyList()
)

@Serializable
data class ContentRating(
    @SerialName("iso_3166_1") val iso_3166_1: String,
    val rating: String
)
