package rank

import (
	"context"
	"minesweeper/infra/po"
)

type Repository interface {
	SaveSession(ctx context.Context, session *po.Session) error
	GetRank(ctx context.Context, level int) (sessions []*po.Session, err error)
	ClearSession(ctx context.Context, level int) error
}
