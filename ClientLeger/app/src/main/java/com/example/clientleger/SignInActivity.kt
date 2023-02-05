package com.example.clientleger

import android.content.ContentValues.TAG
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.example.clientleger.databinding.ActivitySignInBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.*
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase
import java.time.LocalDateTime

class SignInActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySignInBinding
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySignInBinding.inflate(layoutInflater)
        setContentView(binding.root)


        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database

        binding.button2.setOnClickListener {
                val intent = Intent(this, SignUpActivity::class.java)
                startActivity(intent)
            }

            binding.button1.setOnClickListener {
                val email = binding.emailEt.text.toString()
                val pass = binding.passET.text.toString()

                if (email.isNotEmpty() && pass.isNotEmpty()) {


                    firebaseDatabase.reference.child("users").get().addOnSuccessListener {
                        for (snapshot in it.children) {
                            Log.e("Sign in", snapshot.value.toString())
                            val value = snapshot.getValue<UserData>()
                            val emailInDatabase = value?.email

                            if (email == emailInDatabase) {
                                var uid = value?.uid
                                var status = value?.status

                                if (status == "Offline") {
                                    firebaseAuth.signInWithEmailAndPassword(email, pass)
                                        .addOnCompleteListener {
                                            if (it.isSuccessful) {
                                                firebaseDatabase.reference.child("users").child(uid.toString())
                                                    .child("status").setValue("Online")
                                                val intent = Intent(this, MainActivity::class.java)
                                                startActivity(intent)
                                            } else {
                                                Toast.makeText(
                                                    this,
                                                    it.exception.toString(),
                                                    Toast.LENGTH_SHORT
                                                ).show()

                                            }
                                        }

                                    val date = LocalDateTime.now()
                                    var dateToSend = date.year.toString() + "-" + date.monthValue.toString() + "-" + date.dayOfMonth.toString() + " " + " " + date.hour.toString() +":"+ date.minute.toString()
                                    val myActivity = hashMapOf(
                                        "type" to "Connexion",
                                        "date" to dateToSend
                                    )
                                    if (value?.uid != null) {
                                        if (value.activity.isNullOrEmpty()){

                                            firebaseDatabase.reference.child("users").child(value!!.uid.toString()).child("activity").setValue(myActivity)
                                        }
                                        else{
                                            firebaseDatabase.reference.child("users").child(value.uid.toString()).child("activity").child(value!!.activity!!.size.toString()).setValue(
                                                myActivity
                                            )


                                        }
                                        firebaseDatabase.reference.child("users").child(uid.toString())
                                            .child("status").setValue("Online")

                                    }







                                } else {
                                    Toast.makeText(
                                        this,
                                        "You are already logged in on another device !!",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                }

                            }
                        }
                    }.addOnFailureListener {
                    }

                } else {
                    Toast.makeText(this, "Empty Fields Are not Allowed !!", Toast.LENGTH_SHORT)
                        .show()

                }
            }
        if (firebaseAuth.currentUser != null){
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
            Log.e(TAG, firebaseAuth.currentUser.toString())
        }
        }
    }
