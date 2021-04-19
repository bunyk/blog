---
title: "SICP 1.3.4 Procedures as returned values"
date: 2020-07-02T23:43:40+02:00
tags:
- SICP
---

Today I have learned that John Carmack was also challenged by SICP:

> 100 pages into Structure and Interpretation of Computer Programs. I'm proud of myself for not skipping the Church Numerals exercise. [Twitter](https://twitter.com/ID_AA_Carmack/status/350028210551013376)

I still need to get so far.

<!--more-->

## Exercise 1.40

```scheme
(define (cubic a b c) 
  (lambda (x) (+
    (* x x x)
    (* a x x)
    (* b x)
    c
  ))
)
```

## Exercise 1.41

```scheme
(define (inc x) (+ x 1))

(define (double f)
  (lambda (x) (f (f x)))
)
```


## Exercise 1.42

```scheme
(define (sqr x) (* x x))

(define (compose f g) 
  (lambda (x) (f (g x)))
)

((compose sqr inc) 6)
```

## Exercise 1.43

```scheme
(define (repeated f n) 
  (if (= n 1)
    f
    (if (even? n)
      (repeated (double f) (/ n 2))
      (compose f (repeated f (- n 1)))
    )
  )
)
```

## Exercise 1.44

```scheme
(define dx 0.000001)
(define (smooth f)
  (lambda (x) (/ (+
    (f x)
    (f (+ x dx))
    (f (- x dx))
  ) 3.0))
)

(repeated smooth 10)
```

# Exercise 1.45
```scheme
(define tolerance 0.00001)
(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) tolerance))
  (define (try guess limit)
    (display guess) (newline); to debug trace
    (let ((next (f guess)))
      (if (= limit 0)
        (error "Reached iteration limit")
        (if (close-enough? guess next)
            next
            (try next (- limit 1)))
      )))
  (try first-guess 1000)
)

(define (average-damp f) 
  (lambda (y) (/ (+ (f y) y) 2))
)

(define (npow x n)
  (if (= n 1) x (* x (npow x (- n 1)) ))
)

(define (n-root x n) 
  (fixed-point
    ((repeated average-damp (/ n 2)) (lambda (y) (/ x (npow y (- n 1)))))
    1
  )
)
```
I saw on the internet solutions better than n / 2, but I would like to move on.

# Exercise 1.46

```scheme
(define (iterative-improve good-enough next)
  (define (iter guess) 
    (if (good-enough guess)
      guess
      (iter (next guess))
    )
  )
  iter
)

(define (~= a b) 
  (< (abs (- a b)) 0.00001)
)

(define (sqrt x) 
  ((iterative-improve
    (lambda (y) (~= (* y y) x))
    (lambda (y) (/ (+ y (/ x y)) 2))
  ) 1.0)
)

(define (fixed-point f first-guess)
  ((iterative-improve
     (lambda (y) (~= (f y) y)); not very optimal because we computing f twice 
     f
  ) first-guess)
)
```

And I could move to the chapter about data structures.
