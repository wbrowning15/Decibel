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
    "github.com/jinzhu/gorm"
    _ "github.com/jinzhu/gorm/dialects/sqlite"
    "google.golang.org/api/option"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

var db *gorm.DB
var firebaseApp *firebase.App
var firestoreClient *firestore.Client

type Message struct {
    ID        uint      `gorm:"primary_key" json:"ID"`
    UserID    string    `json:"UserID"`
    Username  string    `json:"Username"`
    Content   string    `json:"Content"`
    Timestamp time.Time `json:"Timestamp"`
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
    ws, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("Error upgrading HTTP connection: %v\n", err)
        return
    }
    defer ws.Close()

    token := r.URL.Query().Get("token")
    log.Printf("Received token: %s\n", token)

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

    for {
        var msg Message
        err := ws.ReadJSON(&msg)
        if err != nil {
            log.Printf("Error reading message: %v\n", err)
            break
        }
		log.Printf("Received message: %+v\n", msg)

        // Verify the user ID in the message matches the token user ID
        if msg.UserID != userID {
            log.Printf("User ID mismatch: token user ID %s, message user ID %s\n", userID, msg.UserID)
			log.Printf("content: %s", msg.Content)
            continue
        }

        msg.Timestamp = time.Now()

        log.Printf("Received message from %s: %s\n", msg.Username, msg.Content)

        if err := db.Create(&msg).Error; err != nil {
            log.Printf("Error saving message to database: %v\n", err)
            continue
        }

        // Broadcast the message to all connected clients
        if err := ws.WriteJSON(msg); err != nil {
            log.Printf("Error broadcasting message: %v\n", err)
            break
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
    firestoreClient, err = firestore.NewClient(context.Background(), "YOUR_PROJECT_ID")
    if err != nil {
        log.Fatalf("Failed to create Firestore client: %v", err)
    }
    defer firestoreClient.Close()

    log.Println("Firestore initialized successfully")

    // Set up the router and WebSocket endpoint
    router := mux.NewRouter()
    router.HandleFunc("/ws", handleConnections)

    log.Println("HTTP server started on :8080")
    err = http.ListenAndServe(":8080", router)
    if err != nil {
        log.Fatalf("HTTP server error: %v", err)
    }
}