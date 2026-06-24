package com.shivamraj.netphlixx.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val NetphlixxColorScheme = darkColorScheme(
    primary = NetflixRed,
    secondary = NetflixRed,
    tertiary = NetflixGray,
    background = NetflixDark,
    surface = NetflixDarker,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onBackground = NetflixLightGray,
    onSurface = NetflixLightGray,
)

@Composable
fun NetphlixxTheme(
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = NetphlixxColorScheme, 
    typography = Typography, 
    content = content
  )
}
