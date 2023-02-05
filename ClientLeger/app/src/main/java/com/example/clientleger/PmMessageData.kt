package com.example.clientleger

import com.google.firebase.database.Exclude
import com.google.firebase.database.IgnoreExtraProperties
import java.util.Objects


@IgnoreExtraProperties
data class PmMessageData(
    var uid: String? = null,
    var time: String? = null,
    var message: String? = null,
    var picture: Boolean? = null,
)
