---
title: "SISP 2.1.1: Rational numbers"
date: 2020-07-08T23:41:33+02:00
tags:
- SICP
---

## Exercise 2.1
Here is how you construct rational number:

<!--more-->

{{< highlight scheme >}}
(define (make-rat n d)
  (let ((g (gcd n d))
       (sign (if (< d 0) -1 1)))
    (cons (/ n g sign) (/ d g sign))))

(define numer car)
(define denom cdr)

(define (print-rat x)
  (newline)
  (display (numer x))
  (display "/")
  (display (denom x)))
{{< /highlight >}}

That's it, change sign of both parts when denominator is negative, you could do that by multiplying or dividing by -1.
