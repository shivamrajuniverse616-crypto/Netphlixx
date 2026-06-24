package com.shivamraj.netphlixx.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

interface DataRepository {
  val trendingMovies: Flow<List<Movie>>
  val popularMovies: Flow<List<Movie>>
}

class DefaultDataRepository @Inject constructor() : DataRepository {
  override val trendingMovies: Flow<List<Movie>> = flow {
      emit(listOf(
          Movie("1", "Inception", "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", "A thief who steals corporate secrets through the use of dream-sharing technology."),
          Movie("2", "Interstellar", "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", "https://image.tmdb.org/t/p/w1280/pbrkL804c8yAv3zBZR4QPEafpAR.jpg", "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival."),
          Movie("3", "The Dark Knight", "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", "https://image.tmdb.org/t/p/w1280/dqK9Hag1054tghRQSqLSfrkvQnA.jpg", "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...")
      ))
  }
  
  override val popularMovies: Flow<List<Movie>> = flow {
      emit(listOf(
          Movie("4", "Avatar", "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", "https://image.tmdb.org/t/p/w1280/vL5LR6WdxWPjUU53VDZONuBCHg9.jpg", "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora...")
      ))
  }
}
