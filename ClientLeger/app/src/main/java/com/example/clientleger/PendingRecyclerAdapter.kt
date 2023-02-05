package com.example.clientleger

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

class PendingRecyclerAdapter: RecyclerView.Adapter<PendingRecyclerAdapter.ViewHolder> () {

    val avatars = arrayOf("https://gravatar.com/avatar/32c1f46ca18a17c1c60c2ea77edba103?s=400&d=robohash&r=x", "https://gravatar.com/avatar/89e9857a48eeb89a90a7ed510bfdc83d?s=400&d=robohash&r=x", "https://gravatar.com/avatar/2c97ff5c64bbb2ee2dc6f12668d65fb4?s=400&d=robohash&r=x", "https://gravatar.com/avatar/49fe73f92973a64a7ba297ce5e809e34?s=400&d=robohash&r=x")

    private var users = arrayListOf<UserData>(UserData())

    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase



    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): PendingRecyclerAdapter.ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.pending_card_layout, parent, false)
        return ViewHolder(v)
    }

    override fun getItemCount(): Int {
        return users.size
    }

    override fun onBindViewHolder(holder: PendingRecyclerAdapter.ViewHolder, position: Int) {
        if (users.size != 0) {
            holder.itemTitle.text = users[position].username
            Picasso.get().load(users[position].avatarUrl).into(holder.itemImage);
        }

    }

    inner class ViewHolder(itemView: View): RecyclerView.ViewHolder(itemView) {
        var itemImage: ImageView
        var itemTitle: TextView
        var buttonAccept: ImageButton
        var buttonDeny: ImageButton

        init {
            itemImage = itemView.findViewById(R.id.item_image)
            itemTitle = itemView.findViewById(R.id.item_title)
            buttonAccept = itemView.findViewById(R.id.acceptButton)
            buttonDeny = itemView.findViewById(R.id.removeButton)

            firebaseAuth = Firebase.auth
            firebaseDatabase = Firebase.database

            var currentUserId = firebaseAuth.currentUser?.uid.toString()


            val listener = object : ValueEventListener {
                override fun onDataChange(dataSnapshot: DataSnapshot) {
                    val user = dataSnapshot.getValue<UserData>()
                    users.clear()
                    notifyDataSetChanged()
                    if (user?.incomingFriendRequests != null) {
                        for (uid in user?.incomingFriendRequests!!){
                            firebaseDatabase.reference.child("users").child(uid.toString()).get().addOnSuccessListener {
                                var user = it.getValue<UserData>()
                                users.add(user!!)
                                notifyDataSetChanged()

                            }
                        }
                    }
                    users = ArrayList(users.distinct())
                }

                override fun onCancelled(error: DatabaseError) {

                }
            }

            firebaseDatabase.reference.child("users").child(currentUserId).addValueEventListener(listener)


            buttonAccept.setOnClickListener{
                val position: Int = bindingAdapterPosition

                var a = users[position].uid.toString()

                firebaseDatabase.reference.child("users").child(users[position].uid.toString()).child("friends").get().addOnSuccessListener {
                    var friendsList = arrayListOf<String>()
                    for (snapshot in it.children) {
                        val value = snapshot.getValue()
                        friendsList.add(value.toString())
                    }
                    friendsList.add(currentUserId)
                    firebaseDatabase.reference.child("users").child(a).child("friends").setValue(friendsList)

                    firebaseDatabase.reference.child("users").child(currentUserId).child("friends").get().addOnSuccessListener {
                        var friendsList = arrayListOf<String>()
                        for (snapshot in it.children) {
                            val value = snapshot.getValue()
                            friendsList.add(value.toString())
                        }
                        friendsList.add(a)
                        firebaseDatabase.reference.child("users").child(currentUserId).child("friends").setValue(friendsList)

                    }
                }
                firebaseDatabase.reference.child("users").child(currentUserId).child("incomingFriendRequests").removeValue()
                firebaseDatabase.reference.child("users").child(users[position].uid.toString()).child("outgoingFriendRequests").removeValue()
                notifyDataSetChanged()
            }

            buttonDeny.setOnClickListener{
                val position: Int = bindingAdapterPosition

                firebaseDatabase.reference.child("users").child(currentUserId).child("incomingFriendRequests").get().addOnSuccessListener {
                    var friends = it.value as ArrayList<String>
                    var array_position = friends.indexOf(users[position].uid.toString())
                    firebaseDatabase.reference.child("users").child(currentUserId).child("incomingFriendRequests").child(array_position.toString()).removeValue()
                }

                firebaseDatabase.reference.child("users").child(users[position].uid.toString()).child("outgoingFriendRequests").get().addOnSuccessListener {
                    var friends = it.value as ArrayList<String>
                    var array_position = friends.indexOf(currentUserId)
                    firebaseDatabase.reference.child("users").child(users[position].uid.toString()).child("outgoingFriendRequests").child(array_position.toString()).removeValue()
                }

                notifyDataSetChanged()
            }
        }
    }

}
