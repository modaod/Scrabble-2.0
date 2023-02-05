package com.example.clientleger

import com.google.firebase.database.IgnoreExtraProperties

@IgnoreExtraProperties
data class UserGame(
    var gameId: String? = null,
    var score: Int? = null,
    var win: Boolean? = null,
    var time: Int? = null,
    var date: String? = null,
    var opponents: String? = null,


)
