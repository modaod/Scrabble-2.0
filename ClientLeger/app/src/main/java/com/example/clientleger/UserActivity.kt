package com.example.clientleger

import com.google.firebase.database.IgnoreExtraProperties

@IgnoreExtraProperties
data class UserActivity(
    var type: String? = null,
    var date: String? = null,
)
