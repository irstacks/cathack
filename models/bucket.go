package models

import (
	"encoding/json"
	"os"
	"path/filepath"
	"time"

	"../config"
	"../lib"

	"github.com/boltdb/bolt"
)

type MetaBucket struct {
	Name      string `json:"name"`
	TimeStamp int    `json:"timestamp"`
	// TODO: more metadata
}

type Bucket struct {
	Id   string     `json:"id"`
	Meta MetaBucket `json:"meta"`
}

type Buckets []Bucket
type BucketModel struct{}

func getMeta(b *bolt.Bucket) (meta MetaBucket) {
	m := b.Get([]byte("meta"))
	json.Unmarshal(m, &meta)
	return meta
}

func GetBucketByName(name string) (bucket Bucket, err error) {
	err = db.View(func(tx *bolt.Tx) error {
		// FIXME?: this return the _last_ bucket with a given name. There are
		// currently no validations that buckets won't have duplicate names.
		e := tx.ForEach(func(bucketId []byte, b *bolt.Bucket) error {
			m := getMeta(b)
			if m.Name == name {
				bucket.Id = string(bucketId)
				bucket.Meta = m
			}
			return nil
		})
		return e
	})
	if err != nil {
		return bucket, err
	}
	if bucket == (Bucket{}) {
		return Bucket{}, err
	} else {
		return bucket, err
	}
}

// Pointer receiver!
func (b *Bucket) New(name string) {
	b.Id = lib.RandSeq(8)
	// var met = Meta{
	// 	Name:      name,
	// 	TimeStamp: int(time.Now().UTC().UnixNano()),
	// }
	b.Meta.Name = name
	b.Meta.TimeStamp = int(time.Now().UTC().UnixNano())
}

func (m BucketModel) One(bucketId []byte) (bucket Bucket) {
	db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket(bucketId)
		bucket.Id = string(bucketId)
		bucket.Meta = getMeta(b)
		return nil
	})
	return bucket
}

func (m BucketModel) All() (buckets Buckets, err error) {
	err = db.View(func(tx *bolt.Tx) error {
		tx.ForEach(func(bucketId []byte, b *bolt.Bucket) error {
			m := getMeta(b)
			if string(bucketId) != "chat" {
				buckets = append(buckets, Bucket{Id: string(bucketId), Meta: m})
			}
			return nil
		})
		return nil
	})
	return buckets, err
}

func (m BucketModel) Create(bucketName string) (Bucket, error) {

	meta := MetaBucket{Name: bucketName, TimeStamp: int(time.Now().UTC().UnixNano() / 1000000)}
	bucket := Bucket{Id: lib.RandSeq(8), Meta: meta}

	err := db.Update(func(tx *bolt.Tx) error {
		b, cerr := tx.CreateBucket([]byte(bucket.Id))
		if cerr != nil {
			return cerr
		}

		j, jerr := json.Marshal(bucket.Meta)
		if jerr != nil {
			return jerr
		}

		perr := b.Put([]byte("meta"), j)
		if perr != nil {
			return perr
		}
		return nil
	})

	p := filepath.Join(config.FSStorePath, bucketName)
	derr := os.MkdirAll(p, 0777)
	if derr != nil {
		return bucket, err
	}

	return bucket, err
}

func (m BucketModel) Destroy(bucketId string) (err error) {
	err = db.Update(func(tx *bolt.Tx) error {

		// First we delete the dir from the FS.
		// Get name of dir.
		b := tx.Bucket([]byte(bucketId))
		bm := getMeta(b)

		// .. and then get the path.
		path := filepath.Join(config.FSStorePath, bm.Name)
		e := DeleteDir(path) // rm -rf that sucka
		if e != nil {
			return e
		}

		// Finally get rid of bucket.
		derr := tx.DeleteBucket([]byte(bucketId))
		return derr
	})
	return err
}

func (m BucketModel) Set(bucket Bucket) (err error) {
	err = db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(bucket.Id))

		// Rename FS dir.
		bm := getMeta(b)
		oldpath := filepath.Join(config.FSStorePath, bm.Name)
		newpath := filepath.Join(config.FSStorePath, bucket.Meta.Name)
		rerr := os.Rename(oldpath, newpath)
		if rerr != nil {
			return rerr
		}

		j, jerr := json.Marshal(bucket.Meta)
		if jerr != nil {
			return jerr
		}

		e := b.Put([]byte("meta"), j)
		if e != nil {
			return e
		}
		return nil
	})
	return err
}
