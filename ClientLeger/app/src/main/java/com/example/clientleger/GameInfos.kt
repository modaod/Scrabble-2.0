package com.example.clientleger

import com.google.firebase.database.IgnoreExtraProperties

@IgnoreExtraProperties
data class GameInfos(
    var date: String? = null,
    var result: ArrayList<GamePlayerInfos>? = null,

)
