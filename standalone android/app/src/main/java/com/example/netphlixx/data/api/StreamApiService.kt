package com.example.netphlixx.data.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path

data class StreamResponse(
    val sources: List<StreamSource>?
)

data class StreamSource(
    val url: String?,
    val type: String?,
    val quality: String?,
    val name: String?,
    val provider: ProviderInfo?
)

data class ProviderInfo(
    val name: String?
)

interface StreamApiService {
    @GET("v1/movies/{id}")
    suspend fun getMovieStreams(@Path("id") id: Int): StreamResponse

    @GET("v1/tv/{id}/seasons/{season}/episodes/{episode}")
    suspend fun getTvStreams(
        @Path("id") id: Int,
        @Path("season") season: Int,
        @Path("episode") episode: Int
    ): StreamResponse
}

object StreamApi {
    private const val BASE_URL = "https://core-4z5l.onrender.com/"

    val retrofitService: StreamApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(StreamApiService::class.java)
    }
}
