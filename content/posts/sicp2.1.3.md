---
title: "SICP 2.1.3 Meaning of data"
date: 2020-07-10T21:02:43+02:00
tags:
- SICP
---

This section blows your mind by showing that data could be represented by functions. That's kid of obvious that array or assotiative array could be replaced by function that returns value by index, but here you replace with functions even the most basic data type - integer. Not for practical reasons, but I guess to achieve satory about lambda calculus.

<!--more-->

##  Exercise 2.4

```scheme
(define (cons x y)
  (lambda (m) (m x y)))

(define (car z)
  (z (lambda (p q) p)))

(define (cdr z)
  (z (lambda (p q) q)))
```

##  Exercise 2.5

```scheme
; Recursive process and linear time, could be done better
; but I'm to lazy to copy from previous exercises
(define (pow x n) 
  (if (= n 0) 1 (* x (pow x (- n 1))))
)

; iterative linear, not sure if could be made better
(define (count-divisor x d)
  (define (iter x count)
      (if (> (remainder x d) 0)
        count
        (iter (/ x d) (+ count 1))
      )
  )
  (iter x 0)
)

(define (cons x y)
  (* (pow 2 x) (pow 3 y))
) 

(define (car z)
  (count-divisor z 2)
)

(define (cdr z)
  (count-divisor z 3)
)
```

##  Exercise 2.6

```scheme
(define zero (lambda (f) (lambda (x) x)))

(define (inc n) (lambda (f) (lambda (x) (f ((n f) x)))))

(define one (lambda (f) (lambda (x) (f x))))

(define two (lambda (f) (lambda (x) (f (f x)))))

(define (plus a b)
    (lambda (f) (lambda (x) ((a f) ((b f) x))))
)

; To debug if I placed parentheses correctly :)
(define (church-to-int n)
  ((n (lambda (x) (+ x 1))) 0)
)

(church-to-int (plus one two))
;Value: 3
```

There is also nice video from Computerphile that explains how to build Boolean algebra from lambda calculus:
{{< youtube eis11j_iGMs >}}
