package com.example.clientleger

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import com.example.clientleger.databinding.ActivityEndGameBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase

class EndGameActivity : AppCompatActivity() {

    private lateinit var binding: ActivityEndGameBinding
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityEndGameBinding.inflate(layoutInflater)
        setContentView(binding.root)

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database



    }
}
