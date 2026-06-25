package com.example.netphlixx.data.network

import com.example.netphlixx.data.model.CreditsResponse
import com.example.netphlixx.data.model.Movie
import com.example.netphlixx.data.model.MovieDetails
import com.example.netphlixx.data.model.TmdbResponse
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface TmdbApi {
    @GET("trending/all/day")
    suspend fun getTrendingAll(@Query("api_key") apiKey: String): TmdbResponse<Movie>

    @GET("movie/now_playing")
    suspend fun getNowPlayingMovies(@Query("api_key") apiKey: String): TmdbResponse<Movie>

    @GET("movie/upcoming")
    suspend fun getUpcomingMovies(@Query("api_key") apiKey: String): TmdbResponse<Movie>

    @GET("trending/tv/day")
    suspend fun getTrendingTv(@Query("api_key") apiKey: String): TmdbResponse<Movie>
    
    @GET("movie/popular")
    suspend fun getPopularMovies(@Query("api_key") apiKey: String): TmdbResponse<Movie>

    @GET("discover/movie")
    suspend fun getMoviesByGenre(
        @Query("with_genres") genreId: Int,
        @Query("api_key") apiKey: String
    ): TmdbResponse<Movie>

    @GET("discover/tv")
    suspend fun getTvByGenre(
        @Query("with_genres") genreId: Int,
        @Query("api_key") apiKey: String
    ): TmdbResponse<Movie>

    @GET("movie/{movie_id}")
    suspend fun getMovieDetails(
        @Path("movie_id") movieId: Int,
        @Query("api_key") apiKey: String
    ): MovieDetails

    @GET("tv/{tv_id}")
    suspend fun getTvDetails(
        @Path("tv_id") tvId: Int,
        @Query("api_key") apiKey: String
    ): MovieDetails

    @GET("movie/{movie_id}/credits")
    suspend fun getMovieCredits(
        @Path("movie_id") movieId: Int,
        @Query("api_key") apiKey: String
    ): CreditsResponse

    @GET("tv/{tv_id}/credits")
    suspend fun getTvCredits(
        @Path("tv_id") tvId: Int,
        @Query("api_key") apiKey: String
    ): CreditsResponse

    @GET("movie/{movie_id}/similar")
    suspend fun getSimilarMovies(
        @Path("movie_id") movieId: Int,
        @Query("api_key") apiKey: String
    ): TmdbResponse<Movie>

    @GET("tv/{tv_id}/similar")
    suspend fun getSimilarTvShows(
        @Path("tv_id") tvId: Int,
        @Query("api_key") apiKey: String
    ): TmdbResponse<Movie>
    
    @GET("search/multi")
    suspend fun searchMulti(
        @Query("query") query: String,
        @Query("api_key") apiKey: String
    ): TmdbResponse<Movie>

    @GET("{media_type}/{id}/images")
    suspend fun getImages(
        @Path("media_type") mediaType: String,
        @Path("id") id: Int,
        @Query("api_key") apiKey: String
    ): com.example.netphlixx.data.model.ImagesResponse

    @GET("{media_type}/{id}/videos")
    suspend fun getVideos(
        @Path("media_type") mediaType: String,
        @Path("id") id: Int,
        @Query("api_key") apiKey: String
    ): com.example.netphlixx.data.model.VideosResponse

    @GET("movie/{movie_id}/release_dates")
    suspend fun getMovieReleaseDates(
        @Path("movie_id") movieId: Int,
        @Query("api_key") apiKey: String
    ): com.example.netphlixx.data.model.ReleaseDatesResponse

    @GET("tv/{tv_id}/content_ratings")
    suspend fun getTvContentRatings(
        @Path("tv_id") tvId: Int,
        @Query("api_key") apiKey: String
    ): com.example.netphlixx.data.model.ContentRatingsResponse
}
