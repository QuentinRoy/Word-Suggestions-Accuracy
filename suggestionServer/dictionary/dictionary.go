package dictionary

import (
	"encoding/xml"
	"io/ioutil"
	"log"
)

// DictEntry is a word entry supposed to be part of a dictionary.
type DictEntry struct {
	Word string `xml:",chardata"`
	F    int    `xml:"f,attr"`
}

// Dictionary is collection of words and their frequencies. It can be used
// to compute word suggestions.
type Dictionary struct {
	Entries []*DictEntry `xml:"w"`
	Locale  string       `xml:"locale,attr"`
}

// LoadFromXML creates a dictionary from an XML file.
func LoadFromXML(xmlPath string) (dict *Dictionary) {
	dat, err := ioutil.ReadFile(xmlPath)
	if err != nil {
		log.Fatal(err)
	}
	dict = &Dictionary{}
	if err := xml.Unmarshal(dat, dict); err != nil {
		log.Fatal(err)
	}
	return
}
