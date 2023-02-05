package com.example.clientleger

import com.google.firebase.database.Exclude
import com.google.firebase.database.IgnoreExtraProperties
import java.util.Objects


@IgnoreExtraProperties
data class UserData(
    var uid: String? = null,
    var username: String? = null,
    var email: String? = null,
    var avatarUrl: String? = null,
    var status: String? = null,
    var language: String? = null,
    var theme: String? = null,
    var games: ArrayList<String?>? = null,
    var friends: ArrayList<String?>? = null,
    var outgoingFriendRequests: ArrayList<String?>? = null,
    var incomingFriendRequests: ArrayList<String?>? = null,
    var gamesPlayed: ArrayList<UserGame?>? = null,
    var activity: ArrayList<UserActivity>? = null,
    var rankedLevel: String? = null,
    var rankedPoints: Int? = null



)
