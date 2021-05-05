---
title: "SICP 1.2.2 Tree recursion"
date: 2020-06-14T21:06:09+02:00
tags:
- SICP
---

I like how they did not shown yet how to work with any data structures, but wrote function that behaves like a immutable array:

```scheme
 (define (first-denomination kinds-of-coins)
  (cond ((= kinds-of-coins 1) 1)
        ((= kinds-of-coins 2) 5)
        ((= kinds-of-coins 3) 10)
        ((= kinds-of-coins 4) 25)
        ((= kinds-of-coins 5) 50)))
```

<!-- more -->

## Exercise 1.11
Functions should produce following sequence: 1, 2, 4, 11, 25, 59, 142
([Sequence A100550](https://oeis.org/A100550) in the On-Line Encyclopedia of Integer Sequences)

```scheme
(define (next-f c d e)
    (+ e (* 2 d) (* 3 c)))

(define (f n) 
    (if (< n 3) 
        n
        (next-f (f (- n 3))
           (f (- n 2))
           (f (- n 1)))))
```


```scheme
(define (f n)
    (define (f-iter a b c n)
        (if (< n 3)
            c
            (f-iter b c (next-f a b c) (- n 1))))
    (f-iter 0 1 2 n))
```

Done. 

## Exercise 1.12. Pascal triangle

```scheme
(define (P row col) 
    (cond
        ((= col 1) 1) ; first number in row is 1
        ((= col row) 1) ; last number is 1 too
        (else (+ ; otherwise it's sum of two number above
            (P (- row 1) (- col 1))
            (P (- row 1) col)))))
```

## Exercise 1.13
This is hard one for me, because I'm not so good with math. I'll skip this for now.
