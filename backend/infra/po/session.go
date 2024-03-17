package po

import "time"

type Session struct {
	ID        int64 `gorm:"primaryKey"`
	Time      int64
	Nickname  string
	Level     int
	Ip        string
	CreatedAt time.Time
}
