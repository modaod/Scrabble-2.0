package com.example.clientleger

import java.io.Serializable

import kotlin.collections.ArrayList


data class Timer (
    var minute: Int,
    var second: Int
) {
    constructor() : this(1, 0)
}

data class GameSettings(
    var roomName: String,
    var virtualPlayerName: String? = null,
    var isSoloMode: Boolean,
    var isEasyMode: Boolean? = null,
    val timer: Timer,
    var dictionary: String,
    val gameType: String,
    val roomVisibility: String,
    var password: String? = null
)

data class User (
    var username: String,
    var avatar: String,
    var userType: String
)

data class Room(
    var roomName: String? = null,
    var hostName: String? = null,
    var timer: Timer? = null,
    var gameType: String? = null,
    var users: ArrayList<User?>? = null,
    var isGameStarted: Boolean? = false,
    var roomVisibility: String? = null,
    var password: String? = null
) : Serializable

//export interface WaitingRoom {
//    hostName: string;
//    users: PublicUser[];
//    roomName: string;
//    timer: Timer;
//    gameType: GameType;
//    isGameStarted: boolean;
//    roomVisibility: RoomVisibility;
//    password?: string;
//}
