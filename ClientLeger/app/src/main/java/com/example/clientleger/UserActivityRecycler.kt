package com.example.clientleger

import android.content.ContentValues.TAG
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView



class UserActivityRecycler(userActivities : ArrayList<UserActivity>) : RecyclerView.Adapter<UserActivityRecycler.ViewHolder>() {

    var userActivities : ArrayList<UserActivity> = userActivities


    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): UserActivityRecycler.ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.activity_user_recycler, parent, false)
        return ViewHolder(v)

    }
    override fun getItemCount(): Int {
        return userActivities.size
    }
    override fun onBindViewHolder(holder: UserActivityRecycler.ViewHolder, position: Int) {
        holder.activityType.text = userActivities[position].type
        holder.activityDate.text = userActivities[position].date



    }

    inner class ViewHolder(itemView: View): RecyclerView.ViewHolder(itemView) {

        var activityType: TextView
        var activityDate: TextView


        init {
            activityType = itemView.findViewById(R.id.userActivityType)
            activityDate = itemView.findViewById(R.id.userActivityDate)
        }
    }
}


