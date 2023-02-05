package com.example.clientleger

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject
import java.io.IOException
import java.io.InputStream


class HighscoresActivity : AppCompatActivity() {

    private lateinit var wordInput: EditText
    private lateinit var result: TextView


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_highscores)

        wordInput = findViewById(R.id.wordsInput)
        result = findViewById(R.id.resultView)

        var btn = findViewById<Button>(R.id.sendBtn)
        btn.setOnClickListener{
            var word = wordInput.text.toString().filter { !it.isWhitespace() }
            if(word.length > 0 && word.isNotBlank()){
                    if(verifyWord(word)){
                        result.text = "Le mot $word est valide!"
                    } else {
                        result.text = "Le mot $word n'est pas valide."
                    }

            }

        }


    }

    fun verifyWord(word: String): Boolean {
        var isAWord = false
        var json: Any?
            println("hello")
        try {
            val inputStream: InputStream = assets.open("dictionnary.json")
            json = inputStream.bufferedReader().use { it.readText() }
            val data = JSONObject(json)
            for(i in 0 .. data.getJSONArray("words").length() - 1){
                if(word == data.getJSONArray("words").getString(i)){
                    isAWord = true
                }
            }

        } catch (e: IOException) {

        }
        return isAWord
    }
}
