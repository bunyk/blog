---
title: "SICP 1.1 The Elements of Programming"
date: 2020-06-13T23:22:32+02:00
tags:
- SICP
---

Decided to finally try and go through this book. Will try to keep journal with notes here.

<!--more-->

Interpreter recommended for it - MIT Scheme, could be installed in Ubuntu by installing package `mit-scheme`.

Then `scheme` command starts interpreter, `scheme --load sqr.scm` loads & evaluates file `sqr.scm`.


And here is my own implementation for finding the square root:

{{< highlight scheme >}}
(define (abs x)
  (if (< x 0)
    (- 0 x)
    x
  ))

(define (~= x y)
  (< (abs (- x y)) 0.0001))

(define (sqr x) 
  (* x x))

(define (avg a b) 
  (/ (+ a b) 2))

(define (sqrt x) 
  (define (sqrt-iter guess) 
    (if (~= (sqr guess) x)
      guess
      (sqrt-iter (avg guess (/ x guess)))))
  (sqrt-iter 1.0))
{{< /highlight >}}
