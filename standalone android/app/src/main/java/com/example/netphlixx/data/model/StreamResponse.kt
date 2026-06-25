package com.example.netphlixx.data.model

import kotlinx.serialization.Serializable

@Serializable
data class StreamResponse(
    val success: Boolean,
    val streams: List<StreamSource>? = null,
    val captions: List<CaptionSource>? = null
)

@Serializable
data class StreamSource(
    val name: String,
    val url: String,
    val type: String? = "m3u8"
)

@Serializable
data class CaptionSource(
    val lang: String,
    val url: String
)
