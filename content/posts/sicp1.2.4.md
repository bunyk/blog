---
title: "SICP 1.2.4 Exponentiation"
date: 2020-06-20T19:04:58+02:00
tags:
- SICP
---

Today I learned that ancient mit-scheme REPL could be improved with history & tab completion. Thanks to this [StackOverflow answer](https://stackoverflow.com/a/11916365/816449). `sudo apt-get install rlwrap`, and then run scheme as `rlwrap scheme` That answer is not very recent too, but here we are trying to learn really ancient magic.

And [this section](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-11.html#%_sec_1.2.4) really starts to feel like magic. In the end, I learned that there is a way to compute n-th Fibonacci number with time complexity `O(log(n))`. And just few sections before, authors show how computing Fibonacci sequence using wrong approach could blow up exponencially.

<!-- more -->

## Exercise 1.16: Fast exponentiation
{{< highlight scheme >}}
(define (sqr x) (* x x))
(define (fast-exp x n) 
    (define (iter x n a) 
       (cond
       ((= n 0) a)
       ((even? n) (iter (sqr x) (/ n 2) a))
       (else (iter x (- n 1) (* a x)))
       ) 
    )
    (iter x n 1)
)
{{< /highlight >}}


## Exercise 1.17: "Fast" multiplication

{{< highlight scheme >}}
(define (double x) (+ x x))
(define (halve x) (/ x 2))

(define (fast-m a b) 
    (cond ((= b 1) a)
        ((even? b) (fast-m (double a) (halve b)))
        (else (+ a (fast-m a (- b 1)))
    )
)
{{< /highlight >}}

## Exercise 1.18: Iterative multiplicaton

{{< highlight scheme >}}
(define (fast-m a b) 
    (define (iter a b p) 
       (cond
       ((= b 1) (+ a p))
       ((even? b) (iter (double a) (halve b) p))
       (else (iter a (- b 1) (+ p a)))
       ) 
    )
    (iter a b 0)
)
{{< /highlight >}}

## Exercise 1.19: Fast Fibonacci
With this exercise first, you discover that there is Fibonacci sequence inside Fibonacci formulas, and then, you figure out from where there appears exponential rise. Magical:

{{< highlight scheme >}}
(define (fib n)
  (fib-iter 1 0 0 1 n))
(define (fib-iter a b p q count)
  (cond ((= count 0) b)
        ((even? count)
         (fib-iter a
                   b
                   (+ (* p p) (* q q))   ; compute p'
                   (+ (* q q) (* 2 p q)) ; compute q'
                   (/ count 2)))
        (else (fib-iter (+ (* b q) (* a q) (* a p))
                        (+ (* b p) (* a q))
                        p
                        q
                        (- count 1)))))
{{< /highlight >}}

I not dediced yet on how to get latex in Hugo, so I'll not add here my calculations for `p'` and `q'`.
