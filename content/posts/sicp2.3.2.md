---
title: "SICP 2.3.2 Symbolic differentiation"
date: 2020-07-26T09:00:47+02:00
tags:
- SICP
---

I decided to skip picture language, because of technical reasons. Also, 2.3.1 I'll do in this post, because it was just to short. Here we get one step clother to build interpreter, not yet for programming language, but at least for mathematical expressions.

And now we are in the middle of second chapter.

<!--more-->

## Exercise 2.54

```scheme
(define (equal? l1 l2)
  (if (pair? l1)
    (if (pair? l2)
      (if (equal? (car l1) (car l2))
        (equal? (cdr l1) (cdr l2))
        #f
      )
      #f
    )
    (if (pair? l2)
      #f
      (eq? l1 l2) 
    )
  )
)
(equal? (list 1 2) '(1 2))
(equal? '() '())
(equal? 'a 'a)
(equal? 'a 'b)
(equal? '(1 2) '(list 1 2))
```

## Exercise 2.55

`''abracadabra` is actually a `(quote (quote abracadabra))` which has value `(quote abracadabra)`, and `car` of it is `quote`.


## Exercise 2.56

```scheme
(define (variable? x) (symbol? x))

(define (same-variable? v1 v2)
  (and (variable? v1) (variable? v2) (eq? v1 v2)))

(define (=number? exp num)
  (and (number? exp) (= exp num)))

(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2)
        ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        (else (list '+ a1 a2))))

(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list '* m1 m2))))

(define (sum? x)
  (and (pair? x) (eq? (car x) '+)))

(define (addend s) (cadr s))

(define (augend s) (caddr s))

(define (product? x)
  (and (pair? x) (eq? (car x) '*)))

(define (multiplier p) (cadr p))

(define (multiplicand p) (caddr p))

(define (exponentiation? x)
  (and (pair? x) (eq? (car x) '**)))

(define (base e) (cadr e))

(define (exponent e) (caddr e))
 
(define (make-exponentiation base e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) base)
        (else (list '** base e))))

(define (deriv exp var)
  (cond ((number? exp) 0)
        ((variable? exp)
         (if (same-variable? exp var) 1 0))
        ((sum? exp)
         (make-sum (deriv (addend exp) var)
                   (deriv (augend exp) var)))
        ((product? exp)
         (make-sum
           (make-product (multiplier exp)
                         (deriv (multiplicand exp) var))
           (make-product (deriv (multiplier exp) var)
                         (multiplicand exp))))
        ((exponentiation? exp)
         (make-product (exponent exp) (make-exponentiation 
                (base exp)
                (- (exponent exp) 1)
            )))
        (else
         (error "unknown expression type -- DERIV" exp))))


(deriv '(+ (** x 3) (** x 2)) 'x)
```

## Exercise 2.57


```scheme
(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2)
        ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        ((sum? a2) (append (list '+ a1) (cdr a2)))
        (else (list '+ a1 a2))))

(define (addend s) (cadr s))

(define (augend s) 
  (if (null? (cdddr s))
    (caddr s)
    (cons '+ (cddr s))))

(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        ((product? m2) (append (list '* m1) (cdr m2)))
        (else (list '* m1 m2))))


(define (multiplier p) (cadr p))

(define (multiplicand s) 
  (if (null? (cdddr s))
    (caddr s)
    (cons '* (cddr s))))

(deriv '(+ x (* x x x) (** x 3)) 'x)
;Value 30: (+ 1 (+ (* x (+ x x)) (* x x)) (* 3 (** x 2)))
```

## Exercise 2.58

So, we want this to work:

```scheme
(deriv '(x + x**2 + 3 * x**3) 'x)
```

At first I wanted to add some parsing step that converts this to lisp, and then reread requirements, and found this: "Can you design appropriate predicates, selectors, and constructors for this notation such that our derivative program still works?"

So, no transformation, this should be the format of data, and we need to change functions that work with it.

```scheme
(define (priority sym)
  (cond 
    ((eq? sym '+) 1)
    ((eq? sym '*) 2)
    ((eq? sym '**) 3)
    ((number? sym) 4)
    ((variable? sym) 4)
    ((pair? sym) 4)
    (else (error "unknown symbol --priority" sym))
  )
)

(define (least-priority-operation exp)
    (define (iter op min-pr exp)
        (if (null? exp)
            op
            (let ((np (priority (car exp))))
                (if (< np min-pr)
                    (iter (car exp) np (cdr exp))
                    (iter op min-pr (cdr exp))
                )
            )
        )
    )
    (iter (car exp) (priority (car exp)) (cdr exp))
)

(least-priority-operation '(x + x**2 + 3 * x**3))
(least-priority-operation '(x * y ** 2))
(least-priority-operation '(y ** 2))

(define (unwrap val) 
    (if (and (pair? val) (null? (cdr val)))
        (car val)
        val
    )
)

; Return part of expression before first appearance of given symbol
(define (before sym exp)
    (if (or (null? exp) (eq? (car exp) sym))
        '()
        (cons
            (car exp)
            (before sym (cdr exp))
        )
    )
)

(before '+ '(y ** 2 + 3))

; Return part of expression after symbol
; BTW, for division to work properly we need to take last occurence here, but 
; as we don't have division - I'll leave it with first
(define (after sym exp)
    (if (null? exp)
        '()
        (if (eq? (car exp) sym)
            (unwrap (cdr exp))
            (after sym (cdr exp))
        )
    )
)

(after '+ '(y ** 2 + 3))

(define (make-sum a1 a2)
  (cond ((=number? a1 0) a2)
        ((=number? a2 0) a1)
        ((and (number? a1) (number? a2)) (+ a1 a2))
        (else (list a1 '+ a2))))

(define (make-product m1 m2)
  (cond ((or (=number? m1 0) (=number? m2 0)) 0)
        ((=number? m1 1) m2)
        ((=number? m2 1) m1)
        ((and (number? m1) (number? m2)) (* m1 m2))
        (else (list m1 '* m2))))

(define (sum? x)
  (and (pair? x) (eq? (least-priority-operation x) '+)))

(define (addend s) (unwrap (before '+ s)))

(define (augend s) (after '+ s))

(define (product? x)
  (and (pair? x) (eq? (least-priority-operation x) '*)))

(define (multiplier p) (unwrap (before '* p)))

(define (multiplicand p) (after '* p))

(define (exponentiation? x)
  (and (pair? x) (eq? (least-priority-operation x) '**)))

(define (base e) (unwrap (before '** e)))

(define (exponent e) (after '** e))
 
(define (make-exponentiation base e)
  (cond ((=number? e 0) 1)
        ((=number? e 1) base)
        (else (list base '** e))))

(deriv '(x + x ** 2 + 3 * x ** 3) 'x)
```

This is rather ugly (I don't like `before`, `after`, `unwrap` etc., it does not seem very performant to use them), but I see we will have another example Symbolic Algebra later, maybe there will be a chance to make it better.
