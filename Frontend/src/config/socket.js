import socket from "socket.io-client";

let socketInitialize = null

export const initializeSocket = (prjId) => {
    // console.log(prjId)
    socketInitialize = socket(import.meta.env.VITE_API_URL, {
        auth: {
            token: localStorage.getItem("token")
        },
        query:{
            projectId : prjId
        }
    });
    return socketInitialize
}

export const recieveMessage = (eventName , data)=>{
    socketInitialize.on(eventName , data)
}

export const sendMessage = (eventName , data)=>{
    socketInitialize.emit(eventName , data)
}
