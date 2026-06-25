package com.example.netphlixx.data.repository

import com.example.netphlixx.data.network.RetrofitInstance
import com.example.netphlixx.data.network.TmdbApi
import com.example.netphlixx.data.network.VideoApi
import retrofit2.Retrofit
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.converter.kotlinx.serialization.asConverterFactory

class TmdbRepository {
    private val apiKey = "325b947646483966de1c17a8f1320f45"

    private val json = Json { ignoreUnknownKeys = true; coerceInputValues = true }
    private val converterFactory = json.asConverterFactory("application/json".toMediaType())

    private val videoClient = OkHttpClient.Builder().addInterceptor { chain ->
        val request = chain.request().newBuilder()
            .addHeader("Origin", "https://movie-scraper-gilt.vercel.app")
            .addHeader("Referer", "https://movie-scraper-gilt.vercel.app/")
            .build()
        chain.proceed(request)
    }.build()

    private val api: TmdbApi = Retrofit.Builder()
        .baseUrl("https://api.themoviedb.org/3/")
        .addConverterFactory(converterFactory)
        .build()
        .create(TmdbApi::class.java)

    private val videoApi: VideoApi = Retrofit.Builder()
        .baseUrl("https://movie-scraper-gilt.vercel.app/")
        .client(videoClient)
        .addConverterFactory(converterFactory)
        .build()
        .create(VideoApi::class.java)

    suspend fun getTrendingAll() = api.getTrendingAll(apiKey).results
    suspend fun getNowPlayingMovies() = api.getNowPlayingMovies(apiKey).results
    suspend fun getUpcomingMovies() = api.getUpcomingMovies(apiKey).results
    suspend fun getTrendingTv() = api.getTrendingTv(apiKey).results

    suspend fun getMovieStreams(tmdbId: Int) = videoApi.getMovieStreams(tmdbId)
    suspend fun getTvStreams(tmdbId: Int, season: Int, episode: Int) = videoApi.getTvStreams(tmdbId, season, episode)
    suspend fun getPopularMovies() = api.getPopularMovies(apiKey).results
    
    suspend fun getActionMovies() = api.getMoviesByGenre(28, apiKey).results
    suspend fun getSciFiMovies() = api.getMoviesByGenre(878, apiKey).results
    suspend fun getComedyMovies() = api.getMoviesByGenre(35, apiKey).results

    suspend fun getActionTv() = api.getTvByGenre(10759, apiKey).results
    suspend fun getSciFiTv() = api.getTvByGenre(10765, apiKey).results
    suspend fun getComedyTv() = api.getTvByGenre(35, apiKey).results

    suspend fun getMovieDetails(id: Int) = api.getMovieDetails(id, apiKey)
    suspend fun getTvDetails(id: Int) = api.getTvDetails(id, apiKey)
    
    suspend fun getMovieCredits(id: Int) = api.getMovieCredits(id, apiKey)
    suspend fun getTvCredits(id: Int) = api.getTvCredits(id, apiKey)
    
    suspend fun getSimilarMovies(id: Int) = api.getSimilarMovies(id, apiKey).results
    suspend fun getSimilarTvShows(id: Int) = api.getSimilarTvShows(id, apiKey).results
    
    suspend fun search(query: String) = api.searchMulti(query, apiKey).results

    suspend fun getImages(id: Int, mediaType: String) = api.getImages(mediaType, id, apiKey)
    suspend fun getVideos(id: Int, mediaType: String) = api.getVideos(mediaType, id, apiKey)
    suspend fun getMovieReleaseDates(id: Int) = api.getMovieReleaseDates(id, apiKey)
    suspend fun getTvContentRatings(id: Int) = api.getTvContentRatings(id, apiKey)
}
