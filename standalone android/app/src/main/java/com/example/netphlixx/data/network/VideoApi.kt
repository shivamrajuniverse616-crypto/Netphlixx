package com.example.netphlixx.data.network

import com.example.netphlixx.data.model.StreamResponse
import retrofit2.http.GET
import retrofit2.http.Query

interface VideoApi {
    
    // Movie Streams
    @GET("api")
    suspend fun getMovieStreams(
        @Query("tmdb") tmdbId: Int
    ): StreamResponse

    // TV Show Streams
    @GET("api")
    suspend fun getTvStreams(
        @Query("tmdb") tmdbId: Int,
        @Query("s") season: Int,
        @Query("e") episode: Int
    ): StreamResponse
}
