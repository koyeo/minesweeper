package biz

import (
	"context"
	"github.com/labstack/echo/v4"
	"minesweeper/api"
	"minesweeper/domain/rank"
	"minesweeper/infra/po"
	"time"
)

func NewBiz(repo rank.Repository) *Biz {
	return &Biz{
		repo: repo,
	}
}

var _ api.API = (*Biz)(nil)

type Biz struct {
	repo rank.Repository
}

func (b Biz) NewSession(ctx echo.Context, in *api.NewSessionInput) (err error) {
	err = b.repo.SaveSession(context.Background(), &po.Session{
		Time:      in.Time,
		Nickname:  in.Nickname,
		Level:     in.Level,
		Ip:        in.Ip,
		CreatedAt: time.Now(),
	})
	if err != nil {
		return
	}
	return b.repo.ClearSession(context.Background(), in.Level)
}

func (b Biz) GetRank(ctx echo.Context, in *api.GetRankInput) (out *api.GetRankOutput, err error) {
	items, err := b.repo.GetRank(context.Background(), int(in.Level))
	if err != nil {
		return
	}
	out = new(api.GetRankOutput)
	for i, v := range items {
		out.Items = append(out.Items, &api.RankListItem{
			Rank:      i + 1,
			Nickname:  v.Nickname,
			Time:      v.Time,
			CreatedAt: v.CreatedAt,
		})
	}
	return
}
