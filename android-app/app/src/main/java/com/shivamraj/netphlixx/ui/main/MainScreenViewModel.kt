package com.shivamraj.netphlixx.ui.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shivamraj.netphlixx.data.DataRepository
import com.shivamraj.netphlixx.data.Movie
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class MainScreenViewModel @Inject constructor(
    private val dataRepository: DataRepository
) : ViewModel() {
    val uiState: StateFlow<MainScreenUiState> = dataRepository.trendingMovies
        .map<List<Movie>, MainScreenUiState> { MainScreenUiState.Success(it) }
        .catch { emit(MainScreenUiState.Error(it)) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), MainScreenUiState.Loading)
}

sealed interface MainScreenUiState {
  object Loading : MainScreenUiState
  data class Error(val throwable: Throwable) : MainScreenUiState
  data class Success(val trendingMovies: List<Movie>) : MainScreenUiState
}
