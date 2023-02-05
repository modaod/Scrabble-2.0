package com.example.clientleger

import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlertDialog
import android.content.ContentValues.TAG
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.icu.util.LocaleData
import android.media.MediaPlayer
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.method.ScrollingMovementMethod
import android.text.style.ForegroundColorSpan
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.EditorInfo
import android.widget.*
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.doAfterTextChanged
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.example.clientleger.databinding.ActivityMainBinding
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.ktx.auth
import com.google.firebase.database.DataSnapshot
import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.database.ktx.database
import com.google.firebase.database.ktx.getValue
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.ktx.storage
import org.json.JSONObject
import yuku.ambilwarna.AmbilWarnaDialog
import java.io.ByteArrayOutputStream
import java.time.Instant
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter
import java.time.LocalDateTime
import io.socket.client.Socket
import java.time.LocalDateTime

import java.util.*


class MainActivity : AppCompatActivity() {

    private lateinit var textview: TextView
    private lateinit var chatToggle: ImageButton
    private lateinit var chatClose: ImageButton
    private lateinit var mediaPlayer: MediaPlayer
    private var isOpen: Boolean = false
    private var texts = SpannableStringBuilder().append("Bienvenu!\r\n")
    private lateinit var binding: ActivityMainBinding
    private lateinit var firebaseAuth: FirebaseAuth
    private lateinit var firebaseDatabase: FirebaseDatabase
    private lateinit var firebaseStorage: FirebaseStorage
    private lateinit var message: Message
    private lateinit var currentTheme: String

    private var layoutManager1: RecyclerView.LayoutManager? = null
    private var layoutManager2: RecyclerView.LayoutManager? = null

    private var friendsChatAdapter: RecyclerView.Adapter<FriendsChatAdapter.ViewHolder>? = null
    private var chatBoxAdapter: RecyclerView.Adapter<ChatBoxAdapter.ViewHolder>? = null


    @SuppressLint("Range")
    private fun getFileName(context: Context, uri: Uri): String? {
        if (uri.scheme == "content") {
            val cursor = context.contentResolver.query(uri, null, null, null, null)
            cursor.use {
                if (cursor != null) {
                    if(cursor.moveToFirst()) {
                        return cursor.getString(cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME))
                    }
                }
            }
        }
        return uri.path?.lastIndexOf('/')?.let { uri.path?.substring(it) }
    }


    @SuppressLint("ResourceType")

    @SuppressLint("SuspiciousIndentation")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database
        firebaseStorage = Firebase.storage

        val currentUser = firebaseAuth.currentUser?.uid.toString()

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        layoutManager1 = LinearLayoutManager(this)
        layoutManager2 = LinearLayoutManager(this)

        binding.friendsChatRecyclerView.layoutManager = layoutManager1
        friendsChatAdapter = FriendsChatAdapter()
        binding.friendsChatRecyclerView.adapter = friendsChatAdapter

        binding.chatBoxRecyclerView.layoutManager = layoutManager2
        chatBoxAdapter = ChatBoxAdapter()
        binding.chatBoxRecyclerView.adapter = chatBoxAdapter

//        binding.friendsChatRecyclerView.setOnClickListener{
//            val itemcount = binding.chatBoxRecyclerView.adapter?.itemCount
//            if (itemcount != null) {
//                binding.chatBoxRecyclerView.scrollToPosition(itemcount - 1)
//            };
//            binding.friendsChatRecyclerView.scrollToPosition(1)
//        }



        var imagePickerActivityResult: ActivityResultLauncher<Intent> =
        // lambda expression to receive a result back, here we
            // receive single item(photo) on selection
            registerForActivityResult( ActivityResultContracts.StartActivityForResult()) { result ->
                if (result != null) {
                    // getting URI of selected Image
                    val imageUri: Uri? = result.data?.data

                    // val fileName = imageUri?.pathSegments?.last()

                    // extract the file name with extension
                    val sd = getFileName(applicationContext, imageUri!!)

                    // Upload Task with upload to directory 'file'
                    // and name of the file remains same
                    val uploadTask = firebaseStorage.reference.child("file/$sd").putFile(imageUri)

                    // On success, download the file URL and display it
                    uploadTask.addOnSuccessListener { it1 ->
                        firebaseDatabase.reference.child("users").child(currentUser).child("selected_dm").get().addOnSuccessListener{ it2 ->
                            var selected_dm_uid = it2.value.toString()
                            Log.e(TAG,firebaseStorage.reference.child("file/$sd").downloadUrl.toString())
                            firebaseStorage.reference.child("file/$sd").downloadUrl.addOnSuccessListener { it3 ->
                            val timestamp = DateTimeFormatter
                                .ofPattern("yyyy-MM-dd HH:mm:ss")
                                .withZone(ZoneOffset.ofHours(-5))
                                .format(Instant.now())
                            val picture = true
                            val message = PmMessageData(
                                firebaseAuth.currentUser?.uid.toString(),
                                timestamp,
                                it3.toString(),
                                picture
                            )

                            Log.e("Download url", it3.toString())

                            val key1 = firebaseDatabase.reference.child("users").child(currentUser)
                                .child("chat").child(selected_dm_uid).push().key
                            firebaseDatabase.reference.child("users").child(currentUser)
                                .child("chat").child(selected_dm_uid).child(key1.toString())
                                .setValue(message)


                            val key2 =
                                firebaseDatabase.reference.child("users").child(selected_dm_uid)
                                    .child("chat").child(currentUser).push().key
                            firebaseDatabase.reference.child("users").child(selected_dm_uid)
                                .child("chat").child(currentUser).child(key2.toString())
                                .setValue(message)

                            Log.e("Firebase", "download passed")
                        }
                        }.addOnFailureListener {
                            Log.e("Firebase", "Failed in downloading")
                        }
                    }.addOnFailureListener {
                        Log.e("Firebase", "Image Upload fail")
                    }
                }
            }

        firebaseAuth = Firebase.auth
        firebaseDatabase = Firebase.database

        mediaPlayer = MediaPlayer.create(this, R.raw.onewingedangel)
        mediaPlayer.isLooping = true
        mediaPlayer.start()

        var mSocket: Socket

        SocketHandler.setSocket()
        mSocket = SocketHandler.getSocket()
        mSocket.connect()

        var muteBtn = findViewById<ImageButton>(R.id.muteBtn)
        var isMuted = false

        muteBtn.setOnClickListener{
            if(!isMuted){
                mediaPlayer.setVolume(0f, 0f)
                isMuted = true
                muteBtn.setImageResource(R.drawable.mute)
            } else {
                mediaPlayer.setVolume(1f, 1f)
                isMuted = false
                muteBtn.setImageResource(R.drawable.unmute)
            }
        }



        /*if (firebaseAuth.currentUser == null){
            val intent = Intent(this, SignInActivity::class.java)
            startActivity(intent)
            Log.w(TAG, firebaseAuth.currentUser.toString())
            finish()
        }*/

        loadLocate()

        //val string: String = getString(R.string.your_string_id)

        firebaseDatabase.reference.child("users").child(currentUser).child("theme").get().addOnSuccessListener {
            var theme = it.value.toString()

            if (theme == "#FFFFFF"){
                binding.background.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.textView.setTextColor(Color.parseColor("#3A3B3C"))
                binding.loggedInUserTextView.setTextColor(Color.parseColor("#3A3B3C"))
                currentTheme = "#FFFFFF"
            }else{
                binding.background.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.textView.setTextColor(Color.parseColor("#FFFFFF"))
                binding.loggedInUserTextView.setTextColor(Color.parseColor("#FFFFFF"))
                currentTheme = "#3A3B3C"
            }
        }

        binding.signOutButton.setOnClickListener {
            Log.e(TAG,"click")

            if(firebaseAuth.currentUser != null){
                Log.e(TAG,firebaseAuth.currentUser.toString() )
                firebaseDatabase.reference.child("users").child(firebaseAuth.currentUser?.uid.toString()).get().addOnSuccessListener {
                    val user = it.getValue<UserData>()


                    firebaseDatabase.reference.child("users")
                        .child(firebaseAuth.currentUser?.uid.toString()).child("status").setValue("Offline")

                    val date = LocalDateTime.now()
                    var dateToSend = date.year.toString() + "-" + date.monthValue.toString() + "-" + date.dayOfMonth.toString() + " " + " " + date.hour.toString() +":"+ date.minute.toString()
                    val myActivity = hashMapOf(
                        "type" to "Déconnexion",
                        "date" to dateToSend
                    )
                    if (user?.uid != null) {
                        if (user.activity.isNullOrEmpty()){

                            firebaseDatabase.reference.child("users").child(user.uid.toString()).child("activity").child("0").setValue(myActivity)
                        }
                        else{
                            firebaseDatabase.reference.child("users").child(user.uid.toString()).child("activity").child(user!!.activity!!.size.toString()).setValue(
                                myActivity
                            )


                        }

                    }
                    Log.e(TAG,firebaseAuth.currentUser.toString())
                    firebaseAuth.signOut()

                    startActivity(Intent(this, SignInActivity::class.java))
                    finish()


                }
            }
            startActivity(Intent(this, SignInActivity::class.java))
            finish()

        }


//        val constraintLayout: ConstraintLayout = findViewById(R.id.background)
//        val animationDrawable: AnimationDrawable = constraintLayout.background as AnimationDrawable
//        animationDrawable.setEnterFadeDuration(1500)
//        animationDrawable.setExitFadeDuration(3000)
//        animationDrawable.start()

        val btnClassic = findViewById<Button>(R.id.button)
        btnClassic.setOnClickListener{
            val intent = Intent(this, GameChoice::class.java)
            startActivity(intent)
        }

        val btnChannels = findViewById<Button>(R.id.button2)
        btnChannels.setOnClickListener {
            val intent = Intent(this, ChannelsActivity::class.java)
            startActivity(intent)
        }


        val btnHighscores = findViewById<Button>(R.id.button3)
        btnHighscores.setOnClickListener {
            val intent = Intent(this, HighscoresActivity::class.java)
            startActivity(intent)
        }

        val btnProfile = findViewById<Button>(R.id.button4)
        btnProfile.setOnClickListener {
            val intent = Intent(this, ProfileActivity::class.java)
            startActivity(intent)
        }


        val notif = findViewById<ImageView>(R.id.notification)

        val btnSend = findViewById<Button>(R.id.btnSend)
        btnSend.setOnClickListener {
            message = Message()
            val textToSend = findViewById<EditText>(R.id.inputBar)
            val textToSendValue = textToSend.text
            val userName = firebaseAuth.currentUser?.displayName.toString()
            if (textToSend.length() >= 1 && textToSendValue.isNotBlank()) {
                val textFormat = "$userName$textToSendValue"
                val span = SpannableString(textFormat)
                span.setSpan(
                    ForegroundColorSpan(Color.BLUE),
                    0,
                    4,
                    Spanned.SPAN_EXCLUSIVE_EXCLUSIVE
                )
                texts = SpannableStringBuilder().append(texts).append(span).append("\r\n")
                //message.sendMessage(texts.toString())
                //textview.text = texts
                textToSend.setText("").toString()
            }
            message.showMessage(textToSend, textToSendValue, userName)
        }

        val chat = findViewById<View>(R.id.chat)
        chatToggle = findViewById(R.id.openChat)
        chatToggle.setOnClickListener {
            chat.visibility = View.VISIBLE
            isOpen = true
            notif.visibility = View.INVISIBLE
        }

        chatClose = findViewById(R.id.closeChat)
        chatClose.setOnClickListener {
            chat.visibility = View.GONE
            isOpen = false
        }

        val btnTest = findViewById<Button>(R.id.test)

        btnTest.setOnClickListener {
            val textToSend = "Hello"
            val userName = "Dev: "
            val textFormat = "$userName$textToSend"
            val span = SpannableString(textFormat)
            span.setSpan(ForegroundColorSpan(Color.RED), 0, 4, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
            texts = SpannableStringBuilder().append(texts).append(span).append("\r\n")
            println(texts)
            textview.text = texts
            val intent = Intent(this, GameActivity2::class.java)
            startActivity(intent)
        }

        binding.FriendsButton.setOnClickListener {
            startActivity(Intent(this, FriendsActivity::class.java))
            finish()
        }

        binding.changeLanguage.setOnClickListener {
            showChangeLang()
        }

        if (firebaseAuth.currentUser != null) {
            binding.loggedInUserTextView.text =
                getString(R.string.welcome) + ", " + firebaseAuth.currentUser?.displayName.toString() + "!"
        }

        binding.themeButton.setOnClickListener {
            if (currentTheme == "#FFFFFF"){
                firebaseDatabase.reference.child("users").child(currentUser).child("theme").setValue("#3A3B3C")
                binding.background.setBackgroundColor(Color.parseColor("#3A3B3C"))
                binding.textView.setTextColor(Color.parseColor("#FFFFFF"))
                binding.loggedInUserTextView.setTextColor(Color.parseColor("#FFFFFF"))
                currentTheme = "#3A3B3C"
            }else{
                firebaseDatabase.reference.child("users").child(currentUser).child("theme").setValue("#FFFFFF")
                binding.background.setBackgroundColor(Color.parseColor("#FFFFFF"))
                binding.textView.setTextColor(Color.parseColor("#3A3B3C"))
                binding.loggedInUserTextView.setTextColor(Color.parseColor("#3A3B3C"))
                currentTheme = "#FFFFFF"
            }

        }

        binding.btnSend.setOnClickListener {
            sendDM()
        }

        binding.imageButton.setOnClickListener {
            // PICK INTENT picks item from data
            // and returned selected item
            val galleryIntent = Intent(Intent.ACTION_PICK)
            // here item is type of image
            galleryIntent.type = "image/*"
            // ActivityResultLauncher callback
            imagePickerActivityResult.launch(galleryIntent)
        }



        binding.inputBar.setOnEditorActionListener { _, actionId, event ->
            if ((event != null && (event.getKeyCode() == KeyEvent.KEYCODE_ENTER)) || (actionId == EditorInfo.IME_ACTION_DONE))  {
                sendDM()
            }
            return@setOnEditorActionListener true
        }

    }

    private fun sendDM() {
        val text = binding.inputBar.text.toString()
        val currentUser = firebaseAuth.currentUser?.uid.toString()

        firebaseDatabase.reference.child("users").child(currentUser).child("selected_dm").get().addOnSuccessListener {
            var selected_dm_uid = it.value.toString()

            if (selected_dm_uid != null && selected_dm_uid != currentUser) {
                val timestamp = DateTimeFormatter
                    .ofPattern("yyyy-MM-dd HH:mm:ss")
                    .withZone(ZoneOffset.ofHours(-5))
                    .format(Instant.now())
                val picture = false
                val message = PmMessageData(firebaseAuth.currentUser?.uid.toString(), timestamp, text, picture)

                if (message.message?.trim() != "") {
                    val key1 = firebaseDatabase.reference.child("users").child(currentUser).child("chat").child(selected_dm_uid).push().key
                    firebaseDatabase.reference.child("users").child(currentUser).child("chat").child(selected_dm_uid).child(key1.toString()).setValue(message)


                    val key2 = firebaseDatabase.reference.child("users").child(selected_dm_uid).child("chat").child(currentUser).push().key
                    firebaseDatabase.reference.child("users").child(selected_dm_uid).child("chat").child(currentUser).child(key2.toString()).setValue(message)

                }else {
                    Toast.makeText(
                        this,
                        "Message cannot be empty !!",
                        Toast.LENGTH_SHORT
                    ).show()
                }

            }
            binding.inputBar.text.clear()
        }
    }

    private fun showChangeLang() {

        val listItmes = arrayOf("English", "French")

        val mBuilder = AlertDialog.Builder(this@MainActivity)
        mBuilder.setTitle("Choose Language")
        mBuilder.setSingleChoiceItems(listItmes, -1) { dialog, which ->
            if (which == 0) {
                setLocate("en")
                recreate()
            } else if (which == 1) {
                setLocate("fr")
                recreate()
            }

            dialog.dismiss()
        }
        val mDialog = mBuilder.create()

        mDialog.show()

    }

    private fun setLocate(Lang: String) {
        val uid = firebaseAuth.currentUser?.uid.toString()

        firebaseDatabase.reference.child("users").child(uid).child("language").setValue(Lang)

        val locale = Locale(Lang)
        Locale.setDefault(locale)

        val config = Configuration()
        config.locale = locale
        baseContext.resources.updateConfiguration(config, baseContext.resources.displayMetrics)

//        val editor = getSharedPreferences("Settings", Context.MODE_PRIVATE).edit()
//        editor.putString("My_Lang", Lang)
//        editor.apply()
    }

    private fun loadLocate() {
//        val sharedPreferences = getSharedPreferences("Settings", Activity.MODE_PRIVATE)
//        val language = sharedPreferences.getString("My_Lang", "")
        val uid = firebaseAuth.currentUser?.uid.toString()
        firebaseDatabase.reference.child("users").child(uid).child("language").get()
            .addOnSuccessListener {
                var language = it.value.toString()
                setLocate(language)
            }
    }
}
