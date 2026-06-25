package com.example.netphlixx.ui.home

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.netphlixx.data.model.Movie
import com.example.netphlixx.ui.components.MovieCard

@Composable
fun HomeScreen(
    onMovieClick: (Int, String) -> Unit,
    viewModel: HomeViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val scrollState = rememberScrollState()

    if (uiState.isLoading) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
        }
        return
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        AnimatedVisibility(
            visible = !uiState.isLoading,
            enter = fadeIn()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(scrollState)
            ) {
                // Hero Section
                uiState.heroMovie?.let { hero ->
                    HeroBanner(
                        movie = hero,
                        logoUrl = uiState.heroLogoUrl,
                        scrollValue = scrollState.value,
                        onPlayClick = { onMovieClick(hero.id, hero.mediaType ?: "movie") }
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Rows
                MovieRow(title = "Trending Now", movies = uiState.trendingAll, onMovieClick = onMovieClick)
                MovieRow(title = "Now Playing", movies = uiState.nowPlaying, onMovieClick = onMovieClick)
                Top10Row(title = "TOP 10\nSHOWS TODAY", movies = uiState.top10, onMovieClick = onMovieClick)
                MovieRow(title = "Upcoming", movies = uiState.upcoming, onMovieClick = onMovieClick)
                MovieRow(title = "Trending TV Shows", movies = uiState.trendingTv, onMovieClick = onMovieClick)
                
                Spacer(modifier = Modifier.height(32.dp)) // bottom padding
            }
        }

        // Top App Bar "NETPHLIX"
        TopAppBarHeader(scrollValue = scrollState.value)
    }
}

@Composable
fun TopAppBarHeader(scrollValue: Int) {
    // Make the header background slightly opaque as you scroll
    val alpha = (scrollValue / 500f).coerceIn(0f, 0.9f)
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.Black.copy(alpha = alpha))
            .padding(horizontal = 16.dp, vertical = 24.dp), // add padding to account for status bar
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "NETPHLIX",
            fontSize = 24.sp,
            fontWeight = FontWeight.Black,
            color = Color.White,
            letterSpacing = 1.sp
        )
    }
}

@Composable
fun HeroBanner(movie: Movie, logoUrl: String?, scrollValue: Int, onPlayClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(0.8f) // somewhat tall
    ) {
        val imageUrl = "https://image.tmdb.org/t/p/w780${movie.posterPath ?: movie.backdropPath}"
        AsyncImage(
            model = imageUrl,
            contentDescription = movie.displayTitle,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxSize()
                .graphicsLayer {
                    // Parallax effect: translate Y based on scroll position
                    translationY = scrollValue * 0.5f
                }
        )
        // Gradient overlay to fade smoothly into the black background
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            Color.Transparent,
                            Color.Black.copy(alpha = 0.8f),
                            Color.Black
                        )
                    )
                )
        )
        
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp, start = 32.dp, end = 32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (logoUrl != null) {
                AsyncImage(
                    model = "https://image.tmdb.org/t/p/w500$logoUrl",
                    contentDescription = movie.displayTitle,
                    contentScale = ContentScale.Fit,
                    modifier = Modifier.fillMaxWidth(0.8f).heightIn(max = 100.dp)
                )
            } else {
                Text(
                    text = movie.displayTitle.uppercase(),
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
            Spacer(modifier = Modifier.height(24.dp))
            Row(
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Circular Blue Play Button
                IconButton(
                    onClick = onPlayClick,
                    modifier = Modifier
                        .size(56.dp)
                        .background(Color(0xFF0055FF), shape = CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = "Play",
                        tint = Color.White,
                        modifier = Modifier.size(32.dp)
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                // Glassmorphism/Transparent See More Button
                OutlinedButton(
                    onClick = onPlayClick,
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Color.White,
                        containerColor = Color.White.copy(alpha = 0.2f)
                    ),
                    border = null,
                    shape = RoundedCornerShape(24.dp),
                    modifier = Modifier.height(56.dp)
                ) {
                    Icon(Icons.Default.Info, contentDescription = "See More")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("See More", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun MovieRow(title: String, movies: List<Movie>, onMovieClick: (Int, String) -> Unit) {
    if (movies.isEmpty()) return
    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = Color.White,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(movies) { movie ->
                MovieCard(
                    movie = movie,
                    onClick = { onMovieClick(movie.id, movie.mediaType ?: "movie") }
                )
            }
        }
    }
}

@Composable
fun Top10Row(title: String, movies: List<Movie>, onMovieClick: (Int, String) -> Unit) {
    if (movies.isEmpty()) return
    Column(modifier = Modifier.padding(vertical = 16.dp)) {
        val titleLines = title.split("\n")
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = titleLines[0], // "TOP 10"
                fontSize = 28.sp,
                fontWeight = FontWeight.Light,
                color = Color.White,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = titleLines[1], // "SHOWS TODAY"
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Gray,
                letterSpacing = 2.sp,
                lineHeight = 14.sp
            )
        }
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(0.dp)
        ) {
            itemsIndexed(movies) { index, movie ->
                MovieCard(
                    movie = movie,
                    onClick = { onMovieClick(movie.id, movie.mediaType ?: "movie") },
                    isTop10 = true,
                    rank = index + 1
                )
            }
        }
    }
}
