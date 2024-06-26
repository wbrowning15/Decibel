package main

import (
    "context"
    "log"
    "net/http"
    "time"

    "cloud.google.com/go/firestore"
    firebase "firebase.google.com/go"
    "github.com/gorilla/mux"
    "github.com/gorilla/websocket"
    "google.golang.org/api/option"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

var firebaseApp *firebase.App
var firestoreClient *firestore.Client
var clients = make(map[*websocket.Conn]bool)
var broadcast = make(chan Message)

type Message struct {
    userID    string    `firestore:"userID"`
    username  string    `firestore:"username"`
    content   string    `firestore:"content"`
    timestamp time.Time `firestore:"timestamp"`
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("Error upgrading HTTP connection: %v\n", err)
        return
    }
    defer ws.Close()

    token := r.URL.Query().Get("token")
    eventID := r.URL.Query().Get("eventID")
    log.Printf("Received token: %s\n", token)
    log.Printf("Event ID: %s\n", eventID)

    ctx := context.Background()
    client, err := firebaseApp.Auth(ctx)
    if err != nil {
        log.Printf("Error getting Auth client: %v\n", err)
        return
    }

    decodedToken, err := client.VerifyIDToken(ctx, token)
    if err != nil {
        log.Printf("Error verifying ID token: %v\n", err)
        return
    }

    userID := decodedToken.UID
    log.Printf("Authenticated user ID: %s\n", userID)

    clients[ws] = true

    for {
        var msg Message
        err := ws.ReadJSON(&msg)
        if err != nil {
            log.Printf("Error reading message: %v\n", err)
            delete(clients, ws)
            break
        }

        if msg.userID != userID {
            log.Printf("User ID mismatch: token user ID %s, message user ID %s\n", userID, msg.userID)
            continue
        }

        msg.timestamp = time.Now()

        log.Printf("Received message from %s: %s\n", msg.username, msg.content)

        _, _, err = firestoreClient.Collection("events").Doc(eventID).Collection("messages").Add(ctx, msg)
        if err != nil {
            log.Printf("Error saving message to Firestore: %v\n", err)
            continue
        }

        broadcast <- msg
    }
}

func handleMessages() {
    for {
        msg := <-broadcast
        for client := range clients {
            err := client.WriteJSON(msg)
            if err != nil {
                log.Printf("Error broadcasting message: %v\n", err)
                client.Close()
                delete(clients, client)
            }
        }
    }
}

func main() {
    var err error

    // Initialize Firebase
    opt := option.WithCredentialsFile("./serviceAccountKey.json")
    firebaseApp, err = firebase.NewApp(context.Background(), nil, opt)
    if err != nil {
        log.Fatalf("Error initializing Firebase app: %v\n", err)
    }

    log.Println("Firebase initialized successfully")

    // Initialize Firestore
    firestoreClient, err = firestore.NewClient(context.Background(), "aura-71a95", opt)
    if err != nil {
        log.Fatalf("Failed to create Firestore client: %v", err)
    }
    defer firestoreClient.Close()

    log.Println("Firestore initialized successfully")

    go handleMessages()

    // Set up the router and WebSocket endpoint
    router := mux.NewRouter()
    router.HandleFunc("/ws", handleConnections)

    log.Println("HTTP server started on :8080")
    err = http.ListenAndServe(":8080", router)
    if err != nil {
        log.Fatalf("HTTP server error: %v", err)
    }
}
