package dal

import (
	"context"
	"gorm.io/gorm"
	"minesweeper/domain/rank"
	"minesweeper/infra/po"
)

func NewDal(db *gorm.DB) *Dal {
	return &Dal{db: db}
}

var _ rank.Repository = (*Dal)(nil)

type Dal struct {
	db *gorm.DB
}

func (d Dal) GetRank(ctx context.Context, level int) (sessions []*po.Session, err error) {
	err = d.db.Raw("select * from sessions where level = ? order by time asc limit 50", level).Scan(&sessions).Error
	return
}

func (d Dal) ClearSession(ctx context.Context, level int) error {
	return d.db.Exec(`delete from sessions where id not in (select id from sessions where level = ? order by time asc limit 50)`, level).Error
}

func (d Dal) SaveSession(ctx context.Context, session *po.Session) error {
	return d.db.Create(session).Error
}
