package com.example.clientleger

import android.app.Activity
import android.content.ContentValues.TAG
import android.graphics.Color
import android.text.Layout
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
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
import android.content.SharedPreferences
import android.opengl.Visibility
import androidx.core.content.ContextCompat
import java.security.AccessController.getContext


class ChatBoxAdapter: RecyclerView.Adapter<ChatBoxAdapter.ViewHolder> () {

    val avatars = arrayOf("https://gravatar.com/avatar/32c1f46ca18a17c1c60c2ea77edba103?s=400&d=robohash&r=x", "https://gravatar.com/avatar/89e9857a48eeb89a90a7ed510bfdc83d?s=400&d=robohash&r=x", "https://gravatar.com/avatar/2c97ff5c64bbb2ee2dc6f12668d65fb4?s=400&d=robohash&r=x", "https://gravatar.com/avatar/49fe73f92973a64a7ba297ce5e809e34?s=400&d=robohash&r=x")

    private var messages = arrayListOf<PmMessageData>(PmMessageData())

    private var selected = ""

    private var temp_array = arrayListOf<PmMessageData>()
    private var temp_selected = ""

    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase


    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ChatBoxAdapter.ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.chat_message_card_layout, parent, false)
        return ViewHolder(v)
    }

    override fun getItemCount(): Int {
        return messages.size
    }

    override fun onBindViewHolder(holder: ChatBoxAdapter.ViewHolder, position: Int) {
        if (messages.size != 0) {
            val currentUser = firebaseAuth.currentUser?.uid.toString()

            var message_sender_uid = messages[position].uid

            firebaseDatabase.reference.child("users").child(message_sender_uid.toString())
                .child("username").get().addOnSuccessListener {
                var username = it.value.toString()

            if (message_sender_uid == currentUser) {
                holder.card.setBackgroundColor(Color.parseColor("#CCE0B7"))
                firebaseDatabase.reference.child("users").child(currentUser).child("avatarUrl")
                    .get().addOnSuccessListener {
                    var avatar = it.value.toString()
                    Picasso.get().load(avatar).into(holder.itemImage)
                }
            } else {
                holder.card.setBackgroundColor(Color.parseColor("#d3b1a7"))

                firebaseDatabase.reference.child("users").get().addOnSuccessListener {
                    var users = it.children
                    for (data in users) {
                        var user = data.getValue<UserData>()
                        if (user?.username == username) {
                            val uid = user?.uid.toString()
                            firebaseDatabase.reference.child("users").child(uid).child("avatarUrl")
                                .get().addOnSuccessListener {
                                var avatar = it.value.toString()
                                Picasso.get().load(avatar).into(holder.itemImage)
                            }
                        }
                    }
                }
            }
            holder.itemTitle.text = username
            holder.itemTimestamp.text = messages[position].time

            if (messages[position].picture == true) {
                Picasso.get().load(messages[position].message).into(holder.itemPicture)
                holder.itemPicture.visibility = View.VISIBLE
            } else {
                holder.itemMessage.text = messages[position].message
                holder.itemPicture.visibility = View.GONE
            }
                }
        }
    }

    inner class ViewHolder(itemView: View): RecyclerView.ViewHolder(itemView) {
        var itemImage: ImageView
        var itemPicture: ImageView
        var itemTitle: TextView
        var itemTimestamp: TextView
        var itemMessage: TextView
        var card: View

        init {
            itemImage = itemView.findViewById(R.id.item_image)
            itemPicture = itemView.findViewById(R.id.item_picture)
            itemTitle = itemView.findViewById(R.id.item_title)
            itemTimestamp = itemView.findViewById(R.id.item_timestamp)
            itemMessage = itemView.findViewById(R.id.item_message)
            card = itemView.findViewById(R.id.chat_message_card_view)

            firebaseAuth = Firebase.auth
            firebaseDatabase = Firebase.database

            var currentUserId = firebaseAuth.currentUser?.uid.toString()


            val listener1 = object : ValueEventListener {
                override fun onDataChange(dataSnapshot: DataSnapshot) {
                    temp_selected = selected
                    temp_array.clear()
                    for (data in dataSnapshot.children) {
                        val message = data.getValue<PmMessageData>()
                        if (message != null) {
                            temp_array.add(message)
                        }
                    }

                    notifyDataSetChanged()

                    if (temp_array != messages || messages.size == 0 || temp_array.size == 0 || selected != temp_selected) {
                        messages.clear()
                        messages = temp_array
                        notifyDataSetChanged()
                    }
                }

                override fun onCancelled(error: DatabaseError) {

                }
            }

            val currentUser = firebaseAuth.currentUser?.uid.toString()

            val listener2 = object : ValueEventListener {
                override fun onDataChange(dataSnapshot: DataSnapshot) {
                    var selected_dm_uid = dataSnapshot.value.toString()
                    temp_selected = selected_dm_uid
                    if (selected != temp_selected) {
                        if (selected_dm_uid != null && selected_dm_uid != currentUser) {
                            firebaseDatabase.reference.child("users").child(selected_dm_uid).get().addOnSuccessListener {
                                messages.clear()
                                temp_array.clear()
                                var friend = it.getValue<UserData>()
                                firebaseDatabase.reference.child("users").child(currentUserId).child("chat").child(friend?.uid.toString()).addValueEventListener(listener1)
                            }
                        }else if (selected_dm_uid == null || selected_dm_uid == currentUser){
                            messages.clear()
                            notifyDataSetChanged()
                        }
                        selected = temp_selected
                    }

                }

                override fun onCancelled(error: DatabaseError) {

                }
            }

            firebaseDatabase.reference.child("users").child(currentUser).child("selected_dm").addValueEventListener(listener2)


        }
    }

}
