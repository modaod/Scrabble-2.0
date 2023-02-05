package com.example.clientleger

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.util.AttributeSet
import android.view.View


class Hands(cxt: Context?, attrs: AttributeSet?) : View(cxt, attrs) {

    private var p1: Paint = Paint()
    private var game: GameActivity2 = GameActivity2()

    override fun onDraw(cv: Canvas) {

        
            cv.drawLine(20f, 20f, 100f, 30f, p1)


    }





}
