package com.shivamraj.netphlixx.ui.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.graphics.drawable.toBitmap
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.palette.graphics.Palette
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.shivamraj.netphlixx.data.DataRepository
import com.shivamraj.netphlixx.data.Movie
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DetailsViewModel @Inject constructor(
    private val dataRepository: DataRepository
) : ViewModel() {
    private val _movie = MutableStateFlow<Movie?>(null)
    val movie: StateFlow<Movie?> = _movie

    fun loadMovie(id: String) {
        viewModelScope.launch {
            // Simplified loading from our hardcoded repo
            dataRepository.trendingMovies.collect { movies ->
                _movie.value = movies.find { it.id == id }
            }
        }
    }
}

@Composable
fun DetailsScreen(
    movieId: String,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: DetailsViewModel = hiltViewModel()
) {
    LaunchedEffect(movieId) {
        viewModel.loadMovie(movieId)
    }
    
    val movie by viewModel.movie.collectAsState()
    var dominantColor by remember { mutableStateOf(Color.DarkGray) }

    if (movie != null) {
        val m = movie!!
        
        // Background gradient based on palette
        val gradient = Brush.verticalGradient(
            colors = listOf(dominantColor, MaterialTheme.colorScheme.background),
            startY = 0f,
            endY = 1000f
        )
        
        Box(modifier = modifier.fillMaxSize().background(gradient)) {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(m.backdropUrl)
                        .crossfade(true)
                        .allowHardware(false) // Needed for Palette
                        .build(),
                    contentDescription = m.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxWidth().height(250.dp),
                    onSuccess = { result ->
                        Palette.from(result.result.drawable.toBitmap()).generate { palette ->
                            palette?.dominantSwatch?.rgb?.let { colorValue ->
                                dominantColor = Color(colorValue).copy(alpha = 0.8f)
                            }
                        }
                    }
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = m.title,
                    style = MaterialTheme.typography.headlineLarge,
                    color = Color.White,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = m.description,
                    style = MaterialTheme.typography.bodyLarge,
                    color = Color.LightGray,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Button(
                    onClick = { /* Play */ },
                    colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.primary),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp)
                ) {
                    Text("Play", color = Color.White)
                }
            }

            // Back button overlay
            IconButton(
                onClick = onBackClick,
                modifier = Modifier
                    .padding(top = 32.dp, start = 16.dp)
                    .background(Color.Black.copy(alpha = 0.5f), shape = androidx.compose.foundation.shape.CircleShape)
            ) {
                Text("<-", color = Color.White)
            }
        }
    } else {
        CircularProgressIndicator(modifier = modifier)
    }
}
