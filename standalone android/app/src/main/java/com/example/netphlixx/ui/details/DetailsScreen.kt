package com.example.netphlixx.ui.details

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.CalendarMonth
import androidx.compose.material.icons.outlined.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.BlurredEdgeTreatment
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import com.example.netphlixx.data.model.CastMember
import com.example.netphlixx.ui.components.MovieCard
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.delay

val CustomDarkBg = Color(0xFF141414)
val CustomDarkGray = Color(0xFF262626)

@Composable
fun DetailsScreen(
    onPlay: (Int, String) -> Unit,
    onBack: () -> Unit,
    onMovieClick: (Int, String) -> Unit,
    viewModel: DetailsViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    if (uiState.isLoading) {
        Box(modifier = Modifier.fillMaxSize().background(CustomDarkBg), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
        }
        return
    }

    val details = uiState.details ?: return

    var isVisible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        isVisible = true
    }

    Box(modifier = Modifier.fillMaxSize().background(Color.Black)) {
        
        // 1. Blurred Backdrop Image Background (The movie poster behind the main poster)
        AsyncImage(
            model = "https://image.tmdb.org/t/p/original${details.backdropPath ?: details.posterPath}",
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxSize()
                .blur(radiusX = 40.dp, radiusY = 40.dp, edgeTreatment = BlurredEdgeTreatment.Unbounded)
        )
        
        // Gradient overlays to fade smoothly into the black background at the bottom
        Box(
            modifier = Modifier.fillMaxSize().background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color.Black.copy(alpha = 0.3f), 
                        Color.Black.copy(alpha = 0.7f), 
                        CustomDarkBg,
                        CustomDarkBg
                    ),
                    startY = 0f
                )
            )
        )

        // 2. Animated Slide-Up Content
        AnimatedVisibility(
            visible = isVisible,
            enter = slideInVertically(
                initialOffsetY = { it }, // slides entirely from the bottom up
                animationSpec = tween(durationMillis = 600, easing = FastOutSlowInEasing)
            ) + fadeIn(animationSpec = tween(600)),
            modifier = Modifier.fillMaxSize()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                
                // Top Bar with Back Button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = onBack,
                        modifier = Modifier.background(Color.Black.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Big Centered Main Poster
                AsyncImage(
                    model = "https://image.tmdb.org/t/p/w780${details.posterPath}",
                    contentDescription = "Poster",
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth(0.65f) // taking up ~65% of screen width
                        .aspectRatio(0.66f)
                        .clip(RoundedCornerShape(16.dp))
                        .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(16.dp))
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Title or Logo
                if (uiState.logoUrl != null) {
                    AsyncImage(
                        model = "https://image.tmdb.org/t/p/w500${uiState.logoUrl}",
                        contentDescription = details.displayTitle,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .fillMaxWidth(0.8f)
                            .heightIn(max = 120.dp)
                    )
                } else {
                    Text(
                        text = details.displayTitle.uppercase(),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Black,
                        color = Color.White,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Production Companies
                if (details.productionCompanies.isNotEmpty()) {
                    Row(horizontalArrangement = Arrangement.Center, verticalAlignment = Alignment.CenterVertically) {
                        details.productionCompanies.filter { it.logoPath != null }.take(2).forEach { company ->
                            AsyncImage(
                                model = "https://image.tmdb.org/t/p/w300${company.logoPath}",
                                contentDescription = company.name,
                                contentScale = ContentScale.Fit,
                                modifier = Modifier.height(24.dp).padding(horizontal = 8.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }

                // Meta Info (Release Date)
                val releaseDateStr = details.releaseDate ?: details.firstAirDate
                if (!releaseDateStr.isNullOrEmpty()) {
                    val formattedDate = try {
                        val sdfIn = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                        val sdfOut = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.US)
                        val date = sdfIn.parse(releaseDateStr)
                        sdfOut.format(date!!)
                    } catch (e: Exception) { releaseDateStr }
                    Text(text = formattedDate, color = Color.LightGray, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Director
                uiState.director?.let { director ->
                    Text(text = "Directed by ${director.name}", color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(24.dp))
                }

                // Countdown Timer (if in future)
                if (!releaseDateStr.isNullOrEmpty() && isDateInFuture(releaseDateStr)) {
                    CountdownTimer(releaseDateStr)
                    Spacer(modifier = Modifier.height(24.dp))
                }

                // Action Buttons Row (My List, Play Now, Share)
                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    ActionButton(Icons.Default.Add, "My List")
                    
                    if (releaseDateStr.isNullOrEmpty() || !isDateInFuture(releaseDateStr)) {
                        Button(
                            onClick = { onPlay(details.id, if (details.runtime != null) "movie" else "tv") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914), contentColor = Color.White),
                            shape = RoundedCornerShape(24.dp), // Pill shape
                            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp)
                        ) {
                            Icon(Icons.Default.PlayArrow, contentDescription = "Play Now")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Play Now", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    } else {
                        Button(
                            onClick = { },
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.2f), contentColor = Color.White),
                            shape = RoundedCornerShape(24.dp),
                            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 12.dp)
                        ) {
                            Icon(Icons.Default.Notifications, contentDescription = "Remind Me")
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Remind Me", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        }
                    }

                    ActionButton(Icons.Default.Share, "Share")
                }
                
                Spacer(modifier = Modifier.height(32.dp))

                // Left Aligned Content Wrapper
                Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.Start) {
                    // Genres
                    if (details.genres.isNotEmpty()) {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(details.genres) { genre ->
                                Box(
                                    modifier = Modifier
                                        .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(16.dp))
                                        .padding(horizontal = 12.dp, vertical = 6.dp)
                                ) {
                                    Text(text = genre.name, color = Color.White, fontSize = 12.sp)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(24.dp))
                    }

                    // Casts & Credits
                    if (uiState.cast.isNotEmpty()) {
                        Text(
                            text = "Casts & Credits",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                            items(uiState.cast.take(8)) { member ->
                                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(80.dp)) {
                                    val imageUrl = "https://image.tmdb.org/t/p/w185${member.profilePath}"
                                    AsyncImage(
                                        model = imageUrl,
                                        contentDescription = member.name,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier
                                            .size(70.dp)
                                            .clip(CircleShape)
                                            .background(Color.DarkGray)
                                    )
                                    Spacer(modifier = Modifier.height(8.dp))
                                    Text(
                                        text = member.name, 
                                        color = Color.White, 
                                        fontWeight = FontWeight.Medium, 
                                        fontSize = 12.sp,
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                        maxLines = 2,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(32.dp))
                    }

                    // Overview
                    Text(
                        text = "Overview",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = details.overview ?: "No overview available.",
                        color = Color.White.copy(alpha = 0.8f),
                        style = MaterialTheme.typography.bodyMedium,
                        lineHeight = 22.sp
                    )

                    Spacer(modifier = Modifier.height(48.dp))

                    // Trailer
                    if (uiState.trailer != null) {
                        Text(
                            text = "Trailer",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(16f / 9f)
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { /* Play Trailer */ }
                        ) {
                            AsyncImage(
                                model = "https://img.youtube.com/vi/${uiState.trailer!!.key}/hqdefault.jpg",
                                contentDescription = "Trailer",
                                contentScale = ContentScale.Crop,
                                modifier = Modifier.fillMaxSize()
                            )
                            Box(
                                modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.4f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.PlayArrow,
                                    contentDescription = "Play Trailer",
                                    tint = Color.White,
                                    modifier = Modifier.size(56.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(48.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun ActionButton(icon: androidx.compose.ui.graphics.vector.ImageVector, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable { }) {
        Icon(icon, contentDescription = label, tint = Color.White, modifier = Modifier.size(24.dp))
        Spacer(modifier = Modifier.height(8.dp))
        Text(text = label, color = Color.Gray, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

fun isDateInFuture(dateStr: String): Boolean {
    return getDiff(dateStr) > 0
}

fun getDiff(dateStr: String): Long {
    try {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val date = sdf.parse(dateStr) ?: return 0
        return date.time - System.currentTimeMillis()
    } catch (e: Exception) {
        return 0
    }
}

@Composable
fun CountdownTimer(releaseDateStr: String) {
    var diff by remember { mutableStateOf(getDiff(releaseDateStr)) }

    LaunchedEffect(releaseDateStr) {
        while (true) {
            delay(1000)
            diff = getDiff(releaseDateStr)
        }
    }

    if (diff > 0) {
        val daysTotal = diff / (1000 * 60 * 60 * 24)
        val months = daysTotal / 30
        val days = daysTotal % 30
        val hours = (diff / (1000 * 60 * 60)) % 24
        val minutes = (diff / (1000 * 60)) % 60
        val seconds = (diff / 1000) % 60

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            TimeBox(months.toString(), "MONTH")
            TimeBox(days.toString(), "DAYS")
            TimeBox(hours.toString(), "HOURS")
            TimeBox(minutes.toString(), "MIN")
            TimeBox(seconds.toString(), "SEC")
        }
    }
}

@Composable
fun TimeBox(value: String, label: String) {
    Box(
        modifier = Modifier
            .background(CustomDarkGray, RoundedCornerShape(12.dp))
            .width(64.dp)
            .aspectRatio(0.8f),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = value.padStart(2, '0'),
                fontSize = 24.sp,
                fontWeight = FontWeight.Light,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = label,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Gray
            )
        }
    }
}
