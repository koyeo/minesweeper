package api

import (
	"github.com/labstack/echo/v4"
	"time"
)

type API interface {
	NewSession(ctx echo.Context, in *NewSessionInput) (err error)
	GetRank(ctx echo.Context, in *GetRankInput) (out *GetRankOutput, err error)
}

type NewSessionInput struct {
	Ip       string
	Nickname string
	Time     int64
	Level    int
}

type GetRankInput struct {
	Level int64
}

type GetRankOutput struct {
	Items []*RankListItem
}

type RankListItem struct {
	Rank      int
	Nickname  string
	Time      int64
	CreatedAt time.Time
}
