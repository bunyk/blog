---
title: "SICP 2.1.2 Abstraction barriers"
date: 2020-07-08T23:44:14+02:00
tags:
- SICP
---

In this section I'm starting to have strong need for types.

Code in exercises becomes more verbose.

<!--more-->

## Exercise 2.2

```scheme
(define make-segment cons)
(define start-segment car)
(define end-segment cdr)

(define make-point cons)
(define x-point car)
(define y-point cdr)

(define (mid-segment segment)
  (let (
    (s (start-segment segment))
    (e (end-segment segment))
  )

  (make-point
    (/ (+ (x-point s) (x-point e)) 2)
    (/ (+ (y-point s) (y-point e)) 2)
  ))
)

(define (print-point p)
  (newline)
  (display "(")
  (display (x-point p))
  (display ",")
  (display (y-point p))
  (display ")"))

(define a (make-point 1.0 2.0))
(define b (make-point 3.0 4.0))
(define ab (make-segment a b))

(print-point (mid-segment ab))
```

## Exercise 2.3

```scheme
(define make-rect cons)

(define (area rect) 
  (* (width-rect rect) (height-rect rect))
)

(define (perimeter rect) 
  (* 2 (+ (width-rect rect) (height-rect rect)))
)

(define (sqr x) (* x x))
;; Some useful stuff for testing

;  d  c
;
;  a  b
(define a (make-point 0.0 0.0))
(define b (make-point 1.0 0.0))
(define c (make-point 1.0 1.0))
(define d (make-point 0.0 1.0))

(define ab (make-segment a b))
(define ad (make-segment a d))

;;; representation 1 - adjacent sides
(define rect (make-rect ab ad))

(define (distance point-a point-b)
  (sqrt (+
      (sqr (- (x-point point-a) (x-point point-b)))
      (sqr (- (y-point point-a) (y-point point-b)))
  ))
)
(define (length segment)
  (distance (start-segment segment) (end-segment segment))
)
(define (width-rect rect)
  (length (car rect))
)
(define (height-rect rect)
  (length (cdr rect))
)

;;; representation 2 - opposite points 

(define rect (make-rect a c))

(define (width-rect rect)
  (abs (-
    (x-point (car rect))
    (x-point (cdr rect))
  ))
)
(define (height-rect rect)
  (abs (-
    (y-point (car rect))
    (y-point (cdr rect))
  ))
)
```
