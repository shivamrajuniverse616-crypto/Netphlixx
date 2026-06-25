package com.example.netphlixx.ui.details

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
import androidx.compose.ui.draw.clip
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

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CustomDarkBg)
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // Top Bar
        IconButton(
            onClick = onBack,
            modifier = Modifier.background(CustomDarkGray, CircleShape)
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Vertical Poster (Top Image)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(0.66f)
                .clip(RoundedCornerShape(16.dp))
        ) {
            val imageUrl = "https://image.tmdb.org/t/p/w780${details.posterPath}"
            AsyncImage(
                model = imageUrl,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )
            
            // "MOST VIEWED ON NETPHLIX" overlay
            Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .background(Color.Black.copy(alpha = 0.6f))
                    .padding(vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "MOST VIEWED ON NETPHLIX ★",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    letterSpacing = 1.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Title / Logo
        if (uiState.logoUrl != null) {
            AsyncImage(
                model = "https://image.tmdb.org/t/p/w500${uiState.logoUrl}",
                contentDescription = details.displayTitle,
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 100.dp)
            )
        } else {
            Text(
                text = details.displayTitle.uppercase(),
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Black,
                color = Color.White,
                modifier = Modifier.fillMaxWidth(),
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Production Companies (Studios)
        if (details.productionCompanies.isNotEmpty()) {
            LazyRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                items(details.productionCompanies.filter { it.logoPath != null }.take(4)) { company ->
                    AsyncImage(
                        model = "https://image.tmdb.org/t/p/w300${company.logoPath}",
                        contentDescription = company.name,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .height(24.dp)
                            .padding(horizontal = 8.dp)
                    )
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Meta info row
        val releaseDateStr = details.releaseDate ?: details.firstAirDate
        if (!releaseDateStr.isNullOrEmpty()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Outlined.CalendarMonth, contentDescription = "Release Date", tint = Color.Gray, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(8.dp))
                val formattedDate = try {
                    val sdfIn = SimpleDateFormat("yyyy-MM-dd", Locale.US)
                    val sdfOut = SimpleDateFormat("EEEE, MMMM d, yyyy", Locale.US)
                    val date = sdfIn.parse(releaseDateStr)
                    sdfOut.format(date!!) + " (United States)"
                } catch (e: Exception) { releaseDateStr }
                Text(text = formattedDate, color = Color.LightGray, fontSize = 12.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(Icons.Outlined.Schedule, contentDescription = "Runtime", tint = Color.Gray, modifier = Modifier.size(16.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text(text = "TBA", color = Color.LightGray, fontSize = 12.sp)
            
            if (uiState.ageRating != null) {
                Spacer(modifier = Modifier.width(16.dp))
                Box(
                    modifier = Modifier
                        .border(1.dp, Color.Gray, RoundedCornerShape(4.dp))
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(text = uiState.ageRating!!, color = Color.LightGray, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Genres
        if (details.genres.isNotEmpty()) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(details.genres) { genre ->
                    Box(
                        modifier = Modifier
                            .background(CustomDarkGray, RoundedCornerShape(16.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text(text = genre.name, color = Color.LightGray, fontSize = 12.sp)
                    }
                }
            }
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Director
        uiState.director?.let { director ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                val imageUrl = "https://image.tmdb.org/t/p/w185${director.profilePath}"
                AsyncImage(
                    model = imageUrl,
                    contentDescription = director.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(Color.DarkGray)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(text = director.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    Text(text = "Director", color = Color.Gray, fontSize = 12.sp)
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }

        // Available on
        if (!releaseDateStr.isNullOrEmpty() && isDateInFuture(releaseDateStr)) {
            Text("Available on", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(8.dp))
            Box(
                modifier = Modifier
                    .background(Color(0xFF0D253F), RoundedCornerShape(8.dp))
                    .padding(horizontal = 12.dp, vertical = 8.dp)
            ) {
                Text("THE MOVIE DB", color = Color(0xFF01B4E4), fontWeight = FontWeight.Black, fontSize = 12.sp)
            }
            Spacer(modifier = Modifier.height(24.dp))
            
            // Exact 5-Box Countdown
            CountdownTimer(releaseDateStr)
            Spacer(modifier = Modifier.height(24.dp))
        }

        // Action Buttons (Pill shaped, multiple rows)
        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            Button(
                onClick = { },
                colors = ButtonDefaults.buttonColors(containerColor = CustomDarkGray),
                shape = RoundedCornerShape(24.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "Watchlist", tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Watchlist", color = Color.White)
            }
            Button(
                onClick = { },
                colors = ButtonDefaults.buttonColors(containerColor = CustomDarkGray),
                shape = RoundedCornerShape(24.dp)
            ) {
                Icon(Icons.Default.Notifications, contentDescription = "Reminder", tint = Color.White, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Reminder", color = Color.White)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Button(
            onClick = { },
            colors = ButtonDefaults.buttonColors(containerColor = CustomDarkGray),
            shape = RoundedCornerShape(24.dp)
        ) {
            Icon(Icons.Default.Share, contentDescription = "Share", tint = Color.White, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Share", color = Color.White)
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Casts & Credits
        if (uiState.cast.isNotEmpty()) {
            Text(
                text = "Casts & Credits",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(16.dp))
            uiState.cast.take(5).forEach { member ->
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)) {
                    val imageUrl = "https://image.tmdb.org/t/p/w185${member.profilePath}"
                    AsyncImage(
                        model = imageUrl,
                        contentDescription = member.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(Color.DarkGray)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(text = member.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        if (!member.character.isNullOrEmpty()) {
                            Text(text = member.character, color = Color.Gray, fontSize = 12.sp)
                        }
                    }
                }
            }
            TextButton(onClick = { }) {
                Text("Show All v", color = Color(0xFF0055FF), fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

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
            color = Color.LightGray,
            style = MaterialTheme.typography.bodyMedium,
            lineHeight = 20.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Trailer Thumbnail
        if (uiState.trailer != null) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .clip(RoundedCornerShape(16.dp))
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
                        modifier = Modifier.size(64.dp)
                    )
                }
                Column(
                    modifier = Modifier.align(Alignment.BottomCenter).padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = uiState.trailer!!.name,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Text("OFFICIAL TRAILER", color = Color.LightGray, fontSize = 10.sp, letterSpacing = 1.sp)
                }
            }
            Spacer(modifier = Modifier.height(32.dp))
        }

        // Play Now (if not in future)
        if (releaseDateStr.isNullOrEmpty() || !isDateInFuture(releaseDateStr)) {
            Button(
                onClick = { onPlay(details.id, if (details.runtime != null) "movie" else "tv") },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.White, contentColor = Color.Black),
                shape = RoundedCornerShape(8.dp)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = "Play Now", modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("Play Now", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            }
            Spacer(modifier = Modifier.height(32.dp))
        }
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
