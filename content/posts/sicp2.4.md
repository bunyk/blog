---
title: "SICP 2.4 Multiple representations for abstract data"
date: 2020-08-26T19:03:55+02:00
tags:
- SICP
---

I went on vacation and lost cadence on this project. Need to get back on track, remember how to launch interpreter, etc. :)

In this chapter we will need `get` and `put` functions which could be implemented by similar system functions.

Found this on [StackOverflow](https://stackoverflow.com/a/29465496/816449), of course.

```scheme
(define put 2d-put!)
(define (get a b)
    ;(display "get ") (display a) (display b) (newline)
    (2d-get a b)
)
```

<!--more-->

And some setup from [previous section](/posts/sicp2.3.2):

```scheme
(define variable? symbol?)
(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))
(define (=number? exp num)
  (and (number? exp) (= exp num)))
```

## Exercise 2.73


```scheme
(define (deriv exp var)
   (cond ((number? exp) 0)
         ((variable? exp) (if (same-variable? exp var) 1 0))
         (else ((get 'deriv (operator exp)) (operands exp)
                                            var))))
(define (operator exp) (car exp))
(define (operands exp) (cdr exp))
```

a) So, in our new derive we do lookup in table instead of `cond` expression. We are not able to move `number?` into lookup, because `number?` is condition for a set of values, not just one value, and table works only with one value.

b)

```scheme
(define (make-sum args) 
    (define (sum items total nonnum)
        (cond
            ((null? items)
                (if (null? nonnum)
                    total
                    (cons '+ (if (= total 0)
                                nonnum
                                (cons total nonnum)
                    ))
                )
            )
            ((number? (car items))
                (sum (cdr items) (+ (car items) total) nonnum))
            (else
                (sum (cdr items) total (cons (car items) nonnum)))
        )
    )
    (sum args 0 '())
)

(define (make-prod m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list '* m1 m2))))

(define (install-derivatives-package) 
  (define (deriv-sum items var)
    (make-sum (map (lambda (e) (deriv e var)) items))
  )
  (put 'deriv '+ deriv-sum)

  (define (deriv-prod items var)
    (let ((tail
        (if (null? (cddr items))
            (cadr items)
            (cons '* (cdr items))
        )
    ))
        (make-sum (list 
           (make-prod (car items)
                      (deriv tail var))
           (make-prod (deriv (car items) var)
                      tail)
        ))
    )
  )
  (put 'deriv '+ deriv-sum)
  (put 'deriv '* deriv-prod)
)
(install-derivatives-package) 
```

I think I wrote too much code here because I wanted to support sums and products of multiple arguments.

c) Exponentation

```scheme
(define (make-exp base e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) base)
        (else (list '** base e))))

  (define (deriv-exp items var)
    (let (
        (base (car items))
        (e (cadr items))
    )
        (make-prod
            e
            (make-exp base (- e 1))
        )
    )
  )
  (put 'deriv '** deriv-exp)

(deriv '(+ (** x 3) (** x 2)) 'x)
```

d) We could switch arguments inside `get`, or inside `put`, or switch arguments when we call put. That's all what will be needed.

## Exercise 2.74
I skipped it because it is too abstract. 

## Exercise 2.75

```scheme
(define (make-from-mag-ang r a) 
  (define (dispatch op)
    (cond ((eq? op 'real-part) (* r (cos a)))
          ((eq? op 'imag-part) (* r (sin a)))
          ((eq? op 'magnitude) r)
          ((eq? op 'angle) a)
          (else
           (error "Unknown op -- MAKE-FROM-REAL-IMAG" op))))
  dispatch)
```

## Exercise 2.76
Skip this too. Because I see no way to verify that I did it correctly. Learning needs feedback.

