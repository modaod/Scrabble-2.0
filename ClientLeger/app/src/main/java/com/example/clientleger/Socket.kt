package com.example.clientleger


import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException

object SocketHandler {
    private lateinit var mSocket: Socket

    @Synchronized
    fun setSocket() {
        try {
            //mSocket = IO.socket("http://ec2-99-79-39-161.ca-central-1.compute.amazonaws.com:3000/")
           mSocket = IO.socket("http://10.0.2.2:3000/")
        } catch (e: URISyntaxException) {
            print("Error setting up socket $e")
        }
    }

    @Synchronized
    fun getSocket(): Socket {
        return mSocket
    }


}
