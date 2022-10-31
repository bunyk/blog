---
title: "SICP3.1 Assignment and local state"
date: 2022-10-25T21:13:22+02:00
tags:
- SICP
---

So, it have been a huge pause with working on this book, but I have a dream to get at least to building a simulator of digital circuits, part, so I'll restart from the beginning of chapter 3.

I just like how clearly this book explains some ideas I myself would have hard time to explain. State, for example:

> An object is said to "have state" if its behavior is influenced by its history. A bank account, for example, has state in that the answer to the question "Can I withdraw $100?" depends upon the history of deposit and withdrawal transactions.

<!--more-->

## 3.1.1 Local state variables

### Exercise 3.1

```scheme
(define (make-accumulator sum)
  (define (acc amount) 
	(set! sum (+ sum amount))
	sum
  )
  acc
)
```


### Exercise 3.2

```scheme
(define (make-monitored f)
  (define calls 0)
  (define (monitored arg)
	(if (eq? arg 'how-many-calls?)
	  calls
	  (begin
		(set! calls (+ calls 1))
		(f arg)
	  )
	)
  )
  monitored
)

(define s (make-monitored sqrt))
(s 100)
(s 'how-many-calls?)
```

### Exercise 3.3

```scheme
(define (make-account balance password)
  (define (withdraw amount)
	(if (>= balance amount)
	  (begin
		(set! balance (- balance amount))
		balance
	  )
	  "Insufficient funds!"
	)
  )
  (define (deposit amount)
	(set! balance (+ balance amount))
	balance
  )
  (define (dispatch pass m)
	(if (eq? pass password)
		(cond ((eq? m 'withdraw) withdraw)
			  ((eq? m 'deposit) deposit)
			  (else (error "Unknown request - make-account" m))
		)
		"Incorrect password!"
	)
  )
  dispatch
)

(define acc (make-account 100 'secret))
((acc 'wrong-secret 'withdraw) 50)
((acc 'secret 'withdraw) 50)
((acc 'secret 'withdraw) 60)
((acc 'secret 'deposit) 40)
((acc 'secret 'withdraw) 60)
```

### Exercise 3.4
```scheme
(define (make-account balance password)
  (define (withdraw amount)
	(if (>= balance amount)
	  (begin
		(set! balance (- balance amount))
		balance
	  )
	  "Insufficient funds!"
	)
  )
  (define (deposit amount)
	(set! balance (+ balance amount))
	balance
  )

  (define (call-the-cops)
	(display "Hey cops! Somebody is trying to rob bank account!\n")
  )
  (define failed-accesses 0)
  (define (dispatch pass m)
	(if (eq? pass password)
	  	(begin 
		  (set! failed-accesses 0)
		  (cond ((eq? m 'withdraw) withdraw)
		  	    ((eq? m 'deposit) deposit)
		  	    (else (error "Unknown request - make-account" m))
		  )
		)
		(begin
		  (set! failed-accesses (+ failed-accesses 1))
		  (if (> failed-accesses 7)
			(call-the-cops)
			"Incorrect password!"
		  )
		)
	)
  )
  dispatch
)

(define acc (make-account 100 'secret))
(map (lambda (a) (acc 'wrong-secret 'withdraw)) '(1 2 3 4 5 6 7))
((acc 'secret 'withdraw) 50)
(map (lambda (a) (acc 'wrong-secret 'withdraw)) '(1 2 3 4 5 6 8))
```

## 3.1.2 The Benefits of Introducing Assignment

### Exercise 3.5 Monte Carlo integration

```scheme
(define (random-in-range low high)
  (let ((range (- high low)))
	(+ low (random range)))
)

(random-in-range 1.5 10.0)

(define (monte-carlo trials experiment)
  (define (iter trials-remaining trials-passed)
	(cond 
	  ((= trials-remaining 0)
		   (/ trials-passed trials))
	  ((experiment)
	   		(iter (- trials-remaining 1) (+ trials-passed 1)))
	  (else
			(iter (- trials-remaining 1) trials-passed))
	)
  )
  (iter trials 0)
)

; (monte-carlo 100 (lambda () (< (random 10) 5)))

(define (estimate-integral P x1 y1 x2 y2 trials)
  (define (integral-test)
	(P (random-in-range x1 x2)
	   (random-in-range y1 y2)
	)
  )
  (* (rectangle-area x1 y1 x2 y2)
     (monte-carlo trials integral-test)
  )
)
(define (rectangle-area x1 y1 x2 y2) 
  (* (abs (- x1 x2)) (abs (- y1 y2)))
)

(define (in-unit-circle x y)
  (< (+ (sqr x) (sqr y)) 1.0)
)


(define (sqr x) (* x x))

(define pi (estimate-integral in-unit-circle -1.0 -1.0 1.0 1.0 100000))

pi
```

### Exercise 3.6

```scheme
(define (rand-update val) (+ val 1))
(define seed (rand-update 0))

(define (rand m)
  (cond
	((eq? m 'reset)
	 (lambda (val) (set! seed val)))
	((eq? m 'generate)
	  (begin
	   	(set! seed (rand-update seed))
		seed
	  )
	)
  )
)



(rand 'generate)
(rand 'generate)

((rand 'reset) 100)
(rand 'generate)
```

## 3.1.3 The costs for introducing assignment

In this section we learn about referential transparency. Expression in which equals can be substituted for equals without changing it's value is called referentially transparent. [This SO answer explains the term in more details](https://stackoverflow.com/questions/210835/what-is-referential-transparency/9859966#9859966), and is one of the best answers I saw there.

### Exercise 3.7

```scheme
(define (make-joint other-acc other-pass new-pass) 
  (define (dispatch pass m)
	(if (eq? pass new-pass)
	  (other-acc other-pass m)
	  "Incorrect password!"
	)
  )
  dispatch
)

(define my-account (make-account 100 'my-pass))
(define wife-account (make-joint my-account 'my-pass 'wife-pass))

((wife-account 'wife-pass 'withdraw) 200)
((my-account 'my-pass 'deposit) 1000)
((wife-account 'wife-pass 'withdraw) 200)
((my-account 'my-pass 'withdraw) 100)
```

### Exercise 3.8

```scheme
; (+ (f 0) (f 1)) should return 0 if arguments are evaluated left to right, or 1 if right to left
(define state 1)
(define (f a)
  (if (eq? a 0)
	(set! state 0)
  )
  (if (eq? state 0)
  	0
	a
  )
)

(+ (f 0) (f 1))
; mit-scheme seems to be right to left
```
