---
title: "SICP 1.3.3 Procedures as general methods"
date: 2020-06-29T23:32:06+02:00
tags:
- SICP
---

I'll attach solution from previous section to this post as it was the only exercise there.

<!-- more -->

## Exercise 1.34 Runtime error with types

{{< highlight scheme >}}
(define (f g)
  (g 2))
(f f) -> (f 2) -> (2 2)
{{< /highlight >}}

2 is obviously not a function, so scheme gives error when you try to apply it as function.

## Exercise 1.35 Use fixed point procedure for finding golden ratio
So, let's divide both sides of equation Φ<sup>2</sup> = Φ + 1. We get Φ  = 1 + 1/Φ - and this is exactly the formula to find fixed point for.

{{< highlight scheme >}}
(define tolerance 0.00001)
(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) tolerance))
  (define (try guess)
    (let ((next (f guess)))
      (if (close-enough? guess next)
          next
          (try next))))
  (try first-guess))
(fixed-point (lambda (x) (+ 1 (/ 1 x))) 1.0)
{{< /highlight >}}

## Exercise 1.36 Printing sequence of approximations

{{< highlight scheme >}}
(define tolerance 0.00001)
(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) tolerance))
  (define (try guess)
    (let ((next (f guess)))
      (display "Approximation: ") (display next)(newline)
      (if (close-enough? guess next)
          next
          (try next))))
  (try first-guess))
(fixed-point (lambda (x) (/ (log 1000) (log x))) 2.0)
{{< /highlight >}}

## Exercise 1.37 Golden ratio from continued fraction

{{< highlight scheme >}}
(define (cont-frac n d k)
  (define (iter i) 
    (/ (n i) (if (= i k)
       (d i)
       (+ (d i) (iter (+ i 1)))
    ))
  )
  (iter 1)
)

(define (golden k)
    (/ 1 (cont-frac (lambda (i) 1.0)
           (lambda (i) 1.0)
           k))
)

(golden 12)
;Value: 1.6180555555555558

{{< /highlight >}}

Iterative continuous fraction: 
{{< highlight scheme >}}
(define (cont-frac n d k)
  (define (iter i result) 
    (if (= i 0)
      result
      (iter
        (- i 1)
        (/ (n i) (+ (d i) result))
      )
    )
  )
  (iter k 0)
)
{{< /highlight >}}


## Exercise 1.38 Euler number
{{< highlight scheme >}}
(define (e k)
  (+ 2 (cont-frac
         (lambda (i) 1.0)
         (lambda (i)
           (if (= (remainder i 3) 2)
             (* (+ 1 (floor (/ i 3))) 2)
             1.0
            )
         )
         k
  ))
)

(e 15)
;Value: 2.718281828470584
{{< /highlight >}}

## Exercise 1.39 Continued fraction tangent
{{< highlight scheme >}}
(define (tan x k)
  (let ((n_sqr (- 0 (* x x))))
      (/ x (+ 1 (cont-frac
        (lambda (i) n_sqr)
        (lambda (i) (+ 1 (* i 2)))
        k
      )))
  )
)

(tan (/ pi 4) 100)
;Value: .9999999732051038

(tan (/ pi 2) 1000)
;Value: 37320539.58514773

(tan 0 100)
;Value: 0
{{< /highlight >}}
Approximately so.
