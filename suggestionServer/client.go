// Modified from The Gorilla WebSocket Authors.

package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"controlAccuracy/suggestionServer/dictionary"

	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512

	suggestionRequestType = "sreq"

	suggestionResponseType = "sresp"

	errorType = "err"

	fieldSeparator = "|"

	suggestionSeparator = ";"
)

var upgrader = websocket.Upgrader{
	CheckOrigin:       func(r *http.Request) bool { return true },
	ReadBufferSize:    1024,
	WriteBufferSize:   1024,
	EnableCompression: true,
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	dict *dictionary.Dictionary

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan string

	hasOnGoingRequest     bool
	lastReqNum            int
	cancelPreviousRequest chan bool
	reqMux                sync.Mutex
}

func parseTargetPositions(targetPositionsString string) ([]int, error) {
	if targetPositionsString == "" {
		return nil, nil
	}
	fields := strings.Split(targetPositionsString, suggestionSeparator)
	targetPositions := make([]int, len(fields))
	var e error
	for i, f := range fields {
		targetPositions[i], e = strconv.Atoi(f)
	}
	return targetPositions, e
}

func (c *Client) printSendError(errMsg string) {
	log.Println(errMsg)
	c.send <- errorType +
		fieldSeparator +
		// Escape separators in the error msg.
		strings.ReplaceAll(
			strings.ReplaceAll(errMsg, fieldSeparator, `\`+fieldSeparator),
			suggestionSeparator,
			`\`+suggestionSeparator,
		)
}

func (c *Client) handleTextMessage(message string) {
	parts := strings.Split(message, fieldSeparator)
	mType := strings.TrimSpace(parts[0])
	if mType != suggestionRequestType {
		c.printSendError(fmt.Sprintf("Received unknown message type: %s ", mType))
		return
	}
	if len(parts) != 6 {
		c.printSendError(fmt.Sprintf("Unexpected sreq message format: %s", message))
		return
	}
	totalSuggestions, err := strconv.Atoi(parts[3])
	if err != nil {
		c.printSendError(fmt.Sprintf("Cannot parse number of suggestions (field 3): %s", parts[3]))
		return
	}
	targetPositions, err := parseTargetPositions(parts[5])
	if err != nil {
		c.printSendError(fmt.Sprintf("Cannot parse target positions (field 5): \"%s\"", parts[5]))
		return
	}

	// Cancel any previously ongoing requests, and set up ways for the next requests
	// to request this one if it is ongoing.
	c.reqMux.Lock()
	if c.hasOnGoingRequest {
		log.Printf("Cancel req %v", c.lastReqNum)
		c.cancelPreviousRequest <- true
	}
	cancelThisRequest := make(chan bool, 1)
	c.cancelPreviousRequest = cancelThisRequest
	c.hasOnGoingRequest = true
	thisReqNum := c.lastReqNum + 1
	c.lastReqNum = thisReqNum
	c.reqMux.Unlock()

	reqID := parts[1]
	inputCtx := dictionary.InputContext{
		InputWord:                 parts[2],
		TargetWord:                parts[4],
		CanReplaceLetters:         true,
		TargetSuggestionPositions: targetPositions,
	}
	suggestions := c.dict.MockedWordSuggestions(
		inputCtx,
		totalSuggestions,
		cancelThisRequest,
	)
	// If the requests get cancels, suggestions will be null.
	if suggestions != nil {
		c.send <- fmt.Sprintf(
			"%s%s%s%s%s",
			suggestionResponseType, fieldSeparator,
			reqID, fieldSeparator,
			strings.Join(suggestions, suggestionSeparator),
		)
	}
	c.reqMux.Lock()
	if c.lastReqNum == thisReqNum {
		c.hasOnGoingRequest = false
	}
	c.reqMux.Unlock()
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		msgType, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		if msgType == websocket.TextMessage {
			go c.handleTextMessage(string(message))
		}
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write([]byte(message))

			// Add queued chat messages to the current websocket message.
			// n := len(c.send)
			// for i := 0; i < n; i++ {
			// 	w.Write('\n')
			// 	w.Write([]byte(<-c.send))
			// }

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// serveWs handles websocket requests from the peer.
func serveWs(hub *Hub, dict *dictionary.Dictionary, w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	client := &Client{hub: hub, dict: dict, conn: conn, send: make(chan string, 10)}
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}
