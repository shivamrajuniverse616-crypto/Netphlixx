package com.example.netphlixx.ui.auth

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage

data class OnboardingPage(
    val title: String,
    val description: String,
    val imageUrl: String
)

val onboardingPages = listOf(
    OnboardingPage(
        "Watch on any device",
        "Stream on your phone, tablet, laptop, and TV without paying more.",
        "https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/device-pile.png"
    ),
    OnboardingPage(
        "Create profiles for kids",
        "Send kids on adventures with their favorite characters in a space made just for them.",
        "https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/tv.png"
    ),
    OnboardingPage(
        "No pesky contracts.",
        "Cancel anytime.",
        "https://assets.nflxext.com/ffe/siteui/acquisition/ourStory/fuji/desktop/mobile-0819.jpg"
    )
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    onFinish: () -> Unit
) {
    val pagerState = rememberPagerState(pageCount = { onboardingPages.size })

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0a0a0c))
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) { page ->
                val pageOffset = (pagerState.currentPage - page) + pagerState.currentPageOffsetFraction
                val absoluteOffset = kotlin.math.abs(pageOffset)
                
                val content = onboardingPages[page]
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp)
                        .graphicsLayer {
                            alpha = 1f - absoluteOffset
                            translationX = pageOffset * 200f
                            scaleX = 1f - (absoluteOffset * 0.15f)
                            scaleY = 1f - (absoluteOffset * 0.15f)
                        },
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    AsyncImage(
                        model = content.imageUrl,
                        contentDescription = null,
                        contentScale = ContentScale.Fit,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(300.dp)
                            .padding(bottom = 32.dp)
                    )
                    Text(
                        text = content.title,
                        color = Color.White,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                    Text(
                        text = content.description,
                        color = Color.Gray,
                        fontSize = 18.sp,
                        textAlign = TextAlign.Center
                    )
                }
            }

            // Pager Indicators
            Row(
                Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp),
                horizontalArrangement = Arrangement.Center
            ) {
                repeat(onboardingPages.size) { iteration ->
                    val color = if (pagerState.currentPage == iteration) Color(0xFFE50914) else Color.DarkGray
                    Box(
                        modifier = Modifier
                            .padding(4.dp)
                            .clip(CircleShape)
                            .background(color)
                            .size(10.dp)
                    )
                }
            }

            Button(
                onClick = onFinish,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 32.dp, vertical = 32.dp)
                    .height(56.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914))
            ) {
                Text("GET STARTED", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
