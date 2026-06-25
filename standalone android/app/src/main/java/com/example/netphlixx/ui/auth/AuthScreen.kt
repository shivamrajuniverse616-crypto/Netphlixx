package com.example.netphlixx.ui.auth

import android.content.Context
import android.util.Log
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

val col1 = listOf("/oIQmtByV1LtEQSwM4EpdLTyoSlM.jpg","/bRwnj8WEKBCvmfeUNOukJPwB43K.jpg","/zm0KAbOjlt9eR5y7vDiL2dEOwMl.jpg","/gV0J0Fqw2mYMtQbzb0ruxv9MAeZ.jpg")
val col2 = listOf("/hwRdDFIhaEmpRgoki805YvyyjZf.jpg","/a6H2U7pjibMia41TwyFVd1PVQw3.jpg","/ArIS4vwUxdhm3j7tsTHmffdfU8W.jpg","/7wIBfBl2gejt6xHxNSK0reVIm7E.jpg")
val col3 = listOf("/alf3JOPP7EYP0iO24gwe5YfRnqo.jpg","/nLxu237EJAisFCYKK48hN9Plobx.jpg","/5Vi8dSauVwH1HOsiZceDMbRr1Ca.jpg","/rMgG7cWuq9O6zhhLs2CbqIKVA8V.jpg")
val col4 = listOf("/4KZXlZ5tTT6ghbW77gS4hSLkCd7.jpg","/eJGWx219ZcEMVQJhAgMiqo8tYY.jpg","/3o5YPjDGDTcTDL5ftDA9NwN9dLd.jpg","/kjcuS7xaRyqRjVaVcH4t0qHshuX.jpg")

@Composable
fun MovingPosterColumn(images: List<String>, durationMillis: Int, reverse: Boolean, modifier: Modifier = Modifier) {
    val infiniteTransition = rememberInfiniteTransition()
    val progress by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        )
    )

    BoxWithConstraints(modifier = modifier.fillMaxHeight().clipToBounds()) {
        val width = maxWidth
        val posterHeight = width * 1.5f
        val totalPosterHeight = posterHeight + 8.dp
        val singleSetHeightPx = with(LocalDensity.current) { (totalPosterHeight * images.size).toPx() }
        
        val offsetPx = singleSetHeightPx * progress
        val finalOffset = if (reverse) -singleSetHeightPx + offsetPx else -offsetPx
        
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .graphicsLayer {
                    translationY = finalOffset
                }
        ) {
            val repeatedImages = images + images + images + images
            repeatedImages.forEach { src ->
                coil.compose.AsyncImage(
                    model = "https://image.tmdb.org/t/p/w500$src",
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(posterHeight)
                        .padding(4.dp)
                        .clip(RoundedCornerShape(8.dp))
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
    onSignInSuccess: () -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isSignUp by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Box(
        modifier = Modifier.fillMaxSize().background(Color(0xFF050505)),
        contentAlignment = Alignment.Center
    ) {
        // Dynamic Moving Background Grid
        Row(
            modifier = Modifier.fillMaxSize().graphicsLayer { alpha = 0.4f }.padding(horizontal = 4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            MovingPosterColumn(col1, 20000, false, Modifier.weight(1f))
            MovingPosterColumn(col2, 25000, true, Modifier.weight(1f))
            MovingPosterColumn(col3, 22000, false, Modifier.weight(1f))
            MovingPosterColumn(col4, 28000, true, Modifier.weight(1f))
        }

        // Gradient Overlays for depth
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.verticalGradient(
                    colors = listOf(Color.Transparent, Color(0xFF050505).copy(alpha = 0.8f), Color(0xFF050505)),
                    startY = 0f
                ))
        )
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Brush.radialGradient(
                    colors = listOf(Color.Transparent, Color(0xFF050505).copy(alpha = 0.7f), Color(0xFF050505)),
                    radius = 1500f
                ))
        )

        // Auth Form
        Column(
            modifier = Modifier
                .padding(24.dp)
                .fillMaxWidth()
                .background(Color(0xFF0a0a0c).copy(alpha = 0.85f), RoundedCornerShape(24.dp))
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "NETPHLIXX",
                color = Color(0xFFE50914),
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.padding(bottom = 32.dp)
            )

            Text(
                text = if (isSignUp) "Sign Up" else "Sign In",
                color = Color.White,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(bottom = 24.dp).align(Alignment.Start)
            )

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email", color = Color.Gray) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color.White,
                    unfocusedBorderColor = Color.DarkGray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedContainerColor = Color(0xFF1a1a1c),
                    unfocusedContainerColor = Color(0xFF1a1a1c)
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp)
            )

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password", color = Color.Gray) },
                visualTransformation = PasswordVisualTransformation(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color.White,
                    unfocusedBorderColor = Color.DarkGray,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedContainerColor = Color(0xFF1a1a1c),
                    unfocusedContainerColor = Color(0xFF1a1a1c)
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)
            )

            Button(
                onClick = {
                    if (email.isBlank() || password.isBlank()) {
                        errorMessage = "Please enter email and password"
                        return@Button
                    }
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        try {
                            val auth = FirebaseAuth.getInstance()
                            if (isSignUp) {
                                auth.createUserWithEmailAndPassword(email, password).await()
                            } else {
                                auth.signInWithEmailAndPassword(email, password).await()
                            }
                            onSignInSuccess()
                        } catch (e: Exception) {
                            errorMessage = e.localizedMessage ?: "Authentication failed"
                        } finally {
                            isLoading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFE50914))
            ) {
                if (isLoading) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text(if (isSignUp) "Sign Up" else "Sign In", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            Text(
                text = if (isSignUp) "Already have an account? Sign In" else "New to Netphlixx? Sign Up now.",
                color = Color.LightGray,
                modifier = Modifier
                    .padding(top = 16.dp, bottom = 24.dp)
                    .clickable { isSignUp = !isSignUp }
            )

            HorizontalDivider(color = Color.DarkGray, modifier = Modifier.padding(bottom = 24.dp))

            Button(
                onClick = {
                    coroutineScope.launch {
                        isLoading = true
                        errorMessage = null
                        try {
                            signInWithGoogle(context)
                            onSignInSuccess()
                        } catch (e: Exception) {
                            Log.e("AuthScreen", "Sign in failed", e)
                            errorMessage = "Google Sign in failed: ${e.localizedMessage}"
                        } finally {
                            isLoading = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Color.White)
            ) {
                Text("Sign in with Google", color = Color.Black, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
            }

            errorMessage?.let {
                Text(
                    text = it,
                    color = Color.Red,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }
        }
    }
}

suspend fun signInWithGoogle(context: Context) {
    val credentialManager = CredentialManager.create(context)
    val googleIdOption = GetGoogleIdOption.Builder()
        .setFilterByAuthorizedAccounts(false)
        .setServerClientId("30379861400-58nqmvkii8es1ro6ed5eo6h5f7fun41t.apps.googleusercontent.com")
        .setAutoSelectEnabled(true)
        .build()

    val request = GetCredentialRequest.Builder()
        .addCredentialOption(googleIdOption)
        .build()

    val result = credentialManager.getCredential(context, request)
    val credential = result.credential
    if (credential is GoogleIdTokenCredential) {
        val idToken = credential.idToken
        val firebaseCredential = GoogleAuthProvider.getCredential(idToken, null)
        val authResult = FirebaseAuth.getInstance().signInWithCredential(firebaseCredential)
        authResult.await()
    } else {
        throw RuntimeException("Unexpected credential type")
    }
}
