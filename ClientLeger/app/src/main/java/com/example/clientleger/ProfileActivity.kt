package com.example.clientleger

import android.app.Activity
import android.content.ContentValues.TAG
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.example.clientleger.databinding.ActivityProfileBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.auth.ktx.userProfileChangeRequest
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase


class ProfileActivity : AppCompatActivity() {
    private lateinit var binding: ActivityProfileBinding
    private lateinit var database: FirebaseDatabase
    private lateinit var auth: FirebaseAuth
    private var layoutManagerGameHistory: RecyclerView.LayoutManager? = null
    private var layoutManagerUserActivity: RecyclerView.LayoutManager? = null
    lateinit var usernameTextView: TextView
    lateinit var avatarImageView: ImageView
    lateinit var editAvatarIconView: ImageView
    lateinit var editUsernameIconView: ImageView
    lateinit var playedGamesStatistics: TextView
    lateinit var wonGamesStatistics: TextView
    lateinit var meanScoreStatistics: TextView
    lateinit var meanTimeStatistics: TextView
    lateinit var modifyAvatar: View
    lateinit var modifyUsername: View
    private lateinit var modifyAvatarSaveButton: Button
    private lateinit var modifyAvatarCancelButton: Button
    private lateinit var modifyUsernameSaveButton: Button
    private lateinit var modifyUsernameCancelButton: Button
    private lateinit var newUsernameInput:  EditText
    private lateinit var currentNewImageView: View
    private lateinit var currentNewImageViewUrl: String
    var image: Bitmap? = null
    private var gameHistoryRecyclerAdapter: RecyclerView.Adapter<GameHistoryRecyclerAdapter.ViewHolder>? = null
    private var userActivityRecyclerAdapter: RecyclerView.Adapter<UserActivityRecycler.ViewHolder>? = null
    var games: Array<GameInfos> = arrayOf<GameInfos>()
    lateinit var user : UserData


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityProfileBinding.inflate(layoutInflater)
        setContentView(binding.root)
        auth = Firebase.auth
        database = Firebase.database
        avatarImageView = findViewById(binding.avatar.id)
        editAvatarIconView = findViewById(binding.editAvatarIcon.id)

        usernameTextView = findViewById(binding.usernameUser.id)
        playedGamesStatistics = findViewById((binding.playedGamesStatistics.id))
        wonGamesStatistics = findViewById(binding.wonGamesStatistics.id)
        meanScoreStatistics = findViewById(binding.meanScoreStatistics.id)
        meanTimeStatistics = findViewById(binding.meanTimeStatistics.id)
        modifyAvatar = findViewById(binding.modifyAvatar.id)
        modifyAvatarSaveButton= findViewById(R.id.modifyAvatarSaveButton)
        modifyAvatarCancelButton = findViewById(R.id.modifyAvatarCancelButton)
        modifyUsernameSaveButton= findViewById(R.id.modifyUsernameSaveButton)
        modifyUsernameCancelButton = findViewById(R.id.modifyUsernameCancelButton)
        modifyUsername = findViewById(binding.modifyUsername.id)
        newUsernameInput = findViewById(binding.newUsernameInput.id)
        var dataLoaded: Boolean = false
        var meanScore = 0
        var wontGames  = 0
        var meanTime  = 0
        var  re =  Regex("^[\\w](?!.*?\\.{2})[\\w.]{1,28}[\\w]\$")

        Glide.with(this@ProfileActivity).load("https://gravatar.com/avatar/32c1f46ca18a17c1c60c2ea77edba103?s=400&d=robohash&r=x").into(binding.newAvatar1)
        Glide.with(this@ProfileActivity).load("https://gravatar.com/avatar/89e9857a48eeb89a90a7ed510bfdc83d?s=400&d=robohash&r=x").into(binding.newAvatar2)
        Glide.with(this@ProfileActivity).load("https://gravatar.com/avatar/2c97ff5c64bbb2ee2dc6f12668d65fb4?s=400&d=robohash&r=x").into(binding.newAvatar3)
        Glide.with(this@ProfileActivity).load("https://gravatar.com/avatar/49fe73f92973a64a7ba297ce5e809e34?s=400&d=robohash&r=x").into(binding.newAvatar4)




        val userListener = object : ValueEventListener {
            override fun onDataChange(dataSnapshot: DataSnapshot) {
                // Get Post object and use the values to update the UI

                user = dataSnapshot.getValue<UserData>()!!
                dataLoaded = true
                user.gamesPlayed?.forEach { game ->
                    meanScore += game?.score!!
                    meanTime += game.time!!
                    if(game.win!!){
                        wontGames ++
                    }


                }



                val imageView = findViewById<ImageView>(binding.avatar.id)
                usernameTextView.text = user!!.username
                wonGamesStatistics.text = wontGames.toString()
                if(user?.gamesPlayed != null){
                    meanScoreStatistics.text =  (meanScore / user?.gamesPlayed?.size!!).toString()
                    meanTimeStatistics.text =  (meanTime / user?.gamesPlayed?.size!!).toString() + " s"
                    playedGamesStatistics.text = user!!.gamesPlayed?.size.toString()

                }
                else{
                    meanScoreStatistics.text = 0.toString()
                    meanTimeStatistics.text =  0.toString() + " s"
                    playedGamesStatistics.text = 0.toString()

                }

                Glide.with(this@ProfileActivity).load(user!!.avatarUrl).into(imageView)
                dataLoaded = true
//                callViews()

            }

            override fun onCancelled(databaseError: DatabaseError) {
                // Getting Post failed, log a message
                Log.w(TAG, "loadPost:onCancelled", databaseError.toException())
            }
        }
        database.reference.child("users").child(auth.currentUser!!.uid).addValueEventListener(userListener)




// recycler part


        database.reference.child("users").child(auth.currentUser!!.uid).get().addOnSuccessListener {
                user = it.getValue<UserData>()!!
//                var gamesId = ArrayList<String>()
//                user.gamesPlayed?.forEach { game ->
//                    gamesId.add(game?.gameId!!)
//                }
                if(user.gamesPlayed != null ){



                    layoutManagerGameHistory = LinearLayoutManager(this)
                    user.gamesPlayed?.remove(null)

                    binding.gameHistoryRecyclerView.layoutManager = layoutManagerGameHistory
                    gameHistoryRecyclerAdapter = GameHistoryRecyclerAdapter(user.gamesPlayed as ArrayList<UserGame>)
                    binding.gameHistoryRecyclerView.adapter = gameHistoryRecyclerAdapter

                }
                else{

                }
                if(user.activity !=null){
                    layoutManagerUserActivity = LinearLayoutManager(this)
                    binding.userActivityRecyclerView.layoutManager = layoutManagerUserActivity
                    userActivityRecyclerAdapter = UserActivityRecycler(user.activity as ArrayList<UserActivity>)
                    binding.userActivityRecyclerView.adapter = userActivityRecyclerAdapter

                }


            }




        editAvatarIconView.setOnClickListener{
//            val intent = Intent(this, ModifyAvatar::class.java)
//            startActivity(intent)
            modifyAvatar.visibility = View.VISIBLE
        }

        modifyAvatarSaveButton.setOnClickListener {
            if(this::currentNewImageView.isInitialized){
                var update: MutableMap<String, Any> = hashMapOf("avatarUrl" to currentNewImageViewUrl)
                database.reference.child("users").child(auth.currentUser!!.uid).updateChildren(update)
                modifyAvatar.visibility = View.GONE



            }
            else{
                Toast.makeText(this,"Select you avatar",Toast.LENGTH_LONG ).show()


            }

        }


        modifyAvatarCancelButton.setOnClickListener {
            modifyAvatar.visibility = View.GONE
        }
        usernameTextView.setOnClickListener {
            modifyUsername.visibility = View.VISIBLE
        }
        modifyUsernameCancelButton.setOnClickListener{
            val inputMethodManager = getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
            inputMethodManager.hideSoftInputFromWindow(it.windowToken, 0)
            modifyUsername.visibility = View.GONE
        }
        modifyUsernameSaveButton.setOnClickListener{event->
            if(!newUsernameInput.text.equals("")){

                database.reference.child("users").get().addOnSuccessListener {
                    var usernameExists = false
                    for (snapshot in it.children) {
                        Log.e(TAG, snapshot.toString())
                        val value = snapshot.getValue<UserData>()
                        val usernameInDatabase = value?.username
                        if (usernameInDatabase == newUsernameInput.text.toString()) {
                            usernameExists = true
                        }
                    }

                    if (!usernameExists) {

                        var update: MutableMap<String, Any> = hashMapOf("username" to newUsernameInput.text.toString())
                        database.reference.child("users").child(auth.currentUser!!.uid).updateChildren(update).addOnSuccessListener {

                            val profileUpdates = userProfileChangeRequest {
                                displayName = newUsernameInput.text.toString()
                            }

                            auth.currentUser!!.updateProfile(profileUpdates)
                                .addOnCompleteListener { task ->
                                    if (task.isSuccessful) {
                                        Log.d(TAG, "User profile updated.")
                                    }
                                }

                        }
                        val inputMethodManager = getSystemService(Activity.INPUT_METHOD_SERVICE) as InputMethodManager
                        inputMethodManager.hideSoftInputFromWindow(event.windowToken, 0)
                        modifyUsername.visibility = View.GONE


                    } else {
                        Toast.makeText(
                            this,
                            "The username already exists!!",
                            Toast.LENGTH_SHORT
                        )
                            .show()
                    }


                }


            }
            else{
                Toast.makeText(this,"Wrong username",Toast.LENGTH_LONG ).show()
            }
        }


//        var newAvatarList = arrayListOf(binding.newAvatar1, binding.newAvatar2, binding.newAvatar3, binding.newAvatar4)
//        for (image in newAvatarList){
//            if image.
//        }

        binding.newAvatar1.setOnClickListener{
            if(this::currentNewImageView.isInitialized){
                currentNewImageView.setBackgroundColor(0x00000000)

            }
            currentNewImageView = it
            currentNewImageViewUrl = "https://gravatar.com/avatar/32c1f46ca18a17c1c60c2ea77edba103?s=400&d=robohash&r=x"
            it.setBackgroundColor(Color.parseColor("#CCE0B7"))


        }
        binding.newAvatar2.setOnClickListener{
            if(this::currentNewImageView.isInitialized){
                currentNewImageView.setBackgroundColor(0x00000000)

            }
            currentNewImageView = it
            currentNewImageViewUrl = "https://gravatar.com/avatar/89e9857a48eeb89a90a7ed510bfdc83d?s=400&d=robohash&r=x"
            it.setBackgroundColor(Color.parseColor("#CCE0B7"))
        }



        binding.newAvatar3.setOnClickListener{
            if(this::currentNewImageView.isInitialized){
                currentNewImageView.setBackgroundColor(0x00000000)

            }
            currentNewImageView = it
            currentNewImageViewUrl = "https://gravatar.com/avatar/2c97ff5c64bbb2ee2dc6f12668d65fb4?s=400&d=robohash&r=x"
            it.setBackgroundColor(Color.parseColor("#CCE0B7"))
        }
        binding.newAvatar4.setOnClickListener{
            if(this::currentNewImageView.isInitialized){
                currentNewImageView.setBackgroundColor(0x00000000)

            }
            currentNewImageView = it
            currentNewImageViewUrl = "https://gravatar.com/avatar/49fe73f92973a64a7ba297ce5e809e34?s=400&d=robohash&r=x"
            it.setBackgroundColor(Color.parseColor("#CCE0B7"))
        }





    }

    fun snapshotToArrayActivity(snapshot: DataSnapshot){
        val returnArray = ArrayList<Activity>()
        for (elem in snapshot.children) {
//            Log.e(TAG, snapshot.toString())
            val value = elem.getValue<Activity>()
            if (value != null) {
                returnArray.add(value)
            }

        }



    }

    fun snapshotToArrayGames(snapshot: DataSnapshot){
        val returnArray = ArrayList<UserGame>()
        for (elem in snapshot.children) {
//            Log.e(TAG, snapshot.toString())
            val value = elem.getValue<UserGame>()
            if (value != null) {
                returnArray.add(value)
            }

        }



    }


}
