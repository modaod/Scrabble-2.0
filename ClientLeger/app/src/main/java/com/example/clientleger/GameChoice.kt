package com.example.clientleger

import android.content.Intent
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.clientleger.databinding.ActivityGameChoiceBinding
import io.socket.client.Socket

class GameChoice : AppCompatActivity() {
    private lateinit var binding: ActivityGameChoiceBinding
    lateinit var mSocket: Socket
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        mSocket = SocketHandler.getSocket()
        println(mSocket.id())



        binding = ActivityGameChoiceBinding.inflate(layoutInflater)
        setContentView(binding.root)
//        setContentView(R.layout.activity_game_choice)
        binding.createButton.setOnClickListener {
            println("game choice ID: " + mSocket.id())
            startActivity(Intent(this, CreateGameActivity::class.java))
            finish()
        }
        binding.joinButton.setOnClickListener {
            startActivity(Intent(this, JoinGameActivity::class.java))
            finish()
        }
        binding.homeButton.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
    }
}
