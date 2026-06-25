package com.example.netphlixx.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.netphlixx.data.model.Movie

@Composable
fun MovieCard(
    movie: Movie,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isTop10: Boolean = false,
    rank: Int = 0
) {
    val imageUrl = "https://image.tmdb.org/t/p/w500${movie.posterPath}"
    
    if (isTop10) {
        Box(
            modifier = modifier
                .width(180.dp)
                .height(200.dp)
                .clickable { onClick() }
        ) {
            // Massive Outline Number
            val textStyleStroke = TextStyle(
                fontSize = 140.sp,
                fontWeight = FontWeight.Black,
                color = Color.Black,
                drawStyle = Stroke(
                    miter = 10f,
                    width = 8f
                )
            )
            val textStyleFill = TextStyle(
                fontSize = 140.sp,
                fontWeight = FontWeight.Black,
                color = Color.Red
            )
            
            Box(modifier = Modifier.align(Alignment.BottomStart).offset(x = (-20).dp, y = 20.dp)) {
                // Draw stroke
                Text(
                    text = rank.toString(),
                    style = textStyleStroke,
                    color = Color.Red // The stroke color
                )
                // Draw fill
                Text(
                    text = rank.toString(),
                    style = textStyleFill,
                    color = Color.Black // The inner color
                )
            }

            AsyncImage(
                model = imageUrl,
                contentDescription = movie.displayTitle,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .width(120.dp)
                    .aspectRatio(2f / 3f)
                    .align(Alignment.CenterEnd)
                    .clip(RoundedCornerShape(12.dp))
            )
        }
    } else {
        Card(
            shape = RoundedCornerShape(12.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = modifier
                .width(120.dp)
                .aspectRatio(2f / 3f)
                .clickable { onClick() }
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                AsyncImage(
                    model = imageUrl,
                    contentDescription = movie.displayTitle,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                
                // Rating Badge
                if (movie.voteAverage != null && movie.voteAverage > 0) {
                    Box(
                        modifier = Modifier
                            .padding(6.dp)
                            .size(34.dp)
                            .background(Color.Black.copy(alpha = 0.7f), CircleShape)
                            .border(2.dp, getRatingColor(movie.voteAverage), CircleShape)
                            .align(Alignment.TopStart),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = String.format("%.1f", movie.voteAverage),
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

fun getRatingColor(rating: Double): Color {
    return when {
        rating >= 8.0 -> Color(0xFF4CAF50) // Green
        rating >= 6.0 -> Color(0xFFFFC107) // Yellow
        else -> Color(0xFFF44336) // Red
    }
}
