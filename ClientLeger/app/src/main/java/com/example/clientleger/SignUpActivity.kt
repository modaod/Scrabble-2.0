package com.example.clientleger

import android.content.ContentValues.TAG
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.bumptech.glide.Glide
import com.example.clientleger.databinding.ActivitySignUpBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserProfileChangeRequest
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.*
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase


class SignUpActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySignUpBinding
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase

    val avatars = arrayOf(
        "https://gravatar.com/avatar/32c1f46ca18a17c1c60c2ea77edba103?s=400&d=robohash&r=x",
        "https://gravatar.com/avatar/89e9857a48eeb89a90a7ed510bfdc83d?s=400&d=robohash&r=x",
        "https://gravatar.com/avatar/2c97ff5c64bbb2ee2dc6f12668d65fb4?s=400&d=robohash&r=x",
        "https://gravatar.com/avatar/49fe73f92973a64a7ba297ce5e809e34?s=400&d=robohash&r=x"
    )
    var avatarSelected = false
    private var selectedAvatar = ""

    // Get the selected radio button text using radio button on click listener
    fun radio_button_click(view: View) {
        // Get the clicked radio button instance
        val radio: RadioButton = findViewById(binding.radioAvatar.checkedRadioButtonId)
        //Toast.makeText(applicationContext, "On click : ${radio.text}", Toast.LENGTH_SHORT).show()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)


        binding = ActivitySignUpBinding.inflate(layoutInflater)
        setContentView(binding.root)

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database

        var imageView1 = binding.image1
        Glide.with(getApplicationContext()).load(avatars[0]).into(imageView1);

        var imageView2 = binding.image2
        Glide.with(getApplicationContext()).load(avatars[1]).into(imageView2);

        var imageView3 = binding.image3
        Glide.with(getApplicationContext()).load(avatars[2]).into(imageView3);

        var imageView4 = binding.image4
        Glide.with(getApplicationContext()).load(avatars[3]).into(imageView4);



//        binding.textView.setOnClickListener {
//            val intent = Intent(this, SignInActivity::class.java)
//            startActivity(intent)
//        }

        // Get radio group selected item using on checked change listener
/*        binding.radioAvatar.setOnCheckedChangeListener { group, checkedId ->
            val radio: RadioButton = findViewById(checkedId)
            Toast.makeText(applicationContext, " On checked change :" + " ${radio.text}", Toast.LENGTH_SHORT).show()
        }*/

        //binding.button.setBackgroundColor(Color.parseColor("#CCE0B7"))

        binding.button.setOnClickListener {
            val email = binding.emailEt.text.toString()
            val username = binding.usernameEt.text.toString()
            val pass = binding.passET.text.toString()
            val confirmPass = binding.confirmPassEt.text.toString()

            // Get the checked radio button id from radio group
            var id: Int = binding.radioAvatar.checkedRadioButtonId
            if (id != -1) { // If any radio button checked from radio group
                // Get the instance of radio button using id
                avatarSelected = true
                val radio: RadioButton = findViewById(id)
                selectedAvatar = radio.text.toString()
                //Toast.makeText(applicationContext,"On button click :" + " ${radio.text}", Toast.LENGTH_SHORT).show()
            } else {
                // If no radio button checked in this radio group
                //Toast.makeText(applicationContext,"On button click :" + " nothing selected", Toast.LENGTH_SHORT).show()
            }


            if (email.isNotEmpty() && pass.isNotEmpty() && confirmPass.isNotEmpty() && username.isNotEmpty() && avatarSelected) {
                if (pass == confirmPass) {
                    firebaseDatabase.reference.child("users").get().addOnSuccessListener {
                        var usernameExists = false
                        for (snapshot in it.children) {
                            Log.e(TAG, snapshot.toString() )
                            if (snapshot.key != null && !snapshot.key!!.equals("undefined")){
                                val value = snapshot.getValue<UserData>()
                                val usernameInDatabase = value?.username
                                if (usernameInDatabase == username) {
                                    usernameExists = true
                                }
                            }

                        }

                        if (!usernameExists) {
                            firebaseAuth.createUserWithEmailAndPassword(email, pass)
                                .addOnCompleteListener {
                                    if (it.isSuccessful) {

                                        val profileUpdates = UserProfileChangeRequest.Builder()
                                            .setDisplayName(username).build()
                                        firebaseAuth.currentUser?.updateProfile(profileUpdates)

//                                        var user = UserData(
//                                            firebaseAuth.currentUser?.uid.toString(),
//                                            username,
//                                            email,
//                                            avatars[selectedAvatar.toInt()],
//                                            "Offline",
//                                            "en",
//                                            "light",
//                                            arrayListOf<String?>(),
//                                            arrayListOf<String?>(),
//                                            arrayListOf<String?>(),
//                                            arrayListOf<String?>()
//                                        )
                                        var user = UserData()
                                        user.uid = firebaseAuth.currentUser?.uid.toString()
                                        user.username = username
                                        user.email = email
                                        user.avatarUrl = avatars[selectedAvatar.toInt()]
                                        user.status = "Offline"
                                        user.language = "en"
                                        user.theme = "light"
                                        user.friends = arrayListOf<String?>()
                                        user.incomingFriendRequests =arrayListOf<String?>()
                                        user.outgoingFriendRequests = arrayListOf<String?>()
                                        user.rankedLevel = "bronze"
                                        user.rankedPoints = 0

                                        firebaseDatabase.reference.child("users")
                                            .child(firebaseAuth.currentUser?.uid.toString())
                                            .setValue(user)

                                        val intent = Intent(this, SignInActivity::class.java)
                                        startActivity(intent)

                                    } else {
                                        Toast.makeText(
                                            this, it.exception.toString(), Toast.LENGTH_SHORT
                                        ).show()

                                    }
                                }
                        } else {
                            Toast.makeText(
                                this,
                                "The username already exists!!",
                                Toast.LENGTH_SHORT
                            )
                                .show()
                        }


                    }
                } else {
                    Toast.makeText(this, "Password is not matching", Toast.LENGTH_SHORT).show()
                }
            } else {
                Toast.makeText(this, "Empty Fields Are not Allowed !!", Toast.LENGTH_SHORT).show()

            }
        }
    }
}
