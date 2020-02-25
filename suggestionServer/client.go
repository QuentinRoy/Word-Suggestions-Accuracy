// Modified from The Gorilla WebSocket Authors.

package main

import (
	"fmt"
	"log"
	"math"
	"net/http"
	"runtime"
	"strconv"
	"strings"
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

	// This is used to determine the number of allocated routines to calculate suggestions. The
	// more participants, the less routines per participant is allocated.
	maxSimultaneousParticipants = 2

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

type request struct {
	cancel chan bool
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	dict *dictionary.Dictionary

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	requests map[*request]bool

	totalSuggestionsRoutine int

	send         chan string
	startRequest chan *request
	requestDone  chan *request
	stop         chan bool
}

// NewClient creates a new client.
func NewClient(hub *Hub, dict *dictionary.Dictionary, conn *websocket.Conn) *Client {
	return &Client{
		hub:          hub,
		dict:         dict,
		conn:         conn,
		send:         make(chan string),
		startRequest: make(chan *request),
		requestDone:  make(chan *request),
		stop:         make(chan bool),
		totalSuggestionsRoutine: int(math.Max(
			1,
			math.Floor(float64(runtime.NumCPU()))/(2*maxSimultaneousParticipants),
		)),
	}
}

func (c *Client) run() {
	log.Printf("New client connected\n")
	c.hub.register <- c

	send := make(chan string, 10)
	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go c.writePump(send)
	go c.readPump()

	defer func() {
		close(send)
		for oldReq := range c.requests {
			oldReq.cancel <- true
		}
		c.requests = nil
		c.hub.unregister <- c
		log.Printf("Client gone\n")
	}()

	for {
		select {
		case req := <-c.startRequest:
			for oldReq := range c.requests {
				oldReq.cancel <- true
			}
			c.requests = map[*request]bool{req: true}

		case msg := <-c.send:
			// Handle the very rare case where the send buffer is full, and c<-send is called before
			// c<-stop but the writePump is stopped before sending.
			select {
			case send <- msg:
			case <-c.stop:
				return
			}

		case req := <-c.requestDone:
			delete(c.requests, req)

		case <-c.stop:
			return
		}
	}
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
	reqID := parts[1]

	req := &request{cancel: make(chan bool)}
	c.startRequest <- req

	inputCtx := dictionary.InputContext{
		InputWord:                 parts[2],
		TargetWord:                parts[4],
		CanReplaceLetters:         true,
		TargetSuggestionPositions: targetPositions,
	}

	// We add a buffer to this channel, because the reading side may be already done when sending
	// the message. In that case, it will not listen to the message anymore.
	cancelSuggestions := make(chan bool, 1)
	suggestionsDone := make(chan []string, 1)

	startTime := time.Now()
	go func() {
		suggestionsDone <- c.dict.MockedWordSuggestions(
			inputCtx,
			totalSuggestions,
			cancelSuggestions,
			c.totalSuggestionsRoutine,
		)
	}()
	var suggestions []string
	select {
	case <-req.cancel:
		cancelSuggestions <- true
		log.Printf("Request canceled (\"%s\")\n", inputCtx.InputWord)
		return
	case suggestions = <-suggestionsDone:
		elapsed := time.Now().Sub(startTime)
		log.Printf(
			"Computed %v suggestion(s) for \"%s\" in %v with %v routines (%v currently ongoing routines)",
			totalSuggestions, inputCtx.InputWord, elapsed, c.totalSuggestionsRoutine, runtime.NumGoroutine(),
		)
	}
	select {
	case <-req.cancel:
		log.Printf("Request canceled (\"%s\")\n", inputCtx.InputWord)
		return
	case c.send <- fmt.Sprintf(
		"%s%s%s%s%s",
		suggestionResponseType, fieldSeparator,
		reqID, fieldSeparator,
		strings.Join(suggestions, suggestionSeparator),
	):
	}
	select {
	case <-req.cancel:
		log.Printf("Request canceled (\"%s\")\n", inputCtx.InputWord)
	case c.requestDone <- req:
	}
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.conn.Close()
		c.stop <- true
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})
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
func (c *Client) writePump(send chan string) {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-send:
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
	client := NewClient(hub, dict, conn)
	go client.run()
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
