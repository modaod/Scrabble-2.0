package com.example.clientleger

import android.content.ContentValues
import android.content.ContentValues.TAG
import android.icu.text.Transliterator.Position
import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase

class GameHistoryRecyclerAdapter(games : ArrayList<UserGame>) : RecyclerView.Adapter<GameHistoryRecyclerAdapter.ViewHolder>() {
    private lateinit var database : FirebaseDatabase
    private lateinit var auth: FirebaseAuth
    var games: ArrayList<UserGame> = games



    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): GameHistoryRecyclerAdapter.ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.activity_game_history_recycler_adapter, parent, false)
    return ViewHolder(v)

    }
    override fun getItemCount(): Int {
        return games.size
    }
    override fun onBindViewHolder(holder: GameHistoryRecyclerAdapter.ViewHolder, position: Int) {
        holder.gameDate.text = games[position].date
        holder.gameOpponents.text = games[position].opponents
        holder.gamesScore.text = games[position].score.toString()
        holder.gameResult.text = if(games[position].win!!)  "vous avez gagner" else "vous avez perdu"

    }

    inner class ViewHolder(itemView: View): RecyclerView.ViewHolder(itemView) {
//        var itemImage: ImageView
        var gameDate: TextView
        var gameResult: TextView
        var gameOpponents: TextView
        var gamesScore : TextView
//        var buttonDeny: Button

        init {

            auth = Firebase.auth
            database = Firebase.database
//            itemImage = itemView.findViewById(R.id.item_image)
            gameDate = itemView.findViewById(R.id.gameHistoryDate)
//            buttonDeny = itemView.findViewById(R.id.denyButton)
            gameResult = itemView.findViewById(R.id.gameHistoryResult)
            gameOpponents = itemView.findViewById(R.id.gameHistoryOpponents)
            gamesScore = itemView.findViewById(R.id.gameHistoryScore)



        }
    }
}
