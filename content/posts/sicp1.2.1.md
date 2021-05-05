---
title: "SICP1.2.1 Recursion & Iteration"
date: 2020-06-14T20:28:16+02:00
tags:
- SICP
---

Ok, second subchapter is more challenging, so I'll go by subsections.

Here is [link to the chapter of the book I would solve today](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-11.html#%_sec_1.2.1)

<!--more-->
## Exercise 1.9
This is trivial. This procedure generates recursive process:

```scheme
(define (+ a b)
  (if (= a 0)
      b
      (inc (+ (dec a) b))))
```


And this iterative:

```scheme
(define (+ a b)
  (if (= a 0)
      b
      (+ (dec a) (inc b))))
```

We could see this even without substitution model, if function returns itself in the and without any additional operation on its result - it is tail-recursive, so generates iterative process, otherwise - recursive.

## Exercise 1.10 (Ackerman function)

```scheme
(define (A x y)
  (cond ((= y 0) 0)
        ((= x 0) (* 2 y))
        ((= y 1) 2)
        (else (A (- x 1)
                 (A x (- y 1))))))
```


```scheme
(A 1 10)
    => (A 0 (A 1 9))
    => (* 2 (A 1 9))
    => (* 2 (*2 (A 1 8)))
    ...
    => (* 2^9 (A 1 1))
    => 2^10
```

```scheme
(A 2 4)
    => (A 1 (A 2 3))
    => 2^(A 2 3)
    ;;; see below ;;;
    => 2^16
```

```scheme
(A 2 3)
    => (A 1 (A 2 2)) 
    => 2^(A 2 2)
    ;;; see below ;;;
    => 2^4 => 16
```


```scheme
(A 2 2)
    => (A 1 (A 2 1))
    => (A 1 2)
    => (A 0 (A 1 1)) 
    => (* 2 2)
    => 4
```

```scheme
(A 3 3)
    => (A 2 (A 3 2))
    => (A 2 (A 2 (A 3 1)))
    => (A 2 (A 2 2))
    ;;; see one above ;;;
    => (A 2 4)
    ;;; see 3 above ;;;
    => 2^16
```



```scheme
(define (f n) (A 0 n))
```

`f(n) = 2n`

```scheme
 (define (g n) (A 1 n))
```

`g(n) = 2^n`

```scheme
(define (h n) (A 2 n))
```

`h(1) = 2`
`h(n) = 2^(h(n-1))`
