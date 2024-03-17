package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"log"
	"minesweeper/api"
	"minesweeper/biz"
	"minesweeper/infra/dal"
	"minesweeper/infra/po"
	"net/http"
	"strconv"
)

func main() {

	db, err := gorm.Open(sqlite.Open("sqlite.db"), &gorm.Config{})
	if err != nil {
		log.Fatal(err)
	}
	err = db.AutoMigrate(&po.Session{})
	if err != nil {
		log.Fatal(err)
	}

	repo := dal.NewDal(db)

	b := biz.NewBiz(repo)

	e := echo.New()
	e.GET("/rank", func(c echo.Context) (err error) {
		in := &api.GetRankInput{}
		in.Level, err = strconv.ParseInt(c.QueryParam("level"), 10, 64)
		if err != nil {

		}
		out, err := b.GetRank(c, in)
		if err != nil {
			return
		}
		return c.JSON(http.StatusOK, out)
	})

	e.POST("/session", func(c echo.Context) (err error) {
		in := &api.NewSessionInput{}
		err = c.Bind(in)
		if err != nil {
			return
		}
		in.Ip = c.RealIP()
		return b.NewSession(c, in)
	})

	e.Use(middleware.CORS())
	e.Logger.Fatal(e.Start(":1323"))
}
