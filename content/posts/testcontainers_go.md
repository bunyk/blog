---
title: "Testing go code with real database using testcontainers"
date: 2022-06-29T10:34:06+02:00
tags:
- go
---

Unit tests are a good thing. They run fast, and allow you to be more confident that you have not broken logic that they verify. If you find a bug, and write a test that reproduces it, you could make sure that bug will not return. They try to, for example, when some developer that comes after you wants to simplify your code, and misses a corner case.

But unit tests usually test some unit (usually function) of your program in isolation, therefore the name. They mock all the dependencies, including database connection. That has its advantages, but also downsides. Sometimes, your back-end code is just a glue between HTTP and database,  and a lot of your logic is implemented directly in the database. Bugs could hide in the database and in the interface to database (especially if you try to build query dynamically). And it would be nice to be able to automatically verify that your queries will work with your DB.

To do that in Python world, you usually have some ORM, which connects to PostgreSQL on production, and to in-memory SQLite when running tests. ORM generates different SQL for that cases, but if you are not running super complex queries, you could be confident enough that behavior of code will be the similar in tests and in live environment.

I though that similar thing is impossible in Go where it's not common to use ORM. Until my teammate with Java background introduced [`testcontainers`](https://golang.testcontainers.org/) library to our projects. Here is a [post about testcontainers for Java devs on engineering blog of my company](https://engineering.zalando.com/posts/2021/02/integration-tests-with-testcontainers.html).

Now let's see how to write automated tests that verify the correct end to end behavior of an app, by creating a PostgreSQL DB in a container.

<!--more-->

## Example service
Let's imagine that we are building the rating service. It stores products (or restaurants, blog articles, Stack Overflow comments, whatever). And users leave feedback in a form of a like or dislike. It will have following, simplified API:

- `POST /products {name: 'Go'}` - creates a new product with given name
- `GET /products` returns products ordered by rating `[{id: 1, name: 'postgres' likes: 20, dislikes: 0}, {id: 2, name: 'MariaDB' likes: 15, dislikes: 6}, ...]`
- `POST /products/:id:/like` - adds a new like for a product
- `POST /products/:id:/dislike` - adds a dislike

When computing rating, we would use [rule of succession](https://en.wikipedia.org/wiki/Rule_of_succession) to make sure that product with one like (100% of likes), is not rated higher than product with 99 likes and 1 dislike (99% of likes). For that, we assume that there are always one additional "prior" like and one "prior" dislike for each product. So products with zero explicit likes or dislikes, have 50% positive rating, and having one like increases that percent to 66%. The more feedback the product gets, the less impact this prior implicit feedback has on final rating.

For the sake of simplicity, we skip authorization and other details like getting product by id, pagination, or limiting number of likes per product per user. So we could implement functionality quickly and focus on building tests.

## Implementation
Start a new go project called `postest`, and add two dependencies:

```bash
mkdir postest
go mod init example/postest
go get github.com/gin-gonic/gin # for API
go get github.com/jackc/pgx/v4  # for storage
mkdir api
mkdir store
```

Database schema has just one table that looks like this:
```sql
CREATE TABLE IF NOT EXISTS products (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	likes INT NOT NULL DEFAULT 0,
	dislikes INT NOT NULL DEFAULT 0
)
```

And when we select from it, we will use rule of succession to order results like this:

```sql
ORDER BY (likes + 1) / (likes + dislikes + 2) DESC
```

So if you have apples with 1 like and 0 dislikes, and bananas with 9 likes and 1 dislike, you will get value (1 + 1) / (1 + 0 + 2) = 0.666 for apples, and (9 + 1) / (9 + 1 + 2) = 0.833 for bananas, so bananas will go higher in ranking.

Now, below I'll just put listings of code for `api` and `store` packages, and `main.go`, so you could follow along. If you just want to read - scroll until the [testing section](#testing).

```go
package api

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"example/postest/store"
)

type api struct {
	store store.Store
}

func New(s store.Store) *gin.Engine {
	a := api{store: s}
	r := gin.Default()
	r.GET("/products", a.getProducts)
	r.POST("/products", a.createProduct)
	r.POST("/products/:id/like", a.likeProduct)
	r.POST("/products/:id/dislike", a.dislikeProduct)
	return r
}

func (a api) getProducts(c *gin.Context) {
	products, err := a.store.GetProducts(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.IndentedJSON(http.StatusOK, products)
}

func (a api) createProduct(c *gin.Context) {
	var p store.Product
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	p, err := a.store.CreateProduct(c.Request.Context(), p)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

func (a api) likeProduct(c *gin.Context) {
	a.rateProduct(c, true)
}

func (a api) dislikeProduct(c *gin.Context) {
	a.rateProduct(c, false)
}

func (a api) rateProduct(c *gin.Context, like bool) {
	id := c.Param("id")
	if err := a.store.RateProduct(c.Request.Context(), id, like); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusOK)
}
```

```go
package store

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v4/pgxpool"
)

type Product struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	Likes    int    `json:"likes"`
	Dislikes int    `json:"dislikes"`
}

type Store struct {
	db *pgxpool.Pool
}

func New(dsn string) (s Store, err error) {
	s.db, err = pgxpool.Connect(context.Background(), dsn)
	return
}

func (s Store) Migrate() error {
	_, err := s.db.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS products (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			likes INT NOT NULL DEFAULT 0,
			dislikes INT NOT NULL DEFAULT 0
		)
	`)
	return err
}

func (s Store) GetProducts(ctx context.Context) ([]Product, error) {
	var products []Product
	rows, err := s.db.Query(ctx, `
		SELECT id, name, likes, dislikes
		FROM products
		ORDER BY (likes + 1) / (likes + dislikes + 2) DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var p Product
		err = rows.Scan(&p.ID, &p.Name, &p.Likes, &p.Dislikes)
		if err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, nil
}

func (s Store) CreateProduct(ctx context.Context, p Product) (Product, error) {
	err := s.db.QueryRow(context.Background(), "INSERT INTO products (name) VALUES ($1) RETURNING id", p.Name).Scan(&p.ID)
	return p, err
}

func (s Store) RateProduct(ctx context.Context, id string, like bool) error {
	field := "dislikes"
	if like {
		field = "likes"
	}
	r, err := s.db.Exec(ctx, fmt.Sprintf("UPDATE products SET %s = %s + 1 WHERE id = $1", field, field), id)
	if err != nil {
		return err
	}
	if n := r.RowsAffected(); n == 0 {
		return fmt.Errorf("no product with id %s", id)
	}
	return nil
}
```

And in case we would want to run it, here is the `main.go` file:

```go
package main

import (
	"log"

	"example/postest/api"
	"example/postest/store"
)

func main() {
	s, err := store.New("postgres://reviews_user:pass@localhost:5432/reviews")
	if err != nil {
		log.Fatal(err)
	}
	err = s.Migrate()
	if err != nil {
		log.Fatal(err)
	}
	r := api.New(s)

	log.Println("Listening on :8080")
	r.Run(":8080")
}
```

## Testing
Now, how to test it? When we test manually, we connect to some database, like in `main.go` example above, and try different requests. We will do similar from our automated tests.<a id="testing"></a>

But first, create yet another package to aid with our test database container creation. Le'ts call it `testdb`. Testcontainers help to create any docker containers from Go, `testdb` will create PostgreSQL DB test container exactly for our needs.

```go
package testdb

import (
	"context"
	"fmt"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/wait"
)

type TestDBContainer struct {
	testcontainers.Container
	context context.Context
	URI     string
}

// logConsumer is log consumer to propagate logs of container to stdout
type TestLogConsumer struct{}

func (g TestLogConsumer) Accept(l testcontainers.Log) {
	fmt.Println(l.LogType, string(l.Content))
}

var logConsumer TestLogConsumer

// We hard-code credentials here, since it's for one-time DB
// so they are not very important
const (
	db       = "test_db"
	user     = "test_user"
	password = "test_password"
)

// Create container with our test database
func New(ctx context.Context) (*TestDBContainer, error) {
	// ContainerRequest describes Docker container we want to run
	req := testcontainers.ContainerRequest{
		Image:        "postgres:latest",
		ExposedPorts: []string{"5432/tcp", "8080/tcp"},
		Env: map[string]string{
			"POSTGRES_DB":       db,
			"POSTGRES_USER":     user,
			"POSTGRES_PASSWORD": password,
		},
		WaitingFor: wait.ForLog(`listening on IPv4 address "0.0.0.0", port 5432`),
	}
	// Run container
	container, err := testcontainers.GenericContainer(ctx, testcontainers.GenericContainerRequest{
		ContainerRequest: req,
		Started:          true, // block this call until container is started
	})
	if err != nil {
		return nil, err
	}

	// use logConsumer to print logs to stdout
	err = container.StartLogProducer(ctx)
	if err != nil {
		return nil, err
	}
	container.FollowOutput(logConsumer)

	// Get externally mapped port
	mappedPort, err := container.MappedPort(ctx, "5432")
	if err != nil {
		return nil, err
	}

	// Get container host
	hostIP, err := container.Host(ctx)
	if err != nil {
		return nil, err
	}

	// Build a DB URL connection string
	uri := fmt.Sprintf("postgres://%s:%s@%s:%s/%s", user, password, hostIP, mappedPort.Port(), db)

	return &TestDBContainer{
		Container: container,
		URI:       uri,
		context:   ctx,
	}, nil
}

// Stop the container
func (t *TestDBContainer) Close() error {
	return t.Container.Terminate(t.context)
}
```

And don't forget to install testcontainers package itself:

```bash
go get github.com/testcontainers/testcontainers-go
```


Now, let's add tests in `api/api_test.go`:

```go
package api

import (
	"context"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"example/postest/store"
	"example/postest/testdb"

	"github.com/stretchr/testify/assert"
)

func TestCreationAndRatingFlow(t *testing.T) {
	var err error
	ctx, _ := context.WithTimeout(context.Background(), time.Second*600)
	testDB, err := testdb.New(ctx)
	if err != nil {
		log.Fatal(err)
	}
	s, err := store.New(testDB.URI)
	if err != nil {
		log.Fatal(err)
	}
	err = s.Migrate()
	if err != nil {
		log.Fatal(err)
	}

	a := New(s)
	h := a.Handler()

	body, status, err := doRequest(h, "GET", "/products", "")
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)
	assert.JSONEq(t, `[]`, body)

	// Test that product is created:
	body, status, err = doRequest(h, "POST", "/products", `{"name":"apple"}`)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusCreated, status)
	assert.JSONEq(t, `{"id":1,"name":"apple","likes":0,"dislikes":0}`, body)

	body, status, err = doRequest(h, "POST", "/products", `{"name":"banana"}`)
	assert.Nil(t, err)
	assert.Equal(t, http.StatusCreated, status)
	assert.JSONEq(t, `{"id":2,"name":"banana","likes":0,"dislikes":0}`, body)

	// Now should return two products:
	body, status, err = doRequest(h, "GET", "/products", "")
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)
	assert.JSONEq(t, `[
		{"id":1,"name":"apple","likes":0,"dislikes":0},
		{"id":2,"name":"banana","likes":0,"dislikes":0}
	]`, body)

	// Like banana:
	body, status, err = doRequest(h, "POST", "/products/2/like", "")
	assert.Nil(t, err)
	assert.Equal(t, http.StatusOK, status)

	// Now banana should be at top:
	body, status, err = doRequest(h, "GET", "/products", "")
	assert.JSONEq(t, `[
		{"id":2,"name":"banana","likes":1,"dislikes":0},
		{"id":1,"name":"apple","likes":0,"dislikes":0}
	]`, body)

	// Like apple twice:
	_, _, _ = doRequest(h, "POST", "/products/1/like", "")
	_, _, _ = doRequest(h, "POST", "/products/1/like", "")

	// Now apple should be on top again:
	body, status, err = doRequest(h, "GET", "/products", "")
	assert.JSONEq(t, `[
		{"id":1,"name":"apple","likes":2,"dislikes":0},
		{"id":2,"name":"banana","likes":1,"dislikes":0}
	]`, body)

	// Like banana, dislike apple:
	_, _, _ = doRequest(h, "POST", "/products/2/like", "")
	_, _, _ = doRequest(h, "POST", "/products/1/dislike", "")

	// Now banana should be on top again:
	body, status, err = doRequest(h, "GET", "/products", "")
	assert.JSONEq(t, `[
		{"id":2,"name":"banana","likes":2,"dislikes":0},
		{"id":1,"name":"apple","likes":2,"dislikes":1}
	]`, body)

	testDB.Close()
}

// helper function to test handler using httptest recorder
func doRequest(h http.Handler, method, path, body string) (content string, status int, err error) {
	var bodyReader io.Reader
	if body != "" {
		bodyReader = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, path, bodyReader)
	w := httptest.NewRecorder()
	h.ServeHTTP(w, req)
	res := w.Result()
	defer res.Body.Close()
	data, err := ioutil.ReadAll(res.Body)
	return string(data), res.StatusCode, err
}
```


Here I did everything in one testcase. Here all the cases run from one function, one after another. Just to save myself some work like creating a lot of fixtures, so results of previous test are used in next ones.

When we would want to do multiple independent tests, but share DB (because creating DB container for each testcase takes forever), I suggest to use `TestMain` to create and cleanup database container. Just be careful so tests do not influence each others in bad ways.

## Debugging

But surprise! When we run the tests above, they fail. Banana with one like is not rated above apple. To debug that, I pause tests execution by inserting  `time.Sleep(300 * time.Second)` where needed. 

While tests sleep, we could open their DB and check what's going on. `docker ps` will show you name of the PostgreSQL container. And then: 

```bash
docker exec -it $CONTAINER_NAME psql -U test_user test_db
```

Will launch a `psql` client. There we could see that our like is stored successfully:

```
test_db=# select * from products;
 id |  name  | likes | dislikes 
----+--------+-------+----------
  1 | apple  |     0 |        0
  2 | banana |     1 |        0
```

But rating is not calculated properly:
```
test_db=# select name, (likes + 1) / (likes + dislikes + 2) as rating from products;
  name  | rating 
--------+--------
 apple  |      0
 banana |      0
(2 rows)
```

Checking case for apples `(0 + 1) / (0 + 0 + 2)`  we see that we have a problem caused by division:

```
test_db=# select 1 / 2;
 ?column? 
----------
        0
(1 row)

test_db=# select 1.0 / 2.0;
        ?column?        
------------------------
 0.50000000000000000000

```

Yeah, integer division! Open `store/store.go` and instead of 

```sql
		ORDER BY (likes + 1) / (likes + dislikes + 2) DESC
```

write
```sql
		ORDER BY (likes + 1.0) / (likes + dislikes + 2.0) DESC
```

Now tests should pass. 

## Coverage
Let's check how much of the code covered our tests:

```bash
$ go test -cover ./...
?   	example/postest	[no test files]
ok  	example/postest/api	(cached)	coverage: 71.4% of statements
?   	example/postest/store	[no test files]
?   	example/postest/testdb	[no test files]
```
Interesting here is that we wrote tests just for the `api` package, almost 75% of it is covered, but we found a bug inside store package. So coverage report is a little bit misleading. Probably it was designed for unit tests, that do not reach outside of their package.

To have better report do this:

```bash
go test -coverpkg=./... -coverprofile=profile.cov ./...
```
Parameter `-coverpkg` tells go to record also the coverage of the other packages in folder. You could also pass `all` value there, but then it will record also coverage of dependencies (web framework, standard library, etc.). Seems too much, so I prefer `./...`.

This command still prints wrong report, but `profile.cov` now contains correct results. To view them, run

```bash
go tool cover -html=profile.cov
```

It will open a page in browser with a drop-down selector that shows coverage for each file (`store/store.go` has 85.2%), and will highlight lines that still needs to be covered.

In our example not covered are mostly error handling code like 

```go
        if err != nil {
                return err
        }
```
It executes when database itself has problems (or our query has errors). Such cases probably could be better covered with mocked DB (or not covered at all).

## Conclusion
So we saw that tests found a bug in SQL code itself. If we had just unit-tests that tested logic in Go code and mocked database, this bug would not have been detected.  Yes, in simple example like this query could have been tested manually. But imagine how many bugs are hiding when you build your query dynamically?

I have seen assertions made about final text of SQL query, but that is very brittle way to write test-cases. You don't know if your query will work, and on every logic change you need to change most of your test-cases.

Downside of writing automated tests like this are that they are waaaay slower than normal ones. Like you could go make a tea while they run, especially when you create multiple test databases. But still faster than manual, once you wrote them.

So such integration testing stands in the middle between manual and unit tests. It's slower than unit-tests, but faster than humans. It potentially finds more bugs than unit-testing. But as any other kind of testing proves only that bugs exist, not that there are no bugs at all.
