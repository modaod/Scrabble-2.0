package com.example.clientleger

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.clientleger.databinding.ActivityFriendsBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase


class FriendsActivity : AppCompatActivity() {

    private var layoutManager1: RecyclerView.LayoutManager? = null
    private var layoutManager2: RecyclerView.LayoutManager? = null
    private var layoutManager3: RecyclerView.LayoutManager? = null

    private var pendingAdapter: RecyclerView.Adapter<PendingRecyclerAdapter.ViewHolder>? = null
    private var OnlineAdapter: RecyclerView.Adapter<OnlineRecyclerAdapter.ViewHolder>? = null
    private var OfflineAdapter: RecyclerView.Adapter<OfflineRecyclerAdapter.ViewHolder>? = null

    private lateinit var binding: ActivityFriendsBinding

    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase

    private lateinit var currentTheme: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        binding = ActivityFriendsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        layoutManager1 = LinearLayoutManager(this)
        layoutManager2 = LinearLayoutManager(this)
        layoutManager3 = LinearLayoutManager(this)

        binding.pendingFriendRequestsRecyclerView.layoutManager = layoutManager1
        pendingAdapter = PendingRecyclerAdapter()
        binding.pendingFriendRequestsRecyclerView.adapter = pendingAdapter

        binding.onlineFriendsRecyclerView.layoutManager = layoutManager2
        OnlineAdapter = OnlineRecyclerAdapter()
        binding.onlineFriendsRecyclerView.adapter = OnlineAdapter

        binding.offlineFriendsRecyclerView.layoutManager = layoutManager3
        OfflineAdapter = OfflineRecyclerAdapter()
        binding.offlineFriendsRecyclerView.adapter = OfflineAdapter

        binding.addFriendButton.setOnClickListener {
            val intent = Intent(this, AddFriendActivity::class.java)
            startActivity(intent)
        }

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database

        var currentUser = firebaseAuth.currentUser?.uid.toString()

        firebaseDatabase.reference.child("users").child(currentUser).child("theme").get().addOnSuccessListener {
            var theme = it.value.toString()

            if (theme == "#FFFFFF"){
                binding.background.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.textViewPending.setTextColor(Color.parseColor("#3A3B3C"))
                binding.textViewOnline.setTextColor(Color.parseColor("#3A3B3C"))
                binding.textViewOffline.setTextColor(Color.parseColor("#3A3B3C"))
                binding.pendingFriendRequestsRecyclerView.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.onlineFriendsRecyclerView.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.offlineFriendsRecyclerView.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.scrollviewBackground.setBackgroundColor(Color.parseColor("#FFFFFF"))
                currentTheme = "#FFFFFF"
            }else{
                binding.background.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.textViewPending.setTextColor(Color.parseColor("#FFFFFF"))
                binding.textViewOnline.setTextColor(Color.parseColor("#FFFFFF"))
                binding.textViewOffline.setTextColor(Color.parseColor("#FFFFFF"))
                binding.pendingFriendRequestsRecyclerView.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.onlineFriendsRecyclerView.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.offlineFriendsRecyclerView.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.scrollviewBackground.setBackgroundColor(Color.parseColor("#3A3B3C"))
                currentTheme = "#3A3B3C"
            }

        }

    }

    override fun onBackPressed() {
        val intent = Intent(this, MainActivity::class.java)
        startActivity(intent)
    }
}
