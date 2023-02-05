package com.example.clientleger

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint


class Board {

    private var x = 0
    private var y = 0
    private var p1: Paint = Paint()
    private var p2: Paint = Paint()
    private var p3: Paint = Paint()
    private var p4: Paint = Paint()
    private var p5: Paint = Paint()
    private var p6: Paint = Paint()
    private var p7: Paint = Paint()
    private var cntx: Int = 0
    private var cnty: Int = 0



    fun onDraw(cv: Canvas) {
        p1.color = Color.BLACK
        p1.strokeWidth = 4f
        p2.color = Color.RED
        p3.color = Color.rgb(255, 153, 153)
        p4.color = Color.BLUE
        p5.color = Color.rgb(153, 153, 255)
        p6.color = Color.BLACK
        p6.textAlign = Paint.Align.CENTER
        p6.textSize = 9F
        p7.color = Color.rgb(225, 198, 153)

        cv.drawRect(0f, 0f, (cv.width).toFloat(), (cv.height).toFloat(), p7)

        val tileWidth: Int = cv.width/15
        val tileHeight: Int = cv.height/15
        while(x < cv.width) {
            this.y = 0
            while (y < cv.height) {
                cv.drawLine(x.toFloat(), y.toFloat(), (x+tileWidth).toFloat(), y.toFloat(), p1)
                cv.drawLine(x.toFloat(), y.toFloat(), x.toFloat(), (y+tileHeight).toFloat(), p1)
                cv.drawLine((x+tileWidth).toFloat(), y.toFloat(), (x+tileWidth).toFloat(), (y+tileHeight).toFloat(), p1)
                cv.drawLine(x.toFloat(), (y+tileHeight).toFloat(), (x+tileWidth).toFloat(), (y+tileHeight).toFloat(), p1)
                this.y += tileHeight
            }
            this.x += tileWidth
        }
        this.x = 0
        while(x < cv.width) {
            this.y = 0
            while (y < cv.height) {
                if(x == cv.width*7/15 && y == cv.height*7/15) {
                    cv.drawRect((x + 2).toFloat(), (y + 2).toFloat(), (x + tileWidth - 2).toFloat(), (y + tileHeight - 2).toFloat(), p3)
                    cv.drawText("Début", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                } else {
                    cv.drawRect(
                        (x + 2).toFloat(),
                        (y + 2).toFloat(),
                        (x + tileWidth - 2).toFloat(),
                        (y + tileHeight - 2).toFloat(),
                        p2
                    )
                    cv.drawText(
                        "MOT",
                        (x + (tileWidth / 2)).toFloat(),
                        (y + (tileHeight / 2)).toFloat(),
                        p6
                    )
                    cv.drawText(
                        "x3",
                        (x + (tileWidth / 2)).toFloat(),
                        (y + (tileHeight) - 5).toFloat(),
                        p6
                    )
                }
                this.y += cv.height*7/15
            }
            this.x += cv.width*7/15
        }

        var cnt = 0
        this.x = tileWidth
        while(x < cv.width) {
            when(cnt) {
                0 -> this.y = tileHeight
                1 -> this.y = tileHeight*2
                2 -> this.y = tileHeight*3
                3 -> this.y = tileHeight*4
            }
            while (y < cv.height) {
                    cv.drawRect(
                        (x + 2).toFloat(),
                        (y + 2).toFloat(),
                        (x + tileWidth - 2).toFloat(),
                        (y + tileHeight - 2).toFloat(),
                        p3
                    )
                cv.drawText("MOT", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                cv.drawText(
                    "x2",
                    (x + (tileWidth / 2)).toFloat(),
                    (y + (tileHeight) - 5).toFloat(),
                    p6
                )
                    when (cnt) {
                        0 -> this.y += cv.height * 12 / 15
                        1 -> this.y += cv.height * 10 / 15
                        2 -> this.y += cv.height * 8 / 15
                        3 -> this.y += cv.height * 6 / 15
                    }

            }
            this.x += tileWidth
            cnt++
        }

        cnt = 0
        this.x = cv.width*10/15
        while(x < cv.width) {
            when(cnt) {
                0 -> this.y = tileHeight*4
                1 -> this.y = tileHeight*3
                2 -> this.y = tileHeight*2
                3 -> this.y = tileHeight
            }
            while (y < cv.height) {
                    cv.drawRect(
                        (x + 2).toFloat(),
                        (y + 2).toFloat(),
                        (x + tileWidth - 2).toFloat(),
                        (y + tileHeight - 2).toFloat(),
                        p3
                    )
                cv.drawText("MOT", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                cv.drawText(
                    "x2",
                    (x + (tileWidth / 2)).toFloat(),
                    (y + (tileHeight) - 5).toFloat(),
                    p6
                )
                    when (cnt) {
                        0 -> this.y += cv.height * 6 / 15
                        1 -> this.y += cv.height * 8 / 15
                        2 -> this.y += cv.height * 10 / 15
                        3 -> this.y += cv.height * 12 / 15
                    }

            }
            this.x += tileWidth
            cnt++
        }

        this.x = 0
        while(x < cv.width) {
            cnty = 0
            when(cntx) {
                0 -> this.y = tileHeight*3
                1 -> this.y = tileHeight*5
                2 -> this.y = tileHeight*6
                3 -> this.y = 0
                5 -> this.y = tileHeight
                6 -> this.y = tileHeight*2
                7 -> this.y = tileHeight*3
            }
            while (y < cv.height) {
                if(cntx != 4){
                    if(cntx == 1 && cnty == 2){
                        break
                    }else if(cntx == 2 && cnty == 2) {
                        break
                    } else if(cntx == 0 || cntx == 2 || cntx == 3 || cntx == 6 || cntx == 7) {
                        cv.drawRect(
                            (x + 2).toFloat(),
                            (y + 2).toFloat(),
                            (x + tileWidth - 2).toFloat(),
                            (y + tileHeight - 2).toFloat(),
                            p5
                        )
                        cv.drawText("LETTRE", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                        cv.drawText(
                            "x2",
                            (x + (tileWidth / 2)).toFloat(),
                            (y + (tileHeight) - 5).toFloat(),
                            p6
                        )
                    } else {
                        cv.drawRect(
                            (x + 2).toFloat(),
                            (y + 2).toFloat(),
                            (x + tileWidth - 2).toFloat(),
                            (y + tileHeight - 2).toFloat(),
                            p4
                        )
                        cv.drawText("LETTRE", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                        cv.drawText(
                            "x3",
                            (x + (tileWidth / 2)).toFloat(),
                            (y + (tileHeight) - 5).toFloat(),
                            p6
                        )
                    }
                    when (cntx) {
                        0 -> this.y += cv.height * 8 / 15
                        1 -> this.y += cv.height * 4 / 15
                        2 -> this.y += cv.height * 2 / 15
                        3 -> this.y += cv.height * 7 / 15
                        5 -> this.y += cv.height * 4 / 15
                        6 -> this.y += cv.height * 10 / 15
                        7 -> this.y += cv.height * 8 / 15
                    }
                    cnty++
                }

            }
            this.x += tileWidth
            cntx++
        }

        cntx = 0
        this.x = cv.width*8/15
        while(x < cv.width) {
            cnty = 0
            when(cntx) {
                0 -> this.y = tileHeight*2
                1 -> this.y = tileHeight
                3 -> this.y = 0
                4 -> this.y = tileHeight*6
                5 -> this.y = tileHeight*5
                6 -> this.y = tileHeight*3
            }
            while (y < cv.height) {
                if(cntx != 2){
                    if(cntx == 4 && cnty == 2){
                        break
                    }else if(cntx == 5 && cnty == 2) {
                        break
                    } else if(cntx == 0 || cntx == 3 || cntx == 4 || cntx == 6 || cntx == 7) {
                        cv.drawRect(
                            (x + 2).toFloat(),
                            (y + 2).toFloat(),
                            (x + tileWidth - 2).toFloat(),
                            (y + tileHeight - 2).toFloat(),
                            p5
                        )
                        cv.drawText("LETTRE", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                        cv.drawText(
                            "x2",
                            (x + (tileWidth / 2)).toFloat(),
                            (y + (tileHeight) - 5).toFloat(),
                            p6
                        )
                    } else {
                        cv.drawRect(
                            (x + 2).toFloat(),
                            (y + 2).toFloat(),
                            (x + tileWidth - 2).toFloat(),
                            (y + tileHeight - 2).toFloat(),
                            p4
                        )
                        cv.drawText("LETTRE", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                        cv.drawText(
                            "x3",
                            (x + (tileWidth / 2)).toFloat(),
                            (y + (tileHeight) - 5).toFloat(),
                            p6
                        )
                    }
                    when (cntx) {
                        0 -> this.y += cv.height * 10 / 15
                        1 -> this.y += cv.height * 4 / 15
                        3 -> this.y += cv.height * 7 / 15
                        4 -> this.y += cv.height * 2 / 15
                        5 -> this.y += cv.height * 4 / 15
                        6 -> this.y += cv.height * 8 / 15
                    }
                    cnty++
                }

            }
            this.x += tileWidth
            cntx++
        }

        cntx = 0
        this.x = tileWidth*6
        while(cntx < 2) {
            cnty = 0
            this.y = tileHeight*6
            while (cnty < 2) {
                    cv.drawRect(
                        (x + 2).toFloat(),
                        (y + 2).toFloat(),
                        (x + tileWidth - 2).toFloat(),
                        (y + tileHeight - 2).toFloat(),
                        p5
                    )
                cv.drawText("LETTRE", (x+tileWidth/2).toFloat(), (y+tileHeight/2).toFloat(), p6)
                cv.drawText(
                    "x2",
                    (x + (tileWidth / 2)).toFloat(),
                    (y + (tileHeight) - 5).toFloat(),
                    p6
                )
                    this.y += cv.height*2/15
                cnty++
            }
            this.x += cv.width*2/15
            cntx++
        }
        cntx = 0
        cnty = 0
    }

    fun drawLines(cv: Canvas){
        val tileWidth: Int = cv.width/15
        val tileHeight: Int = cv.height/15
        x = 0
        while(x < cv.width) {
            this.y = 0
            while (y < cv.height) {
                cv.drawLine(x.toFloat(), y.toFloat(), (x+tileWidth).toFloat(), y.toFloat(), p1)
                cv.drawLine(x.toFloat(), y.toFloat(), x.toFloat(), (y+tileHeight).toFloat(), p1)
                cv.drawLine((x+tileWidth).toFloat(), y.toFloat(), (x+tileWidth).toFloat(), (y+tileHeight).toFloat(), p1)
                cv.drawLine(x.toFloat(), (y+tileHeight).toFloat(), (x+tileWidth).toFloat(), (y+tileHeight).toFloat(), p1)
                this.y += tileHeight
            }
            this.x += tileWidth
        }
    }

    fun getGrid(cv: Canvas, x: Float, y: Float): Array<Int?> {
        var startTilePoint: Array<Int?> = arrayOf(null, null)
        val tileWidth: Int = cv.width/15
        val tileHeight: Int = cv.height/15
        val x1 = 0 until tileWidth
        val x2 = tileWidth until tileWidth*2
        val x3 = tileWidth*2 until tileWidth*3
        val x4 = tileWidth*3 until tileWidth*4
        val x5 = tileWidth*4 until tileWidth*5
        val x6 = tileWidth*5 until tileWidth*6
        val x7 = tileWidth*6 until tileWidth*7
        val x8 = tileWidth*7 until tileWidth*8
        val x9 = tileWidth*8 until tileWidth*9
        val x10 = tileWidth*9 until tileWidth*10
        val x11 = tileWidth*10 until tileWidth*11
        val x12 = tileWidth*11 until tileWidth*12
        val x13 = tileWidth*12 until tileWidth*13
        val x14 = tileWidth*13 until tileWidth*14
        val x15 = tileWidth*14 until tileWidth*15

        val y1 = 0 until tileWidth
        val y2 = tileHeight until tileHeight*2
        val y3 = tileHeight*2 until tileHeight*3
        val y4 = tileHeight*3 until tileHeight*4
        val y5 = tileHeight*4 until tileHeight*5
        val y6 = tileHeight*5 until tileHeight*6
        val y7 = tileHeight*6 until tileHeight*7
        val y8 = tileHeight*7 until tileHeight*8
        val y9 = tileHeight*8 until tileHeight*9
        val y10 = tileHeight*9 until tileHeight*10
        val y11 = tileHeight*10 until tileHeight*11
        val y12 = tileHeight*11 until tileHeight*12
        val y13 = tileHeight*12 until tileHeight*13
        val y14 = tileHeight*13 until tileHeight*14
        val y15 = tileHeight*14 until tileHeight*15

        val xArray = arrayOf(x1, x2, x3, x4, x5, x6, x7, x8, x9, x10, x11, x12, x13, x14, x15)
        val yArray = arrayOf(y1, y2, y3, y4, y5, y6, y7, y8, y9, y10, y11, y12, y13, y14, y15)

        for (i in 0..14){
            for (j in 0..14){
                if(xArray[i].contains((x/1.48).toInt()) && yArray[j].contains((y/1.48).toInt())){
                    startTilePoint[0] = xArray[i].first
                    startTilePoint[1] = yArray[j].first
                }
            }
        }
        //println(startTilePoint)
        return startTilePoint
    }

    fun convertBoardCoordToCanvasCoord(cv: Canvas, x: Int, y: Int): Array<Int?> {
        var startTilePoint: Array<Int?> = arrayOf(null, null)
        val tileWidth: Int = cv.width/15
        val tileHeight: Int = cv.height/15
        when(x){
            1 -> startTilePoint[0] = 0
            2 -> startTilePoint[0] = tileWidth
            3 -> startTilePoint[0] = tileWidth*2
            4 -> startTilePoint[0] = tileWidth*3
            5 -> startTilePoint[0] = tileWidth*4
            6 -> startTilePoint[0] = tileWidth*5
            7 -> startTilePoint[0] = tileWidth*6
            8 -> startTilePoint[0] = tileWidth*7
            9 -> startTilePoint[0] = tileWidth*8
            10 -> startTilePoint[0] = tileWidth*9
            11 -> startTilePoint[0] = tileWidth*10
            12 -> startTilePoint[0] = tileWidth*11
            13 -> startTilePoint[0] = tileWidth*12
            14 -> startTilePoint[0] = tileWidth*13
            15 -> startTilePoint[0] = tileWidth*14
        }
        when(y){
            1 -> startTilePoint[1] = 0
            2 -> startTilePoint[1] = tileHeight
            3 -> startTilePoint[1] = tileHeight*2
            4 -> startTilePoint[1] = tileHeight*3
            5 -> startTilePoint[1] = tileHeight*4
            6 -> startTilePoint[1] = tileHeight*5
            7 -> startTilePoint[1] = tileHeight*6
            8 -> startTilePoint[1] = tileHeight*7
            9 -> startTilePoint[1] = tileHeight*8
            10 -> startTilePoint[1] = tileHeight*9
            11 -> startTilePoint[1] = tileHeight*10
            12 -> startTilePoint[1] = tileHeight*11
            13 -> startTilePoint[1] = tileHeight*12
            14 -> startTilePoint[1] = tileHeight*13
            15 -> startTilePoint[1] = tileHeight*14
        }
        return startTilePoint
    }

    fun drawCurrentBoard(cv: Canvas, board: ArrayList<ArrayList<String>>){
        var startTilePoint: Array<Int?>
        for(i in 0..14){
            for(j in 0 .. 14){
                startTilePoint = convertBoardCoordToCanvasCoord(cv, i + 1, j + 1)
                if(board[j].get(i) != ""){
                    drawLetter(cv, board[j].get(i), startTilePoint)
                }

            }

        }
    }

    fun convertCanvasCoordToBoardCoord(cv: Canvas, x: Int?, y: Int?): String {
        var boardCoord: String = ""
        val tileWidth: Int = cv.width/15
        val tileHeight: Int = cv.height/15
        when(y){
            0 -> boardCoord += "a"
            tileHeight -> boardCoord += "b"
            tileHeight*2 -> boardCoord += "c"
            tileHeight*3 -> boardCoord += "d"
            tileHeight*4 -> boardCoord += "e"
            tileHeight*5 -> boardCoord += "f"
            tileHeight*6 -> boardCoord += "g"
            tileHeight*7 -> boardCoord += "h"
            tileHeight*8 -> boardCoord += "i"
            tileHeight*9 -> boardCoord += "j"
            tileHeight*10 -> boardCoord += "k"
            tileHeight*11 -> boardCoord += "l"
            tileHeight*12 -> boardCoord += "m"
            tileHeight*13 -> boardCoord += "n"
            tileHeight*14 -> boardCoord += "o"
        }

        when(x){
            0 -> boardCoord += "1"
            tileWidth -> boardCoord += "2"
            tileWidth*2 -> boardCoord += "3"
            tileWidth*3 -> boardCoord += "4"
            tileWidth*4 -> boardCoord += "5"
            tileWidth*5 -> boardCoord += "6"
            tileWidth*6 -> boardCoord += "7"
            tileWidth*7 -> boardCoord += "8"
            tileWidth*8 -> boardCoord += "9"
            tileWidth*9 -> boardCoord += "10"
            tileWidth*10 -> boardCoord += "11"
            tileWidth*11 -> boardCoord += "12"
            tileWidth*12 -> boardCoord += "13"
            tileWidth*13 -> boardCoord += "14"
            tileWidth*14 -> boardCoord += "15"
        }
        return boardCoord
    }

    fun drawLetter(cv: Canvas, letter: String, startTilePoint: Array<Int?>){
        var let = letter
        if(letter.contains("blank")){
            let = letter[5].toString()
        }
        if(!startTilePoint.contains(null)){
            p1.color = Color.BLACK
            p1.textAlign = Paint.Align.CENTER
            p1.textSize = 20F
            p2.color = Color.rgb(245, 245, 220)
            startTilePoint[0]?.let {
                startTilePoint[1]?.let { it1 ->
                    startTilePoint[0]?.plus(cv.width/15)?.let { it2 ->
                        startTilePoint[1]?.plus(cv.height/15)?.let { it3 ->
                            cv.drawRect(
                                it.toFloat(),
                                it1.toFloat(),
                                it2.toFloat(),
                                it3.toFloat(),
                                p1)
                        }
                    }
                }
            }
            startTilePoint[0]?.plus(2)?.let {
                startTilePoint[1]?.plus(2)?.let { it1 ->
                    (startTilePoint[0]?.plus(cv.width/15))?.minus(2)?.let { it2 ->
                        (startTilePoint[1]?.plus(cv.height/15))?.minus(2)?.let { it3 ->
                            cv.drawRect(
                                it.toFloat(),
                                it1.toFloat(),
                                it2.toFloat(),
                                it3.toFloat(),
                                p2)
                        }
                    }
                }
            }
            startTilePoint[0]?.plus(cv.width/30)?.let {
                (startTilePoint[1]?.plus(cv.height/30))?.plus(6)?.let { it1 ->
                    cv.drawText(let.uppercase(),
                        it.toFloat(),
                        it1.toFloat(),
                        p1)
                }
            }
        }

    }

    fun validateWordOrientation(x: ArrayList<Int?>, y: ArrayList<Int?>): String? {
        var isHorizontal = false
        var isVertical = false
        var orientation: String? = null
        if(x.size > 1){
            for(i in 0 .. (x.size - 2)){
                if(x[i] == x[i + 1]){
                    isVertical = true
                } else {
                    isVertical = false
                    break
                }
            }
        }
        if(y.size > 1){
            for(i in 0 .. (y.size - 2)){
                if(y[i] == y[i + 1]){
                    isHorizontal = true
                } else {
                    isHorizontal = false
                    break
                }
            }
        }
        if(x.size == 1){
            orientation = "h"
        }
        if(!isHorizontal == isVertical){
            if(isHorizontal){
                orientation = "h"
            } else {
                orientation = "v"
            }
        }

        return orientation
    }

    fun drawStartingTile(cv: Canvas, startTilePoint: Array<Int?>) {
        if (!startTilePoint.contains(null)) {
            p2.color = Color.GREEN
            startTilePoint[0]?.plus(2)?.let {
                startTilePoint[1]?.plus(2)?.let { it1 ->
                    (startTilePoint[0]?.plus(cv.width / 15))?.minus(2)?.let { it2 ->
                        (startTilePoint[1]?.plus(cv.height / 15))?.minus(2)?.let { it3 ->
                            cv.drawRect(
                                it.toFloat(),
                                it1.toFloat(),
                                it2.toFloat(),
                                it3.toFloat(),
                                p2
                            )
                        }
                    }
                }
            }
        }
    }

    fun convertLetterCoordToIntCoord(cv: Canvas, letter: String): Int {
        var intCoord = 99
        when(letter) {
            "A" -> intCoord = 1
            "B" -> intCoord = 2
            "C" -> intCoord = 3
            "D" -> intCoord = 4
            "E" -> intCoord = 5
            "F" -> intCoord = 6
            "G" -> intCoord = 7
            "H" -> intCoord = 8
            "I" -> intCoord = 9
            "J" -> intCoord = 10
            "K" -> intCoord = 11
            "L" -> intCoord = 12
            "M" -> intCoord = 13
            "N" -> intCoord = 14
            "O" -> intCoord = 15

        }
        return intCoord
    }
}
