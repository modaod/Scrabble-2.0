package com.example.clientleger

import android.content.Intent
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doAfterTextChanged
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import com.example.clientleger.databinding.ActivityCreateGameBinding

class CreateGameActivity : AppCompatActivity() {

    var roomVisibility: String = "public"
    var passwordCheckbox: Boolean = false
    lateinit var timer: Timer
    lateinit var timerTextView: TextView
    lateinit var item: MenuItem
    lateinit var timerSubtractButton: Button
    lateinit var timerAddButton: Button
    lateinit var createButton: Button
    lateinit var backButton: Button
    lateinit var roomNameEditText: EditText
    lateinit var passwordInput: EditText


    lateinit var mSocket: Socket

    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase
    private lateinit var binding: ActivityCreateGameBinding


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityCreateGameBinding.inflate(layoutInflater)
        setContentView(binding.root)

        timer = Timer()
        timerTextView = findViewById(binding.timerTextView.id)
        timerTextView.text = "1:00"
        timerSubtractButton = findViewById(binding.timerSubtractButton.id)
        timerAddButton = findViewById(binding.timerAddButton.id)
        createButton = findViewById(binding.createRoomButton.id)
        backButton = findViewById(binding.homeButton.id)
        roomNameEditText = findViewById(binding.roomNameInput.id)
        passwordInput = findViewById(binding.passwordInput.id)

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database

        val currentUserId = firebaseAuth.currentUser?.uid.toString()


        mSocket = SocketHandler.getSocket()
        println("create room ID: "+mSocket.id())

        //createButton.isEnabled = false

        mSocket.emit("getDictionaryList")
        //mSocket.on("dictionaryList") { args ->
        //    createButton.isEnabled = true
        //}

        val roomVisibilitySpinner = findViewById<View>(binding.roomVisibilitySelect.id) as Spinner
        roomVisibilitySpinner.setOnItemSelectedListener(object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, pos: Int, id: Long) {
                val passwordContainer = findViewById<View>(binding.passwordContainer.id) as LinearLayout
                if (pos == 0) {
                    roomVisibility = "public"
                    passwordContainer.visibility = View.VISIBLE
                } else {
                    roomVisibility = "private"
                    passwordContainer.visibility = View.GONE
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        })

        val passwordSwitch = findViewById<View>(binding.passwordSwitch.id) as Switch
        passwordSwitch.setOnCheckedChangeListener(CompoundButton.OnCheckedChangeListener { _, isChecked ->
            passwordCheckbox = isChecked
            passwordInput.visibility = if(isChecked) View.VISIBLE else View.INVISIBLE
        })

        fun printTimer() {
            if (timer.second < 10) {
                timerTextView.text = timer.minute.toString() + ":0" + timer.second.toString()
            }
            else {
                timerTextView.text = timer.minute.toString() + ":" + timer.second.toString()
            }
        }

        timerAddButton.setOnClickListener {
            timer.second += 30
            if (timer.second / 60 == 1) {
                timer.second = 0
                timer.minute++
                timerAddButton.isEnabled = true
            }
            if (timer.minute >= 5) {
                timerAddButton.isEnabled = false
            }
            printTimer()
        }

        timerSubtractButton.setOnClickListener {
            timer.second -= 30
            if (timer.second == -30) {
                timer.second = 30
                timer.minute--
                timerSubtractButton.isEnabled = true
            }
            if (timer.minute == 0 && timer.second <= 30) {
                timerSubtractButton.isEnabled = false
            }
            printTimer()
        }

        createButton.setOnClickListener {
            if (roomNameEditText.text.trim() != "") {
                val roomName: String = roomNameEditText.text.trim().toString()
                val timerObject = JSONObject()
                timerObject.put("minute", timer.minute)
                timerObject.put("second", timer.second)

                val gameSettings = JSONObject()
                gameSettings.put("roomName", roomName)
                // gameSettings.put("virtualPlayerName", null)
                gameSettings.put("isSoloMode", false)
                // gameSettings.put("isEasyMode", null)
                gameSettings.put("timer", timerObject)
                gameSettings.put("dictionnaire", "Mon dictionnaire")
                gameSettings.put("gameType", "Classic")
                gameSettings.put("roomVisibility", roomVisibility)
                // gameSettings.put("password", null)

                if (roomVisibility == "public" && passwordCheckbox) {
                    gameSettings.put("password", passwordInput.text)
                }
                //mSocket.emit("createMultiRoom", gameSettings, currentUserId)
                mSocket.emit("createMultiRoom", gameSettings, "Cco0hrUW7WUbGqplFu74ffFWinb2")
                println("SOCKET ID CREATE ROOM : " + mSocket.id())
                val intent = Intent(this@CreateGameActivity,WaitingRoom::class.java)
                intent.putExtra("isHostPlayer",true)
                intent.putExtra("isPlayer",true)
                if (roomVisibility == "private") {
                    intent.putExtra("isPrivateRoom",true)
                } else {
                    intent.putExtra("isPrivateRoom",false)
                }
                intent.putExtra("roomName",roomName)
                startActivity(intent)
            }
        }

        backButton.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
    }
}
