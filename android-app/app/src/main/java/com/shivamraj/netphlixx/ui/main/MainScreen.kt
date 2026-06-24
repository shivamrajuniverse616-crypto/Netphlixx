package com.shivamraj.netphlixx.ui.main

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation3.runtime.NavKey
import coil.compose.AsyncImage
import com.shivamraj.netphlixx.Details
import com.shivamraj.netphlixx.data.Movie

@Composable
fun MainScreen(
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = hiltViewModel()
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    
    when (state) {
        is MainScreenUiState.Loading -> {
            CircularProgressIndicator(modifier = modifier)
        }
        is MainScreenUiState.Success -> {
            val movies = (state as MainScreenUiState.Success).trendingMovies
            HomeScreenContent(movies = movies, modifier = modifier, onItemClick = onItemClick)
        }
        is MainScreenUiState.Error -> {
            Text("Error loading data", modifier = modifier)
        }
    }
}

@Composable
fun HomeScreenContent(
    movies: List<Movie>,
    onItemClick: (NavKey) -> Unit,
    modifier: Modifier = Modifier
) {
    val heroMovie = movies.firstOrNull()
    
    Column(modifier = modifier.fillMaxSize()) {
        // Hero Section
        if (heroMovie != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(400.dp)
                    .clickable { onItemClick(Details(heroMovie.id)) }
            ) {
                AsyncImage(
                    model = heroMovie.posterUrl,
                    contentDescription = "Featured Movie",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp),
                    contentAlignment = androidx.compose.ui.Alignment.BottomCenter
                ) {
                    Text(
                        text = heroMovie.title,
                        style = MaterialTheme.typography.displayMedium,
                        color = androidx.compose.ui.graphics.Color.White
                    )
                }
            }
        }
    
        Text(
            text = "Trending Now",
            style = MaterialTheme.typography.titleLarge,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(16.dp)
        )
        
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(movies.drop(1), key = { it.id }) { movie ->
                MoviePoster(movie = movie, onClick = { onItemClick(Details(movie.id)) })
            }
        }
    }
}

@Composable
fun MoviePoster(movie: Movie, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .height(180.dp)
            .clickable(onClick = onClick)
    ) {
        AsyncImage(
            model = movie.posterUrl,
            contentDescription = movie.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
    }
}
