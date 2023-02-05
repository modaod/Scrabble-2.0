package com.example.clientleger

import com.google.firebase.database.IgnoreExtraProperties

@IgnoreExtraProperties
data class GamePlayerInfos(
    var score: Int? = null,
    var uid: String? = null,
    var winner: Boolean?  = null,

    )
