package com.example.netphlixx.data.repository

import com.example.netphlixx.data.network.RetrofitInstance

class TmdbRepository {
    private val api = RetrofitInstance.api
    private val apiKey = "325b947646483966de1c17a8f1320f45"

    suspend fun getTrendingAll() = api.getTrendingAll(apiKey).results
    suspend fun getNowPlayingMovies() = api.getNowPlayingMovies(apiKey).results
    suspend fun getUpcomingMovies() = api.getUpcomingMovies(apiKey).results
    suspend fun getTrendingTv() = api.getTrendingTv(apiKey).results
    suspend fun getPopularMovies() = api.getPopularMovies(apiKey).results

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
