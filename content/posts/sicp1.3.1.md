---
title: "SICP 1.3.1 Procedures as arguments"
date: 2020-06-27T19:32:06+02:00
tags:
- SICP
---

Solving more exercises, trying not to skip to be able to learn next chapters better.

<!--more-->

## Exercise 1.29 Simpson rule integration

```scheme
(define (cube x) (* x x x))
(define (integral f a b dx)
  (define (add-dx x) (+ x dx))
  (* (sum f (+ a (/ dx 2.0)) add-dx b)
     dx))

(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))

(integral cube 0 1 0.01)
; .24998750000000042
(integral cube 0 1 0.001)
;.249999875000001

(define (simpson-rule-integral f a b n)
  (define (inc x) (+ x 1))
  (define (term i)
    (cond
      ((= i 0) (f a))
      ((= i n) (f b))
      ((even? i) (* 2 (f (+ a (* (/ (- b a) n) i)))))
      (else (* 4 (f (+ a (* (/ (- b a) n) i)))))
    )
  )
  (* (sum term 0 inc n)
     (/ (- b a) n 3))
)

(simpson-rule-integral cube 0 1 10)
;Value: 1/4

```

Seems to work very precise. Gives rational numbers, wow. Even when try with different functions:

```scheme
(define (identity x) x)
(simpson-rule-integral identity 0 1 10)
;Value: 1/2
```

## Exercise 1.30 Iterative summation
```scheme
(define (sum term a next b)
  (define (iter a result)
    (if (> a b)
        result
        (iter (next a) (+ (term a) result))))
  (iter a 0))
```

## Exercise 1.31 Product
```scheme
(define (product term a next b)
  (define (iter a result)
    (if (> a b)
        result
        (iter (next a) (* (term a) result))))
  (iter a 1))
```

Factorial:

```scheme
(define (inc i) (+ i 1))
(define (identity x) x)
(define (factorial n) (product identity 1 inc n))
```

Approximating Pi:

```scheme
(define (pi precision) 
    (define (term i)
        (define k (* i 2))
        (/ (* k (+ k 2)) (square (+ k 1)))
    )
    (* 4.0 (product term 1 inc precision))
)
(pi 100)
;Value: 3.1493784731686008
```

Recursive product:
```scheme
(define (product term a next b)
    (if (> a b)
        1
        (* (term a) (product term (next a) next b))
    )
)
```

## Exercise 1.32: Accumulate

```scheme
(define (accumulate combiner null-value term a next b)
  (if (> a b)
    null-value
    (combiner
      (term a)
      (accumulate combiner null-value term (next a) next b)
    )
  )
)

(define (sum term a next b)
  (accumulate + 0 term a next b)
)

(define (product term a next b)
  (accumulate * 1 term a next b)
)
```

Iterative:
```scheme
(define (accumulate combiner null-value term a next b)
  (define (iter a result)
    (if (> a b)
      result
      (iter (next a) (combiner (term a) result))
    )
  )
  (iter a null-value)
)
```

## Exercise 1.33 Filtered accumulate

```scheme
(define (filtered-accumulate combiner null-value term a next b filter)
  (define (iter a result)
    (if (> a b)
      result
      (if (filter a) 
          (iter (next a) result)
          (iter (next a) (combiner (term a) result))
      )
    )
  )
  (iter a null-value)
)

(define (sum-of-squares-of-primes-in-interval a b)
    (filtered-accumulate + 0 sqr a inc b prime?)
)

(define (product-of-relatively-primes-to n)
    (define (!rel-prime x)
      (not (= (gcd x n) 1))
    )
    (filtered-accumulate * 1 identity 1 inc n !rel-prime)
)
```
