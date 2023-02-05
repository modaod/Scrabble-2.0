package com.example.clientleger

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.TextView
import androidx.core.content.ContextCompat
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.clientleger.databinding.ActivityJoinGameBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.database.FirebaseDatabase
import com.google.gson.Gson
import io.socket.client.Socket
import org.json.JSONArray

class JoinGameActivity : AppCompatActivity(), JoinRoomRecyclerAdapter.OnJoinButtonClickListener {
    private lateinit var binding: ActivityJoinGameBinding
    private var layoutManagerJoinRoom: RecyclerView.LayoutManager? = null
    private var joinRoomRecyclerAdapter: RecyclerView.Adapter<JoinRoomRecyclerAdapter.ViewHolder>? = null


    lateinit var mSocket: Socket
    private var rooms = arrayListOf<Room>()

    lateinit var noRoom: TextView

    var isGameStarted: Boolean = false


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityJoinGameBinding.inflate(layoutInflater)
        setContentView(binding.root)

        noRoom = findViewById(R.id.textView5)

        mSocket = SocketHandler.getSocket()

        mSocket.emit("sendWaitingRooms")

        println("join room ID: "+mSocket.id())


        mSocket.on("hereAreTheActiveGames") { arg ->

            rooms.clear()

            if (arg[0] != null) {

                val data = arg[0] as JSONArray

                /*println("+++++++++++++++++++")
                println(data)
                println(data.length())*/

                var gson = Gson()

                for (i in 0 until data.length()) {
                    val jsonString = data[i].toString()
                    val room = gson.fromJson(jsonString, Room::class.java)

                    rooms.add(room)
                    //println(room)
                }

//                    notifyDataSetChanged()
                this@JoinGameActivity.runOnUiThread {
                    layoutManagerJoinRoom = LinearLayoutManager(this)
                    binding.joinRoomRecyclerView.layoutManager = layoutManagerJoinRoom
                    joinRoomRecyclerAdapter = JoinRoomRecyclerAdapter(rooms)
                    binding.joinRoomRecyclerView.adapter = joinRoomRecyclerAdapter
                }
            }
        }

        if(rooms.size == 0) noRoom.visibility = View.VISIBLE

        /*println("******")
        println(rooms)*/

        //rooms = (intent.getSerializableExtra("EXTRA_ROOMS") as? Room)!!

        var menuBtn = findViewById<Button>(R.id.home_button)

        menuBtn.setOnClickListener{
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }

    }

    override fun onButtonClick(gameState: Boolean) {
        isGameStarted = gameState
    }
}
