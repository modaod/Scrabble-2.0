package com.example.clientleger

import android.content.ContentValues.TAG
import android.graphics.Color
import android.text.Layout
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase
import com.squareup.picasso.Picasso

class OfflineRecyclerAdapter: RecyclerView.Adapter<OfflineRecyclerAdapter.ViewHolder> () {

    val avatars = arrayOf("https://gravatar.com/avatar/32c1f46ca18a17c1c60c2ea77edba103?s=400&d=robohash&r=x", "https://gravatar.com/avatar/89e9857a48eeb89a90a7ed510bfdc83d?s=400&d=robohash&r=x", "https://gravatar.com/avatar/2c97ff5c64bbb2ee2dc6f12668d65fb4?s=400&d=robohash&r=x", "https://gravatar.com/avatar/49fe73f92973a64a7ba297ce5e809e34?s=400&d=robohash&r=x")

    private var users = arrayListOf<UserData>(UserData())

    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase


    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OfflineRecyclerAdapter.ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.offline_card_layout, parent, false)
        return ViewHolder(v)
    }

    override fun getItemCount(): Int {
        return users.size
    }

    override fun onBindViewHolder(holder: OfflineRecyclerAdapter.ViewHolder, position: Int) {
        if (users.size != 0) {
            holder.itemTitle.text = users[position].username
            Picasso.get().load(users[position].avatarUrl).into(holder.itemImage)
        }
    }

    inner class ViewHolder(itemView: View): RecyclerView.ViewHolder(itemView) {
        var itemImage: ImageView
        var itemTitle: TextView
        var buttonRemove: ImageButton

        init {
            itemImage = itemView.findViewById(R.id.item_image)
            itemTitle = itemView.findViewById(R.id.item_title)
            buttonRemove = itemView.findViewById(R.id.removeButton)

            firebaseAuth = Firebase.auth
            firebaseDatabase = Firebase.database

            var currentUserId = firebaseAuth.currentUser?.uid.toString()

            val listener = object : ValueEventListener {
                override fun onDataChange(dataSnapshot: DataSnapshot) {
                    val user = dataSnapshot.getValue<UserData>()
                    users.clear()
                    notifyDataSetChanged()
                    if (user?.friends != null) {
                        for (uid in user.friends!!){
                            firebaseDatabase.reference.child("users").child(uid!!).child("status").get().addOnSuccessListener {
                                var status = it.value.toString()
                                if (status == "Offline"){
                                    firebaseDatabase.reference.child("users").child(uid).get().addOnSuccessListener {
                                        var user = it.getValue<UserData>()
                                        users.add(user!!)
                                        notifyDataSetChanged()
                                    }
                                }
                            }
                        }
                    }
                    users = ArrayList(users.distinct())

                }

                override fun onCancelled(error: DatabaseError) {

                }
            }

            firebaseDatabase.reference.child("users").child(currentUserId).addValueEventListener(listener)



            buttonRemove.setOnClickListener{
                val position: Int = bindingAdapterPosition

                var a = users[position].uid.toString()

                firebaseDatabase.reference.child("users").child(a).child("friends").get().addOnSuccessListener {
                    var friends = it.value as ArrayList<String>
                    var array_position = friends.indexOf(currentUserId)
                    firebaseDatabase.reference.child("users").child(a).child("friends").child(array_position.toString()).removeValue()
                }

                firebaseDatabase.reference.child("users").child(currentUserId).child("friends").get().addOnSuccessListener {
                    var friends = it.value as ArrayList<String>
                    var array_position = friends.indexOf(a)
                    firebaseDatabase.reference.child("users").child(currentUserId).child("friends").child(array_position.toString()).removeValue()
                }

            }

        }
    }

}
