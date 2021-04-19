---
title: "SICP 2.2.1 Sequences"
date: 2020-07-16T23:39:38+02:00
tags:
- SICP
---

Finally, the thing Lisp was named after.

Fix MIT Scheme to be like SICP scheme using this:

```scheme
(define nil '())
```

<!--more-->



## Exercise 2.17

```scheme
(define (last-pair l)
  (if (null? (cdr l))
    l
    (last-pair (cdr l))
  )
)
(last-pair (list 23 72 149 34))
```


## Exercise 2.18

```scheme
(define (reverse l)
  (define (iter src dst)
    (if (null? src)
      dst
      (iter (cdr src) (cons (car src) dst))
    )
  )
  (iter l nil)
)
(reverse (list 1 2 3 4))
```

## Exercise 2.19

```scheme
(define us-coins (list 50 25 10 5 1))
(define uk-coins (list 100 50 20 10 5 2 1 0.5))

(define (cc amount coin-values)
  (cond ((= amount 0) 1)
        ((or (< amount 0) (no-more? coin-values)) 0)
        (else
         (+ (cc amount
                (except-first-denomination coin-values))
            (cc (- amount
                   (first-denomination coin-values))
                coin-values)))))
```

Answer: 

```scheme
  (define no-more? null?)
  (define except-first-denomination cdr)
  (define first-denomination car)
```

Order does not matter, because we just sum amount without each element, and with.


## Exercise 2.20

```scheme
(define (same-parity n . l)
  (define (matches x) 
    (= (remainder n 2) (remainder x 2))
  )
  (define (iter l) 
    (if (null? l)
      nil
      (if (matches (car l))
        (cons (car l) (iter (cdr l)))
        (iter (cdr l))
      )
    )
  )
  (cons n (iter l))
)
```

## Exercise 2.21

```scheme
(define (sqr x) (* x x))
(define (square-list items)
  (if (null? items)
      nil
      (cons (sqr (car items)) (square-list (cdr items)))))

(define (square-list items)
  (map sqr items))
```


## Exercise 2.22
What is `cons`-ed into list first will be at the end of list.

If we swap arguments to cons, then we will have the same hierarchy (what was consed first is at deepest pair), just link to the next pair is first element of pair, and value is second. To work with such structure properly, we will have to swap  car and cdr.

## Exercise 2.23

```scheme
(define (for-each f items)
  (if (null? items)
    0
    ((lambda () ; Need some proper way to write blocks of code in if
      (f (car items))
      (for-each f (cdr items))
    ))
  )
)

(for-each (lambda (x) (newline) (display x))
          (list 57 321 88))
```
