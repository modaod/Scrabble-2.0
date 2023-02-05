package com.example.clientleger

import android.graphics.Color
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Toast
import com.example.clientleger.databinding.ActivityAddFriendBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase

class AddFriendActivity : AppCompatActivity() {

    private lateinit var binding: ActivityAddFriendBinding
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase

    private lateinit var currentTheme: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityAddFriendBinding.inflate(layoutInflater)
        setContentView(binding.root)

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database

        var currentUserId = firebaseAuth.currentUser?.uid.toString()

        firebaseDatabase.reference.child("users").child(currentUserId).child("theme").get().addOnSuccessListener {
            var theme = it.value.toString()

            if (theme == "#FFFFFF"){
                binding.background.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.textViewAddViaUsername.setTextColor(Color.parseColor("#3A3B3C"))
                binding.typeUsernameEt.setTextColor(Color.parseColor("#3A3B3C"))
                binding.typeUsernameEt.setHintTextColor(Color.parseColor("#3A3B3C"))
                currentTheme = "#FFFFFF"
            }else{
                binding.background.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.textViewAddViaUsername.setTextColor(Color.parseColor("#FFFFFF"))
                binding.typeUsernameEt.setTextColor(Color.parseColor("#FFFFFF"))
                binding.typeUsernameEt.setHintTextColor(Color.parseColor("#FFFFFF"))
                binding.typeUsernameEt.setBackgroundColor(Color.parseColor("#FFFFFF"))
                currentTheme = "#3A3B3C"
            }

        }

        binding.button.setOnClickListener {
            val username = binding.typeUsernameEt.text.toString()

            firebaseDatabase.reference.child("users").get().addOnSuccessListener { it1 ->
                var found = false
                for (snapshot in it1.children) {
                    val value = snapshot.getValue<UserData>()
                    val usernameInDatabase = value?.username
                    if (username == usernameInDatabase) {
                        if (username != firebaseAuth.currentUser?.displayName.toString()) {

                        var uid = value?.uid.toString()
                        found = true

                        firebaseDatabase.reference.child("users").child(currentUserId)
                            .child("outgoingFriendRequests").get().addOnSuccessListener { it2 ->
                            var currentRequests = arrayListOf<String>()
                            var already_sent = false
                            for (snapshot in it2.children) {
                                val value = snapshot.getValue().toString()
                                if (uid == value) {
                                    already_sent = true
                                }
                            }
                            if (!already_sent) {
                                currentRequests.add(uid)
                            } else {
                                Toast.makeText(
                                    this,
                                    "You already have a pending request to this user!",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                            firebaseDatabase.reference.child("users").child(currentUserId)
                                .child("outgoingFriendRequests").setValue(currentRequests)
                        }

                        firebaseDatabase.reference.child("users").child(uid)
                            .child("incomingFriendRequests").get().addOnSuccessListener { it2 ->
                            var currentRequests = arrayListOf<String>()
                            var already_sent = false
                            for (snapshot in it2.children) {
                                val value = snapshot.getValue().toString()
                                if (uid == value) {
                                    already_sent = true
                                }
                            }
                            if (!already_sent) {
                                currentRequests.add(currentUserId)
                                Toast.makeText(this, "Friend request sent!", Toast.LENGTH_SHORT)
                                    .show()
                            } else {
                                Toast.makeText(
                                    this,
                                    "This user already has a pending request from you!",
                                    Toast.LENGTH_SHORT
                                ).show()
                            }
                            firebaseDatabase.reference.child("users").child(uid)
                                .child("incomingFriendRequests").setValue(currentRequests)
                        }

                    } else {
                            Toast.makeText(this, "You cannot add yourself!", Toast.LENGTH_SHORT).show()
                    }
                    }
                }
                if (!found) {
                    Toast.makeText(this, "The user does not exist!", Toast.LENGTH_SHORT).show()
                }
            }

        }


    }
}
