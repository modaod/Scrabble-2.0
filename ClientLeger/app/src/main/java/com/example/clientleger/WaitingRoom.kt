package com.example.clientleger

import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.clientleger.databinding.ActivityWaitingRoomBinding
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.Executors

class WaitingRoom : AppCompatActivity() {

    var roomName: String = ""
    var isPrivateRoom: Boolean = false
    var isHostPlayer: Boolean = false
    var isGuestPlayer: Boolean = false
    var selfUsername: String = "Yama"
    var usernameList: ArrayList<String> = ArrayList()
    var usertypeList: ArrayList<String> = ArrayList()
    var avatarList: ArrayList<String> = ArrayList()
    var playerCount: Int = 0
    var humanPlayerCount: Int = 0
    var virtualPlayerCount: Int = 0
    var isGameStarted: Boolean = false
    var isPlayer: Boolean = true
    var isObserver: Boolean = false

    lateinit var progressBar: ProgressBar
    lateinit var addVirtualPlayerButton: Button
    lateinit var startGameButton: Button
    lateinit var leaveRoomButton: Button

    lateinit var linearLayoutPlayer0: LinearLayout
    lateinit var avatarPlayer0: ImageView
    lateinit var usernamePlayer0: TextView
    lateinit var usertypePlayer0: TextView
    lateinit var removeButtonPlayer0: ImageButton

    lateinit var linearLayoutPlayer1: LinearLayout
    lateinit var avatarPlayer1: ImageView
    lateinit var usernamePlayer1: TextView
    lateinit var usertypePlayer1: TextView
    lateinit var removeButtonPlayer1: ImageButton

    lateinit var linearLayoutPlayer2: LinearLayout
    lateinit var avatarPlayer2: ImageView
    lateinit var usernamePlayer2: TextView
    lateinit var usertypePlayer2: TextView
    lateinit var removeButtonPlayer2: ImageButton

    lateinit var mSocket: Socket

    private lateinit var binding: ActivityWaitingRoomBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWaitingRoomBinding.inflate(layoutInflater)
        setContentView(binding.root)

        progressBar = findViewById(binding.progressBar.id)
        addVirtualPlayerButton = findViewById(binding.addVirtualPlayerButton.id)
        startGameButton = findViewById(binding.startGameButton.id)
        leaveRoomButton = findViewById(binding.leaveRoomButton.id)

        linearLayoutPlayer0 = findViewById(binding.player0.id)
        avatarPlayer0 = findViewById(binding.avatarPlayer0.id)
        usernamePlayer0 = findViewById(binding.usernamePlayer0.id)
        usertypePlayer0 = findViewById(binding.usertypePlayer0.id)
        removeButtonPlayer0 = findViewById(binding.removeButtonPlayer0.id)

        linearLayoutPlayer1 = findViewById(binding.player1.id)
        avatarPlayer1 = findViewById(binding.avatarPlayer1.id)
        usernamePlayer1 = findViewById(binding.usernamePlayer1.id)
        usertypePlayer1 = findViewById(binding.usertypePlayer1.id)
        removeButtonPlayer1 = findViewById(binding.removeButtonPlayer1.id)

        linearLayoutPlayer2 = findViewById(binding.player2.id)
        avatarPlayer2 = findViewById(binding.avatarPlayer2.id)
        usernamePlayer2 = findViewById(binding.usernamePlayer2.id)
        usertypePlayer2 = findViewById(binding.usertypePlayer2.id)
        removeButtonPlayer2 = findViewById(binding.removeButtonPlayer2.id)

        mSocket = SocketHandler.getSocket()

        println("waiting room ID: "+mSocket.id())



        if (savedInstanceState == null) {
            val extras = intent.extras
            if (extras != null) {
                roomName = intent.getStringExtra("roomName").toString()
                isHostPlayer = extras.getBoolean("isHostPlayer")
                isPrivateRoom = extras.getBoolean("isPrivateRoom")
                isGameStarted = extras.getBoolean("isGameStarted")
                isPlayer = extras.getBoolean("isPlayer")
                isObserver = extras.getBoolean("isObserver")
            }
        } else {
            roomName = (savedInstanceState.getSerializable("roomName") as String?).toString()
            isHostPlayer = savedInstanceState.getSerializable("isHostPlayer") as Boolean
            isPrivateRoom = savedInstanceState.getSerializable("isPrivateRoom") as Boolean
            isGameStarted = savedInstanceState.getSerializable("isGameStarted") as Boolean
            isPlayer = savedInstanceState.getSerializable("isPlayer") as Boolean
            isObserver = savedInstanceState.getSerializable("isObserver") as Boolean
        }

        if (isHostPlayer) {
            addVirtualPlayerButton.visibility = View.VISIBLE
            startGameButton.visibility = View.VISIBLE
        }

        if(isObserver){
            mSocket.emit("observerIsGameStarted")
        }

        mSocket.on("observerGameStarted"){args ->
            var data = args[0] as Boolean
            if(data){
                val intent = Intent(this, GameActivity2::class.java)
                startActivity(intent)
            }
        }

        removeButtonPlayer0.setOnClickListener{
            val playerName = usernameList[0]
            if (usertypeList[0] == "human") {
                mSocket.emit("answerGuestPlayer", roomName, false, "playerDeleted", playerName)
            } else {
                mSocket.emit("removeVirtualPlayer", roomName, playerName)
            }
            mSocket.emit("sendWaitingPlayers", roomName)
        }

        removeButtonPlayer1.setOnClickListener{
            val playerName = usernameList[1]
            if (usertypeList[1] == "human") {
                mSocket.emit("answerGuestPlayer", roomName, false, "playerDeleted", playerName)
            } else {
                mSocket.emit("removeVirtualPlayer", roomName, playerName)
            }
            mSocket.emit("sendWaitingPlayers", roomName)
        }

        removeButtonPlayer2.setOnClickListener{
            val playerName = usernameList[2]
            if (usertypeList[2] == "human") {
                mSocket.emit("answerGuestPlayer", roomName, false, "playerDeleted", playerName)
            } else {
                mSocket.emit("removeVirtualPlayer", roomName, playerName)
            }
            mSocket.emit("sendWaitingPlayers", roomName)
        }

        addVirtualPlayerButton.setOnClickListener {
            mSocket.emit("addVirtualPlayer", roomName)
            mSocket.emit("sendWaitingPlayers", roomName)
        }

        startGameButton.setOnClickListener{
            mSocket.emit("answerGuestPlayer", roomName, true, "", "")
            val intent = Intent(this, GameActivity2::class.java)
            startActivity(intent)
        }

        leaveRoomButton.setOnClickListener {
            if (isHostPlayer) {
                mSocket.emit("answerGuestPlayer", roomName, false, "roomDeleted", "")
                mSocket.emit("deleteRoom", roomName)
                startActivity(Intent(this, CreateGameActivity::class.java))
                //finish()
            } else {
                mSocket.emit("guestPlayerLeft", roomName)
                startActivity(Intent(this, JoinGameActivity::class.java))
                //finish()
            }
        }


        mSocket.on("hereAreTheActiveUsers") { args ->
            val userList = args[0] as JSONArray
            usernameList.clear()
            usertypeList.clear()
            avatarList.clear()
            playerCount = 0
            humanPlayerCount = 0
            virtualPlayerCount = 0

            for (i in 0 until userList.length()) {
                val user: JSONObject = userList.getJSONObject(i)
                val username = user.getString("username")
                val usertype = user.getString("userType")
                val avatar = user.getString("avatar")
                if (username != selfUsername) {
                    if (usertype == "human") {
                        playerCount++
                        humanPlayerCount++
                        usernameList.add(username)
                        usertypeList.add(usertype)
                        avatarList.add(avatar)
                    } else if (usertype == "virtual") {
                        playerCount++
                        virtualPlayerCount++
                        usernameList.add(username)
                        usertypeList.add(usertype)
                        avatarList.add(avatar)
                    }
                }
            }

            updateInterface(usernameList, usertypeList, avatarList)
        }

        mSocket.on("guestAnswered") { args ->
            val answer: Boolean = args[0] as Boolean
            if (answer) {
                val intent = Intent(this, GameActivity2::class.java)
                startActivity(intent)
            }
            else {
                startActivity(Intent(this, JoinGameActivity::class.java))
                finish()
            }
        }

        /*mSocket.on("observerJoined") {

            if(isGameStarted && !isPlayer) {
                val intent = Intent(this, GameActivity2::class.java)
                startActivity(intent)
            }
        }*/
    }

    fun updateInterface(usernameList: ArrayList<String>, usertypeList: ArrayList<String>, avatarList: ArrayList<String>) {
        runOnUiThread {
            if (isHostPlayer && virtualPlayerCount < 2 && playerCount < 3) {
                addVirtualPlayerButton.visibility = View.VISIBLE
            } else {
                addVirtualPlayerButton.visibility = View.GONE
            }
            when(usernameList.size) {
                0 -> {
                    progressBar.visibility = View.VISIBLE
                    linearLayoutPlayer0.visibility = View.GONE
                    linearLayoutPlayer1.visibility = View.GONE
                    linearLayoutPlayer2.visibility = View.GONE
                }
                1 -> {
                    progressBar.visibility = View.GONE
                    linearLayoutPlayer0.visibility = View.VISIBLE
                    linearLayoutPlayer1.visibility = View.GONE
                    linearLayoutPlayer2.visibility = View.GONE

                    //Glide.with(applicationContext).load(avatarList[0]).into(avatarPlayer0)
                    usernamePlayer0.text = usernameList[0]
                    usertypePlayer0.text = usertypeList[0]
                    if (isHostPlayer && isPrivateRoom) {
                        removeButtonPlayer0.visibility = View.VISIBLE
                    } else {
                        removeButtonPlayer0.visibility = View.GONE
                    }
                }
                2 -> {
                    progressBar.visibility = View.GONE
                    linearLayoutPlayer0.visibility = View.VISIBLE
                    linearLayoutPlayer1.visibility = View.VISIBLE
                    linearLayoutPlayer2.visibility = View.GONE

                    //Glide.with(applicationContext).load(avatarList[0]).into(avatarPlayer0)
                    usernamePlayer0.text = usernameList[0]
                    usertypePlayer0.text = usertypeList[0]
                    if (isHostPlayer && isPrivateRoom) {
                        removeButtonPlayer0.visibility = View.VISIBLE
                    } else {
                        removeButtonPlayer0.visibility = View.GONE
                    }

                    //Glide.with(applicationContext).load(avatarList[1]).into(avatarPlayer1)
                    usernamePlayer1.text = usernameList[1]
                    usertypePlayer1.text = usertypeList[1]
                    if (isHostPlayer && isPrivateRoom) {
                        removeButtonPlayer1.visibility = View.VISIBLE
                    } else {
                        removeButtonPlayer1.visibility = View.GONE
                    }
                }
                3 -> {
                    progressBar.visibility = View.GONE
                    linearLayoutPlayer0.visibility = View.VISIBLE
                    linearLayoutPlayer1.visibility = View.VISIBLE
                    linearLayoutPlayer2.visibility = View.VISIBLE

                    updateIcon(avatarPlayer0, avatarList[0])
                    usernamePlayer0.text = usernameList[0]
                    usertypePlayer0.text = usertypeList[0]
                    if (isHostPlayer && isPrivateRoom) {
                        removeButtonPlayer0.visibility = View.VISIBLE
                    } else {
                        removeButtonPlayer0.visibility = View.GONE
                    }

                    updateIcon(avatarPlayer1, avatarList[1])
                    usernamePlayer1.text = usernameList[1]
                    usertypePlayer1.text = usertypeList[1]
                    if (isHostPlayer && isPrivateRoom) {
                        removeButtonPlayer1.visibility = View.VISIBLE
                    } else {
                        removeButtonPlayer1.visibility = View.GONE
                    }

                    updateIcon(avatarPlayer2, avatarList[2])
                    usernamePlayer2.text = usernameList[2]
                    usertypePlayer2.text = usertypeList[2]
                    if (isHostPlayer && isPrivateRoom) {
                        removeButtonPlayer2.visibility = View.VISIBLE
                    } else {
                        removeButtonPlayer2.visibility = View.GONE
                    }
                }
            }
        }
    }

    fun updateIcon(view: ImageView, url: String){
        val executor = Executors.newSingleThreadExecutor()
        val handler = Handler(Looper.getMainLooper())
        var image: Bitmap? = null
        executor.execute {
            try {
                val `in` = java.net.URL(url).openStream()
                image = BitmapFactory.decodeStream(`in`)

                // Only for making changes in UI
                handler.post {
                    view.setImageBitmap(image)
                }
            }
            catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
