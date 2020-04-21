// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"controlAccuracy/suggestionServer/dictionary"
	"flag"
	"log"
	"math"
	"net/http"
	"runtime"
)

const (
	dictionaryPath = "./assets/dictionary.xml"
	homePath       = "./assets/home.html"
)

var addr = flag.String("addr", ":8080", "HTTP service address")
var totalParticipants = flag.Int(
	"total-participants",
	1,
	"The number of expected maximum simultaneous participants. Use a value >0 to limit the resources allocated to each participant.",
)

func serveHome(w http.ResponseWriter, r *http.Request) {
	log.Println(r.URL)
	if r.URL.Path != "/" {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	http.ServeFile(w, r, homePath)
}

func main() {
	flag.Parse()
	dict := dictionary.LoadFromXML(dictionaryPath)
	// It is unclear why the hub is important at the moment, but we keep it just in case.
	hub := newHub()
	go hub.run()
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		upgrade := false
		for _, header := range r.Header["Upgrade"] {
			if header == "websocket" {
				upgrade = true
				break
			}
		}
		if upgrade {
			totalSuggestionRoutines := runtime.NumCPU()
			if *totalParticipants > 0 {
				totalSuggestionRoutines =
					int(math.Max(
						1,
						math.Floor(float64(runtime.NumCPU()))/float64(*totalParticipants),
					))
			}

			serveWs(hub, dict, totalSuggestionRoutines, w, r)
		} else {
			serveHome(w, r)
		}
	})
	log.Printf("Server listening on %v\n", *addr)
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
