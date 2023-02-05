package com.example.clientleger

import android.content.ClipData
import android.content.ClipDescription
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Handler
import android.os.Looper
import android.text.SpannableString
import android.text.SpannableStringBuilder
import android.text.Spanned
import android.text.method.ScrollingMovementMethod
import android.text.style.ForegroundColorSpan
import android.view.DragEvent
import android.view.KeyEvent
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import io.socket.client.Socket
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.Executors


class GameActivity2 : AppCompatActivity() {
    private lateinit var mSocket: Socket
    lateinit var board: ImageView
    lateinit var hands: LinearLayout
    lateinit var letter1: TextView
    lateinit var letter2: TextView
    lateinit var letter3: TextView
    lateinit var letter4: TextView
    lateinit var letter5: TextView
    lateinit var letter6: TextView
    lateinit var letter7: TextView
    lateinit var reserve: TextView
    lateinit var turnP0: TextView
    lateinit var turnP1: TextView
    lateinit var turnP2: TextView
    lateinit var turnP3: TextView
    lateinit var username0: TextView
    lateinit var username1: TextView
    lateinit var username2: TextView
    lateinit var username3: TextView
    lateinit var icon0: ImageView
    lateinit var icon1: ImageView
    lateinit var icon2: ImageView
    lateinit var icon3: ImageView
    lateinit var handLength0: TextView
    lateinit var handLength1: TextView
    lateinit var handLength2: TextView
    lateinit var handLength3: TextView
    lateinit var score0: TextView
    lateinit var score1: TextView
    lateinit var score2: TextView
    lateinit var score3: TextView
    lateinit var input: EditText
    lateinit var gameChat: TextView
    private var isSelected1 = false
    private var isSelected2 = false
    private var isSelected3 = false
    private var isSelected4 = false
    private var isSelected5 = false
    private var isSelected6 = false
    private var isSelected7 = false
    private var isMyTurn = false
    private var isGameOver = false
    private var turn: Int = 99
    private var previousTurn: Int = 99
    private var xCoords = ArrayList<Int?>()
    private var yCoords = ArrayList<Int?>()
    private var coord = Array<Int?>(2){null}
    private var orientation: String? = ""
    private var word = ""
    private var boardState = ArrayList<ArrayList<String>>()
    private var users = ArrayList<Any>()
    private var imageUrl = ArrayList<Any>()
    private var playerHandLength = Array<Any>(4){""}
    private var playerScore = Array<Any>(4){""}
    private var p1HandObs = ArrayList<Any>()
    private var p2HandObs = ArrayList<Any>()
    private var p3HandObs = ArrayList<Any>()
    private var p4HandObs = ArrayList<Any>()
    private var handsOfPlayers = Array<Any>(4){""}
    var min: Int = 0
    var sec = 0
    lateinit var time: String
    private var lettersToExchange = ArrayList<String>()
    private var isPlayer = true

    private val conf = Bitmap.Config.ARGB_8888
    private var game: Bitmap = Bitmap.createBitmap(
        540,
        540,
        conf
    )
    var canvas = Canvas(game)
    private lateinit var timerBox: TextView
    private lateinit var b: Board
    private var seconds: Long = 60000
    var hand = ArrayList<Any>()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_game2)

        mSocket = SocketHandler.getSocket()
        println("game page ID: " + mSocket.id())

        username0 = findViewById(R.id.nameP1)
        username1 = findViewById(R.id.nameP2)
        username2 = findViewById(R.id.nameP3)
        username3 = findViewById(R.id.nameP4)
        icon0 = findViewById(R.id.iconP1)
        icon1 = findViewById(R.id.iconP2)
        icon2 = findViewById(R.id.iconP3)
        icon3 = findViewById(R.id.iconP4)
        handLength0 = findViewById(R.id.p1Hand)
        handLength1 = findViewById(R.id.p2Hand)
        handLength2 = findViewById(R.id.p3Hand)
        handLength3 = findViewById(R.id.p4Hand)
        turnP0 = findViewById(R.id.p1Turn)
        turnP1 = findViewById(R.id.p2Turn)
        turnP2 = findViewById(R.id.p3Turn)
        turnP3 = findViewById(R.id.p4Turn)
        timerBox = findViewById(R.id.timer)
        score0 = findViewById(R.id.p1Score)
        score1 = findViewById(R.id.p2Score)
        score2 = findViewById(R.id.p3Score)
        score3 = findViewById(R.id.p4Score)

        mSocket.emit("whoAmI")
        mSocket.on("youAreAnObserver"){
            isPlayer = false
        }

        var joinBtn1 = findViewById<Button>(R.id.replaceBtn1)
        var joinBtn2 = findViewById<Button>(R.id.replaceBtn2)
        var joinBtn3 = findViewById<Button>(R.id.replaceBtn3)
        var joinBtn4 = findViewById<Button>(R.id.replaceBtn4)


        fun msToMinSec(ms: Long): String {
            var num = (ms/1000).toInt()
            if(num % 60 == 0){
                min = (num/60)
            } else {
                min = num / 60
                sec = num % 60
            }
            if(sec.toString().length < 2){
                time = "$min:0$sec"
            } else {
                time = "$min:$sec"
            }
            return time
        }

        val timer = object: CountDownTimer(seconds, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                timerBox.text = msToMinSec(millisUntilFinished)
            }

            override fun onFinish() {
                mSocket.emit("command", "Pass", "")
            }
        }
        fun startTimer(){
            timer.start()
        }

        fun resetTimer(){
            timer.cancel()
            timer.start()
        }

        mSocket.on("game-state"){ args ->
            b.onDraw(canvas)
            b.drawLines(canvas)
            boardState.clear()
            hand.clear()
            val data = args[0] as JSONObject
            println(data)
            val array: JSONArray = data.getJSONArray("hand")
            for(i in 0 .. array.length() - 1){
                hand.add(array[i])
            }
            setHands()
            val board: JSONArray = data.getJSONArray("board")

            for (row in 0.. board.length() - 1) {
                boardState.add(ArrayList())
                for (column in 0 .. board.getJSONArray(row).length() - 1) {
                    boardState.get(row).add(board.getJSONArray(row).getString(column))
                }
            }
            b.drawCurrentBoard(canvas, boardState)
            val reserve = data.getInt("reserveLength")
            for (i in 0..3){
                playerHandLength[i] = data.getJSONArray("publicPlayerInformation").getJSONObject(i).getString("handLength")
            }
            for (i in 0..3){
                playerScore[i] = data.getJSONArray("publicPlayerInformation").getJSONObject(i).getString("score")
            }
            isMyTurn = data.getBoolean("isYourTurn")
            turnP0.visibility = View.INVISIBLE
            turnP1.visibility = View.INVISIBLE
            turnP2.visibility = View.INVISIBLE
            turnP3.visibility = View.INVISIBLE
            turn = data.getInt("currentTurn")
            if(previousTurn != turn){
                resetTimer()
            }
            previousTurn = turn
            updateInfoPanel(reserve, playerHandLength, playerScore, turn)
            isGameOver = data.getBoolean("gameOver")
        }

        mSocket.emit("getObserverGameState")
        mSocket.on("observer-game-state"){ args ->
            println("obs")
            b.onDraw(canvas)
            b.drawLines(canvas)
            boardState.clear()
            p1HandObs.clear()
            p2HandObs.clear()
            p3HandObs.clear()
            p4HandObs.clear()
            val data = args[0] as JSONObject
            println(data)
            val board: JSONArray = data.getJSONArray("board")
            for (row in 0.. board.length() - 1) {
                boardState.add(ArrayList())
                for (column in 0 .. board.getJSONArray(row).length() - 1) {
                    boardState.get(row).add(board.getJSONArray(row).getString(column))
                }
            }
            b.drawCurrentBoard(canvas, boardState)
            val reserve = data.getInt("reserveLength")
            for (i in 0..data.getJSONArray("publicPlayerInformation").length() - 1){
                playerScore[i] = data.getJSONArray("publicPlayerInformation").getJSONObject(i).getString("score")
            }
            turnP0.visibility = View.INVISIBLE
            turnP1.visibility = View.INVISIBLE
            turnP2.visibility = View.INVISIBLE
            turnP3.visibility = View.INVISIBLE
            turn = data.getInt("currentTurn")
            if(previousTurn != turn){
                resetTimer()
            }
            previousTurn = turn


            val array: JSONArray = data.getJSONArray("publicPlayerInformation")
                for(i in 0 .. array.getJSONObject(0).getJSONArray("hand").length() - 1){
                    p1HandObs.add(array.getJSONObject(0).getJSONArray("hand").get(i))
                }
                for(i in 0 .. array.getJSONObject(1).getJSONArray("hand").length() - 1){
                    p2HandObs.add(array.getJSONObject(1).getJSONArray("hand").get(i))
                }
                for(i in 0 .. array.getJSONObject(2).getJSONArray("hand").length() - 1){
                    p3HandObs.add(array.getJSONObject(2).getJSONArray("hand").get(i))
                }
                for(i in 0 .. array.getJSONObject(3).getJSONArray("hand").length() - 1){
                    p4HandObs.add(array.getJSONObject(3).getJSONArray("hand").get(i))
                }


            handsOfPlayers[0] = p1HandObs
            handsOfPlayers[1] = p2HandObs
            handsOfPlayers[2] = p3HandObs
            handsOfPlayers[3] = p4HandObs
            updateInfoPanel(reserve, handsOfPlayers, playerScore, turn)
            isGameOver = data.getBoolean("gameOver")
        }



        mSocket.on("joinedPlayers"){ args ->
            val data = args[0] as JSONArray
            println(data)
            users.clear()
            imageUrl.clear()
            for(i in 0..data.length() - 1){
                if(data.getJSONObject(i).getString("userType") != "observer"){
                    users.add(data.getJSONObject(i).getString("username"))
                    imageUrl.add(data.getJSONObject(i).getString("avatar"))
                }
            }
                username0.text = users[0].toString()
                username1.text = users[1].toString()
                username2.text = users[2].toString()
                username3.text = users[3].toString()
                updateIcon(icon0, imageUrl[0].toString())
                updateIcon(icon1, imageUrl[1].toString())
                updateIcon(icon2, imageUrl[2].toString())
                updateIcon(icon3, imageUrl[3].toString())

            if(!isPlayer){
                runOnUiThread{
                    if(users[0].toString() == "maxime" || users[0].toString() == "julie" || users[0].toString() == "Alex" || users[0].toString() == "Rebecca" || users[0].toString() == "Damien" || users[0].toString() == "Michel Gagnon"){
                        joinBtn1.visibility = View.VISIBLE
                            joinBtn1.setOnClickListener{
                            mSocket.emit("replaceVirtualForObserver", users[0].toString())
                            isPlayer = true
                            joinBtn1.visibility = View.INVISIBLE
                            joinBtn2.visibility = View.INVISIBLE
                            joinBtn3.visibility = View.INVISIBLE
                            joinBtn4.visibility = View.INVISIBLE
                        }
                    } else {
                        joinBtn1.visibility = View.INVISIBLE
                    }
                    if(users[1].toString() == "maxime" || users[1].toString() == "julie" || users[1].toString() == "Alex" || users[1].toString() == "Rebecca" || users[1].toString() == "Damien" || users[1].toString() == "Michel Gagnon"){
                        joinBtn2.visibility = View.VISIBLE
                        joinBtn2.setOnClickListener{
                            mSocket.emit("replaceVirtualForObserver", users[1].toString())
                            isPlayer = true
                            joinBtn1.visibility = View.INVISIBLE
                            joinBtn2.visibility = View.INVISIBLE
                            joinBtn3.visibility = View.INVISIBLE
                            joinBtn4.visibility = View.INVISIBLE
                        }
                    } else {
                        joinBtn2.visibility = View.INVISIBLE
                    }
                    if(users[2].toString() == "maxime" || users[2].toString() == "julie" || users[2].toString() == "Alex" || users[2].toString() == "Rebecca" || users[2].toString() == "Damien" || users[2].toString() == "Michel Gagnon"){
                        joinBtn3.visibility = View.VISIBLE
                        joinBtn3.setOnClickListener{
                            mSocket.emit("replaceVirtualForObserver", users[2].toString())
                            isPlayer = true
                            joinBtn1.visibility = View.INVISIBLE
                            joinBtn2.visibility = View.INVISIBLE
                            joinBtn3.visibility = View.INVISIBLE
                            joinBtn4.visibility = View.INVISIBLE
                        }
                    } else {
                        joinBtn3.visibility = View.INVISIBLE
                    }
                    if(users[3].toString() == "maxime" || users[3].toString() == "julie" || users[3].toString() == "Alex" || users[3].toString() == "Rebecca" || users[3].toString() == "Damien" || users[3].toString() == "Michel Gagnon"){
                        joinBtn4.visibility = View.VISIBLE
                        joinBtn4.setOnClickListener{
                            mSocket.emit("replaceVirtualForObserver", users[3].toString())
                            isPlayer = true
                            joinBtn1.visibility = View.INVISIBLE
                            joinBtn2.visibility = View.INVISIBLE
                            joinBtn3.visibility = View.INVISIBLE
                            joinBtn4.visibility = View.INVISIBLE
                        }
                    } else {
                        joinBtn4.visibility = View.INVISIBLE
                    }
                }
            }
        }

        mSocket.on("hereIsTheFirstLetterPlaced"){args ->
            val data = args[0] as JSONObject
            val row = data.getString("row")
            val column = data.getString("column")
            println(row)
            println(column)
            println(b.convertLetterCoordToIntCoord(canvas, row))
            println(column.toInt())
            b.onDraw(canvas)
            b.drawLines(canvas)
            b.drawCurrentBoard(canvas, boardState)
            var coord = b.convertBoardCoordToCanvasCoord(canvas, column.toInt(), b.convertLetterCoordToIntCoord(canvas, row))
            println(coord[0])
            println(coord[1])
            b.drawStartingTile(canvas, b.convertBoardCoordToCanvasCoord(canvas, column.toInt(), b.convertLetterCoordToIntCoord(canvas, row)))
        }

        gameChat = findViewById(R.id.gameChat)
        gameChat.movementMethod = ScrollingMovementMethod()

        var texts = SpannableStringBuilder().append("")

        mSocket.on("new-message"){ args ->
            val data = args[0] as JSONObject
            if(data.getString("username") == "[SERVER]"){
                val text = data.getString("body")
                val span = SpannableString(text)
                val i = text.length - 1
                span.setSpan(ForegroundColorSpan(Color.rgb(203, 101, 79)), 0, i, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
                texts = SpannableStringBuilder().append(texts).append(span).append("\r\n")
                gameChat.text = texts
            } else {
                val username = data.getString("username") + ": "
                val text = data.getString("body")
                val chat = "$username$text"
                val span = SpannableString(chat)
                val i = chat.length - 1
                if(data.getString("color") == "#679089"){
                    span.setSpan(ForegroundColorSpan(Color.rgb(103, 144, 137)), 0, i, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE)
                }
                texts = SpannableStringBuilder().append(texts).append(span).append("\r\n")
                gameChat.text = texts
            }
        }

        input = findViewById(R.id.input)

        var sendBtn = findViewById<Button>(R.id.send)

        sendBtn.setOnClickListener{
            val messageObject = JSONObject()
            if(input.length() >= 1 && input.text.isNotBlank()){
                messageObject.put("username", "Yama")
                messageObject.put("body", input.text)
                messageObject.put("color", "#679089")
                mSocket.emit("new-message", messageObject)
                input.setText("").toString()
            }
        }

        input.setOnKeyListener(View.OnKeyListener { v, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_ENTER && event.action == KeyEvent.ACTION_DOWN) {
                val messageObject = JSONObject()
                if(input.length() >= 1 && input.text.isNotBlank()){
                    messageObject.put("username", "Yama")
                    messageObject.put("body", input.text)
                    messageObject.put("color", "#679089")
                    mSocket.emit("new-message", messageObject)
                    input.setText("").toString()
                }
                return@OnKeyListener true
            }
            false
        })


        board = findViewById(R.id.view)
        hands = findViewById(R.id.hands)
        board.setOnDragListener(dragListener)
        letter1 = findViewById(R.id.letter1)
        letter2 = findViewById(R.id.letter2)
        letter3 = findViewById(R.id.letter3)
        letter4 = findViewById(R.id.letter4)
        letter5 = findViewById(R.id.letter5)
        letter6 = findViewById(R.id.letter6)
        letter7 = findViewById(R.id.letter7)
        reserve = findViewById(R.id.reserve)



        letter1.setOnLongClickListener{
            if(isMyTurn){
                val clipText = letter1.text
                val item = ClipData.Item(clipText)
                val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
                val data = ClipData(clipText, mimeTypes, item)
                val dragShadowBuilder = View.DragShadowBuilder(it)
                it.startDragAndDrop(data, dragShadowBuilder, it, 0)
                it.setBackgroundColor(Color.GRAY)
                it.isLongClickable = false
            }
            true
        }

        letter1.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected1){
                    it.setBackgroundResource(R.drawable.border2)
                    isSelected1 = true
                    lettersToExchange.add(letter1.text.toString())
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected1 = false
                    lettersToExchange.remove(letter1.text.toString())
                }
            }
        }

        letter2.setOnLongClickListener{
            if(isMyTurn){
            val clipText = letter2.text
            val item = ClipData.Item(clipText)
            val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
            val data = ClipData(clipText, mimeTypes, item)
            val dragShadowBuilder = View.DragShadowBuilder(it)
            it.startDragAndDrop(data, dragShadowBuilder, it, 0)
            it.setBackgroundColor(Color.GRAY)
            it.isLongClickable = false
            }
            true
        }

        letter2.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected2){
                    it.setBackgroundResource(R.drawable.border2)
                    isSelected2 = true
                    lettersToExchange.add(letter2.text.toString())
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected2 = false
                    lettersToExchange.remove(letter2.text.toString())
                }
            }
        }

        letter3.setOnLongClickListener{
            if(isMyTurn){
            val clipText = letter3.text
            val item = ClipData.Item(clipText)
            val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
            val data = ClipData(clipText, mimeTypes, item)
            val dragShadowBuilder = View.DragShadowBuilder(it)
            it.startDragAndDrop(data, dragShadowBuilder, it, 0)
            it.setBackgroundColor(Color.GRAY)
            it.isLongClickable = false
            }
            true
        }

        letter3.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected3){
                    it.setBackgroundResource(R.drawable.border2)
                    isSelected3 = true
                    lettersToExchange.add(letter3.text.toString())
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected3 = false
                    lettersToExchange.remove(letter3.text.toString())
                }
            }
        }

        letter4.setOnLongClickListener{
            if(isMyTurn){
            val clipText = letter4.text
            val item = ClipData.Item(clipText)
            val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
            val data = ClipData(clipText, mimeTypes, item)
            val dragShadowBuilder = View.DragShadowBuilder(it)
            it.startDragAndDrop(data, dragShadowBuilder, it, 0)
            it.setBackgroundColor(Color.GRAY)
            it.isLongClickable = false
            }
            true
        }

        letter4.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected4){
                    it.setBackgroundResource(R.drawable.border2)
                    lettersToExchange.add(letter4.text.toString())
                    isSelected4 = true
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected4 = false
                    lettersToExchange.remove(letter4.text.toString())
                }
            }

        }

        letter5.setOnLongClickListener{
            if(isMyTurn){
            val clipText = letter5.text
            val item = ClipData.Item(clipText)
            val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
            val data = ClipData(clipText, mimeTypes, item)
            val dragShadowBuilder = View.DragShadowBuilder(it)
            it.startDragAndDrop(data, dragShadowBuilder, it, 0)
            it.setBackgroundColor(Color.GRAY)
            it.isLongClickable = false
            }
            true
        }

        letter5.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected5){
                    it.setBackgroundResource(R.drawable.border2)
                    isSelected5 = true
                    lettersToExchange.add(letter5.text.toString())
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected5 = false
                    lettersToExchange.remove(letter5.text.toString())
                }
            }

        }

        letter6.setOnLongClickListener{
            if(isMyTurn){
            val clipText = letter6.text
            val item = ClipData.Item(clipText)
            val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
            val data = ClipData(clipText, mimeTypes, item)
            val dragShadowBuilder = View.DragShadowBuilder(it)
            it.startDragAndDrop(data, dragShadowBuilder, it, 0)
            it.setBackgroundColor(Color.GRAY)
            it.isLongClickable = false
            }
            true
        }

        letter6.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected6){
                    it.setBackgroundResource(R.drawable.border2)
                    isSelected6 = true
                    lettersToExchange.add(letter6.text.toString())
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected6 = false
                    lettersToExchange.remove(letter6.text.toString())
                }
            }

        }

        letter7.setOnLongClickListener{
            if(isMyTurn){
            val clipText = letter7.text
            val item = ClipData.Item(clipText)
            val mimeTypes = arrayOf(ClipDescription.MIMETYPE_TEXT_PLAIN)
            val data = ClipData(clipText, mimeTypes, item)
            val dragShadowBuilder = View.DragShadowBuilder(it)
            it.startDragAndDrop(data, dragShadowBuilder, it, 0)
            it.setBackgroundColor(Color.GRAY)
            it.isLongClickable = false
            }
            true
        }

        letter7.setOnClickListener{
            if(it.isLongClickable && isMyTurn){
                if(!isSelected7){
                    it.setBackgroundResource(R.drawable.border2)
                    isSelected7 = true
                    lettersToExchange.add(letter7.text.toString())
                } else {
                    it.setBackgroundResource(R.drawable.border)
                    isSelected7 = false
                    lettersToExchange.remove(letter7.text.toString())
                }
            }
        }
        b = Board()
        b.onDraw(canvas)
        board.setImageBitmap(game)

        val cancelBtn = findViewById<ImageButton>(R.id.cancelBtn)

        cancelBtn.setOnClickListener{
            xCoords.clear()
            yCoords.clear()
            word = ""
            setHands()
            b.onDraw(canvas)
            b.drawLines(canvas)
            b.drawCurrentBoard(canvas, boardState)
            board.setImageBitmap(game)
        }

        var playBtn: Button = findViewById(R.id.play)


        playBtn.setOnClickListener{
            println(isPlayer)
            if(isPlayer){
                resetTimer()
                orientation = b.validateWordOrientation(xCoords, yCoords)
                if(orientation != null){
                    mSocket.emit("command", "Place", b.convertCanvasCoordToBoardCoord(canvas, xCoords[0], yCoords[0]) + orientation + " " + word.lowercase())
                    println(b.convertCanvasCoordToBoardCoord(canvas, xCoords[0], yCoords[0]))
                    println(xCoords[0])
                    xCoords.clear()
                    yCoords.clear()
                    word = ""
                    setHands()
                }
            }

        }

        startTimer()

        var passBtn = findViewById<Button>(R.id.pass)

        passBtn.setOnClickListener{
            if(isPlayer && isMyTurn){
                mSocket.emit("command", "Pass", "")
            }
        }
        var abandonBtn = findViewById<Button>(R.id.abandon)

        abandonBtn.setOnClickListener{
            mSocket.emit("abandon")
            val intent = Intent(this, MainActivity::class.java)
            startActivity(intent)
        }

        mSocket.emit("getFirstGameState")
        mSocket.emit("getJoinedPlayers")

        var exchangeBtn = findViewById<Button>(R.id.exchangeBtn)

        exchangeBtn.setOnClickListener{
            if(isMyTurn && isPlayer) {
                var letters = ""
                for (i in 0..(lettersToExchange.size - 1)) {
                    letters += lettersToExchange[i]
                }
                mSocket.emit("command", "Swap", letters.lowercase())
                lettersToExchange.clear()
            }
        }
    }

    val dragListener = View.OnDragListener { view, event ->
        when(event.action){
            DragEvent.ACTION_DRAG_STARTED -> {
                event.clipDescription.hasMimeType(ClipDescription.MIMETYPE_TEXT_PLAIN)
            }
            DragEvent.ACTION_DRAG_ENTERED -> {
                view.invalidate()
                true
            }
            DragEvent.ACTION_DRAG_LOCATION -> true
            DragEvent.ACTION_DRAG_EXITED -> {
                view.invalidate()
                true
            }
            DragEvent.ACTION_DROP -> {
                val item = event.clipData.getItemAt(0)
                val dragData = item.text
                view.invalidate()
                val y = event.y
                val x =  event.x
                coord = b.getGrid(canvas, x, y)
                if(!coord.contains(null) && !(xCoords.contains(coord[0]) && yCoords.contains(coord[1]))){
                    xCoords.add(coord[0])
                    yCoords.add(coord[1])
                    if(xCoords.size == 1 && yCoords.size == 1){
                        val firstCoords = b.convertCanvasCoordToBoardCoord(canvas, xCoords[0], yCoords[0])
                        if(firstCoords.length == 2){
                            mSocket.emit("sendFirstLetterPlaced", firstCoords[1], firstCoords[0].uppercase())
                        } else {
                            var num1 = firstCoords[1]
                            var num2 = firstCoords[2]
                            var numCoord: Int = "$num1$num2".toInt()
                            mSocket.emit("sendFirstLetterPlaced", numCoord, firstCoords[0].uppercase())
                        }
                    }
                    b.drawLetter(canvas, dragData.toString(), b.getGrid(canvas, x, y))
                    word += dragData.toString()
                }
                true
            }
            DragEvent.ACTION_DRAG_ENDED -> {
                view.invalidate()
                true
            }
            else -> false
        }
    }

    fun setHands(){
        for(i in 0..hand.size-1) {
            if (hand[i] == "blank") {
                hand[i] = ""
            }
        }
        letter1.isLongClickable = true
        letter1.setBackgroundResource(R.drawable.border)
        letter1.text = hand[0].toString().uppercase()
        letter2.isLongClickable = true
        letter2.setBackgroundResource(R.drawable.border)
        letter2.text = hand[1].toString().uppercase()
        letter3.isLongClickable = true
        letter3.setBackgroundResource(R.drawable.border)
        letter3.text = hand[2].toString().uppercase()
        letter4.isLongClickable = true
        letter4.setBackgroundResource(R.drawable.border)
        letter4.text = hand[3].toString().uppercase()
        letter5.isLongClickable = true
        letter5.setBackgroundResource(R.drawable.border)
        letter5.text = hand[4].toString().uppercase()
        letter6.isLongClickable = true
        letter6.setBackgroundResource(R.drawable.border)
        letter6.text = hand[5].toString().uppercase()
        letter7.isLongClickable = true
        letter7.setBackgroundResource(R.drawable.border)
        letter7.text = hand[6].toString().uppercase()
    }

    fun updateInfoPanel(reserv: Int, playerHandLength: Array<Any>, playerScore: Array<Any>, turn: Int){
        reserve.text = reserv.toString()
        handLength0.text = playerHandLength[0].toString()
        println("updated")
        println(playerHandLength[0])
        handLength1.text = playerHandLength[1].toString()
        handLength2.text = playerHandLength[2].toString()
        handLength3.text = playerHandLength[3].toString()
        score0.text = "Score: " + playerScore[0].toString()
        score1.text = "Score: " + playerScore[1].toString()
        score2.text = "Score: " + playerScore[2].toString()
        score3.text = "Score: " + playerScore[3].toString()
        runOnUiThread {
            when (turn) {
                0 -> turnP0.visibility = View.VISIBLE
                1 -> turnP1.visibility = View.VISIBLE
                2 -> turnP2.visibility = View.VISIBLE
                3 -> turnP3.visibility = View.VISIBLE
            }
        }
    }

    fun updateIcon(view: ImageView, url: String){
        val executor = Executors.newSingleThreadExecutor()
        val handler = Handler(Looper.getMainLooper())
        var image: Bitmap? = null
        executor.execute {
            try {
                val `in` = java.net.URL(url).openStream()
                image = BitmapFactory.decodeStream(`in`)

                // Only for making changes in UI
                handler.post {
                    view.setImageBitmap(image)
                }
            }
            catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}

