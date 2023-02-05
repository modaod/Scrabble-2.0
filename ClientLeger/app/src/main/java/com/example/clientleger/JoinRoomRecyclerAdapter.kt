package com.example.clientleger

import android.content.Intent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase
import com.squareup.picasso.Picasso
import io.socket.client.Socket


class JoinRoomRecyclerAdapter(rooms: ArrayList<Room>): RecyclerView.Adapter<JoinRoomRecyclerAdapter.ViewHolder> () {

    lateinit var mSocket: Socket
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase

    var roomArrey: ArrayList<Room> = rooms


    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): JoinRoomRecyclerAdapter.ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.joinroom_card_layout, parent, false)
        return ViewHolder(v)
    }

    override fun getItemCount(): Int {
        return roomArrey.size
    }

    override fun onBindViewHolder(holder: JoinRoomRecyclerAdapter.ViewHolder, position: Int) {
        println("==============")
        println(roomArrey)
        println(roomArrey.size)

        if (roomArrey.size != 0) {
            //Picasso.get().load(users[position].avatarUrl).into(holder.itemImage);

            when(roomArrey[position].users?.size) {
                1 -> {
                    holder.player01.visibility = View.GONE
                    holder.player02.visibility = View.GONE
                    holder.player03.visibility = View.GONE

                    holder.roomName.text = roomArrey[position].roomName.toString()

                    holder.hostUsername.text = roomArrey[position].hostName.toString()
                    holder.hostUsertype.text = roomArrey[position].users!![0]?.userType.toString()
                    holder.minute.text = roomArrey[position].timer?.minute.toString()
                    holder.second.text = roomArrey[position].timer?.second.toString()
                    Picasso.get().load(roomArrey[position].users!![0]?.avatar).into(holder.hostAvatar)
                }

                2 -> {
                    holder.player01.visibility = View.GONE
                    holder.player02.visibility = View.VISIBLE
                    holder.player03.visibility = View.GONE

                    holder.roomName.text = roomArrey[position].roomName.toString()

                    holder.hostUsername.text = roomArrey[position].hostName.toString()
                    holder.hostUsertype.text = roomArrey[position].users!![0]?.userType.toString()
                    holder.minute.text = roomArrey[position].timer?.minute.toString()
                    holder.second.text = roomArrey[position].timer?.second.toString()
                    Picasso.get().load(roomArrey[position].users!![0]?.avatar).into(holder.hostAvatar)

                    holder.usernamePlayer02.text = roomArrey[position].users!![1]?.username.toString()
                    holder.usertypePlayer02.text = roomArrey[position].users!![1]?.userType.toString()
                    Picasso.get().load(roomArrey[position].users!![1]?.avatar).into(holder.avatarPlayer02)
                }

                3 -> {
                    holder.player01.visibility = View.VISIBLE
                    holder.player02.visibility = View.GONE
                    holder.player03.visibility = View.VISIBLE

                    holder.roomName.text = roomArrey[position].roomName.toString()

                    holder.hostUsername.text = roomArrey[position].hostName.toString()
                    holder.hostUsertype.text = roomArrey[position].users!![0]?.userType.toString()
                    holder.minute.text = roomArrey[position].timer?.minute.toString()
                    holder.second.text = roomArrey[position].timer?.second.toString()
                    Picasso.get().load(roomArrey[position].users!![0]?.avatar).into(holder.hostAvatar)

                    holder.usernamePlayer01.text = roomArrey[position].users!![1]?.username.toString()
                    holder.usertypePlayer01.text = roomArrey[position].users!![1]?.userType.toString()
                    Picasso.get().load(roomArrey[position].users!![1]?.avatar).into(holder.avatarPlayer01)

                    holder.usernamePlayer03.text = roomArrey[position].users!![2]?.username.toString()
                    holder.usertypePlayer03.text = roomArrey[position].users!![2]?.userType.toString()
                    Picasso.get().load(roomArrey[position].users!![2]?.avatar).into(holder.avatarPlayer03)
                }

                4 -> {
                    holder.player01.visibility = View.VISIBLE
                    holder.player02.visibility = View.VISIBLE
                    holder.player03.visibility = View.VISIBLE

                    holder.roomName.text = roomArrey[position].roomName.toString()

                    holder.hostUsername.text = roomArrey[position].hostName.toString()
                    holder.hostUsertype.text = roomArrey[position].users!![0]?.userType.toString()
                    holder.minute.text = roomArrey[position].timer?.minute.toString()
                    holder.second.text = roomArrey[position].timer?.second.toString()
                    Picasso.get().load(roomArrey[position].users!![0]?.avatar).into(holder.hostAvatar)

                    holder.usernamePlayer01.text = roomArrey[position].users!![1]?.username.toString()
                    holder.usertypePlayer01.text = roomArrey[position].users!![1]?.userType.toString()
                    Picasso.get().load(roomArrey[position].users!![1]?.avatar).into(holder.avatarPlayer01)

                    holder.usernamePlayer02.text = roomArrey[position].users!![2]?.username.toString()
                    holder.usertypePlayer02.text = roomArrey[position].users!![2]?.userType.toString()
                    Picasso.get().load(roomArrey[position].users!![2]?.avatar).into(holder.avatarPlayer02)

                    holder.usernamePlayer03.text = roomArrey[position].users!![3]?.username.toString()
                    holder.usertypePlayer03.text = roomArrey[position].users!![3]?.userType.toString()
                    Picasso.get().load(roomArrey[position].users!![3]?.avatar).into(holder.avatarPlayer03)
                }
            }

            holder.joinButton.setOnClickListener {
                val roomName  = roomArrey[position].roomName.toString()
                val roomVisibility  = roomArrey[position].roomVisibility.toString()

                if(roomVisibility == "public" && (roomArrey[position].password != null)) {

                }

                //mSocket.emit("joinRoom", holder.currentUserId, roomName, true)
                mSocket.emit("joinRoom", "Cco0hrUW7WUbGqplFu74ffFWinb2", roomName, true)

                val intent = Intent(it.context, WaitingRoom::class.java)
                intent.putExtra("isHostPlayer",false)
                if (roomVisibility == "private") {
                    intent.putExtra("isPrivateRoom",true)
                } else {
                    intent.putExtra("isPrivateRoom",false)
                }
                intent.putExtra("roomName",roomName)
                intent.putExtra("isPlayer", true)
                it.context.startActivity(intent)
            }

            holder.observeButton.setOnClickListener {
                val roomName  = roomArrey[position].roomName.toString()
                mSocket.emit("joinRoom", "Cco0hrUW7WUbGqplFu74ffFWinb2", roomName, false)
//                val isGameStarted = roomArrey[position].isGameStarted
//                val roomName  = roomArrey[position].roomName.toString()
//                mSocket.emit("joinRoom", holder.currentUserId, roomName, false)
//                val intent = Intent(it.context, WaitingRoom::class.java)

//                intent.putExtra("isPlayer", false)
//                intent.putExtra("isGameStarted", isGameStarted)
//                it.context.startActivity(intent)
                val intent = Intent(it.context, WaitingRoom::class.java)
                intent.putExtra("isHostPlayer",false)
                intent.putExtra("isPlayer",false)
                intent.putExtra("isObserver", true)
                intent.putExtra("roomName", roomName)
                it.context.startActivity(intent)

            }
        }
    }

    inner class ViewHolder(itemView: View): RecyclerView.ViewHolder(itemView) {

        var roomName: TextView
        var hostAvatar: ImageView
        var hostUsername: TextView
        var hostUsertype: TextView
        var minute: TextView
        var second: TextView

        var player01: LinearLayout
        var avatarPlayer01: ImageView
        var usernamePlayer01: TextView
        var usertypePlayer01: TextView

        var player02: LinearLayout
        var avatarPlayer02: ImageView
        var usernamePlayer02: TextView
        var usertypePlayer02: TextView

        var player03: LinearLayout
        var avatarPlayer03: ImageView
        var usernamePlayer03: TextView
        var usertypePlayer03: TextView

        var joinButton: Button
        var observeButton: Button

        var currentUserId: String

//        lateinit var observer: OnJoinButtonClickListener


        init {
            roomName = itemView.findViewById(R.id.room_name)

            hostAvatar = itemView.findViewById(R.id.host_avatar)
            hostUsername = itemView.findViewById(R.id.host_username)
            hostUsertype = itemView.findViewById(R.id.host_usertype)
            minute = itemView.findViewById(R.id.minute)
            second = itemView.findViewById(R.id.second)

            player01 = itemView.findViewById(R.id.player01)
            avatarPlayer01 = itemView.findViewById(R.id.player01_avatar)
            usernamePlayer01 = itemView.findViewById(R.id.player01_username)
            usertypePlayer01 = itemView.findViewById(R.id.player01_type)

            player02 = itemView.findViewById(R.id.player02)
            avatarPlayer02 = itemView.findViewById(R.id.player02_avatar)
            usernamePlayer02 = itemView.findViewById(R.id.player02_username)
            usertypePlayer02 = itemView.findViewById(R.id.player02_type)

            player03 = itemView.findViewById(R.id.player03)
            avatarPlayer03 = itemView.findViewById(R.id.player03_avatar)
            usernamePlayer03 = itemView.findViewById(R.id.player03_username)
            usertypePlayer03 = itemView.findViewById(R.id.player03_type)

            joinButton = itemView.findViewById(R.id.go_wainting_room_button)
            observeButton = itemView.findViewById(R.id.observeButton)

            firebaseAuth = Firebase.auth
            firebaseDatabase = Firebase.database
            currentUserId = firebaseAuth.currentUser?.uid.toString()

//            observer = new OnJoinButtonClickListener()

            mSocket = SocketHandler.getSocket()

//            for (room in roomArrey) {
//                val gamestarted = room.isGameStarted
//                firebaseDatabase.reference.child("rooms").child(ROOMUID).child("isGameStarted").setValue(gamestarted)
//
//            }
//            observeButton.setOnClickListener{
//                val position: Int = bindingAdapterPosition
//
//            }

        }
    }

    interface OnJoinButtonClickListener {
        fun onButtonClick(gameState: Boolean)
    }
}


