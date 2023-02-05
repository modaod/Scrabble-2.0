package com.example.clientleger

//import com.google.firebase.auth.ktx.auth
import android.graphics.Color
import android.text.Editable
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.style.ForegroundColorSpan
import android.view.View
import android.widget.EditText
import android.widget.TextView
import com.google.firebase.database.DatabaseReference
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ktx.database
import com.google.firebase.ktx.Firebase
import java.sql.Timestamp


class Message {
    private lateinit var database: FirebaseDatabase

    //var auth = Firebase.auth
    //user
    //message
    //timestamp
    fun sendMessage(message: String, user: String, channel: String){
        database = Firebase.database
        database.reference.child("chat").child(channel).child("message").setValue(message)
        database.reference.child("chat").child(channel).child("username").setValue(user)
    }

    fun getMessages(textView: TextView){
        database = Firebase.database



    }

    fun showMessage(textToSend: EditText, textToSendValue: Editable, userName: String){
        if(textToSend.length() >= 1 && textToSendValue.isNotBlank()){
            var texts = SpannableStringBuilder()
            val textFormat = "$userName$textToSendValue"
            val span = SpannableString(textFormat)
            span.setSpan(ForegroundColorSpan(Color.BLUE), 0, 4, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            texts = SpannableStringBuilder().append(texts).append(span).append("\r\n")
            sendMessage(texts.toString(), "general", userName)
            //textview.text = texts
            textToSend.setText("").toString()
        }
    }
}
