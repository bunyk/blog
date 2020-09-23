---
title: "SICP 2.5.1 Generic arithmetic operations"
date: 2020-09-02T19:27:13+02:00
tags:
- SICP
---
In [previous post](/posts/sicp2.4/) I have used wrong StackOverflow answer. :) Or, to be more precise, right answer for that section, but useless here, as we want to store in table functions for multiple arguments. 

[Correct answer](https://stackoverflow.com/a/19114031/816449) that supports lists looks like this:
{{< highlight scheme >}}
(define *op-table* (make-hash-table))

(define (put op type proc)
  (hash-table/put! *op-table* (list op type) proc))

(define (get op type)
  (hash-table/get *op-table* (list op type) #f))
{{< /highlight >}}

<!--more-->

Also I needed to copypaste a lot of code to be able to start working on [first exercise](#exercise-2-77): 

{{< highlight scheme >}}
(define (attach-tag type-tag contents)
  (cons type-tag contents))
(define (type-tag datum)
  (if (pair? datum)
      (car datum)
      (error "Bad tagged datum -- TYPE-TAG" datum)))
(define (contents datum)
  (if (pair? datum)
      (cdr datum)
      (error "Bad tagged datum -- CONTENTS" datum)))

(define (apply-generic op . args)
  (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
      (if proc
          (apply proc (map contents args))
          (error
            "No method for these types -- APPLY-GENERIC"
            (list op type-tags))))))

(define (real-part z) (apply-generic 'real-part z))
(define (imag-part z) (apply-generic 'imag-part z))
(define (magnitude z) (apply-generic 'magnitude z))
(define (angle z) (apply-generic 'angle z))



(define (install-rectangular-package)
  ;; internal procedures
  (define (real-part z) (car z))
  (define (imag-part z) (cdr z))
  (define (make-from-real-imag x y) (cons x y))
  (define (magnitude z)
    (sqrt (+ (square (real-part z))
             (square (imag-part z)))))
  (define (angle z)
    (atan (imag-part z) (real-part z)))
  (define (make-from-mag-ang r a) 
    (cons (* r (cos a)) (* r (sin a))))
  ;; interface to the rest of the system
  (define (tag x) (attach-tag 'rectangular x))
  (put 'real-part '(rectangular) real-part)
  (put 'imag-part '(rectangular) imag-part)
  (put 'magnitude '(rectangular) magnitude)
  (put 'angle '(rectangular) angle)
  (put 'make-from-real-imag 'rectangular 
       (lambda (x y) (tag (make-from-real-imag x y))))
  (put 'make-from-mag-ang 'rectangular 
       (lambda (r a) (tag (make-from-mag-ang r a))))
  'done)
(install-rectangular-package)

(define (install-polar-package)
  ;; internal procedures
  (define (magnitude z) (car z))
  (define (angle z) (cdr z))
  (define (make-from-mag-ang r a) (cons r a))
  (define (real-part z)
    (* (magnitude z) (cos (angle z))))
  (define (imag-part z)
    (* (magnitude z) (sin (angle z))))
  (define (make-from-real-imag x y) 
    (cons (sqrt (+ (square x) (square y)))
          (atan y x)))
  ;; interface to the rest of the system
  (define (tag x) (attach-tag 'polar x))
  (put 'real-part '(polar) real-part)
  (put 'imag-part '(polar) imag-part)
  (put 'magnitude '(polar) magnitude)
  (put 'angle '(polar) angle)
  (put 'make-from-real-imag 'polar
       (lambda (x y) (tag (make-from-real-imag x y))))
  (put 'make-from-mag-ang 'polar 
       (lambda (r a) (tag (make-from-mag-ang r a))))
  'done)
(install-rectangular-package)

(define (install-complex-package)
  ;; imported procedures from rectangular and polar packages
  (define (make-from-real-imag x y)
    ((get 'make-from-real-imag 'rectangular) x y))
  (define (make-from-mag-ang r a)
    ((get 'make-from-mag-ang 'polar) r a))
  ;; internal procedures
  (define (add-complex z1 z2)
    (make-from-real-imag (+ (real-part z1) (real-part z2))
                         (+ (imag-part z1) (imag-part z2))))
  (define (sub-complex z1 z2)
    (make-from-real-imag (- (real-part z1) (real-part z2))
                         (- (imag-part z1) (imag-part z2))))
  (define (mul-complex z1 z2)
    (make-from-mag-ang (* (magnitude z1) (magnitude z2))
                       (+ (angle z1) (angle z2))))
  (define (div-complex z1 z2)
    (make-from-mag-ang (/ (magnitude z1) (magnitude z2))
                       (- (angle z1) (angle z2))))
  ;; interface to rest of the system
  (define (tag z) (attach-tag 'complex z))
  (put 'add '(complex complex)
       (lambda (z1 z2) (tag (add-complex z1 z2))))
  (put 'sub '(complex complex)
       (lambda (z1 z2) (tag (sub-complex z1 z2))))
  (put 'mul '(complex complex)
       (lambda (z1 z2) (tag (mul-complex z1 z2))))
  (put 'div '(complex complex)
       (lambda (z1 z2) (tag (div-complex z1 z2))))
  (put 'make-from-real-imag 'complex
       (lambda (x y) (tag (make-from-real-imag x y))))
  (put 'make-from-mag-ang 'complex
       (lambda (r a) (tag (make-from-mag-ang r a))))
  (put 'real-part '(complex) real-part)
  (put 'imag-part '(complex) imag-part)
  (put 'magnitude '(complex) magnitude)
  (put 'angle '(complex) angle)
  'done)
(install-complex-package)
{{< /highlight >}}

## Exercise 2.77

{{< highlight scheme >}}
(define z (cons 'complex (cons 'rectangular (cons 3 4))))

(magnitude z)
{{< /highlight >}}

It calls `apply-generic` to do operation `'magnitude` with z

{{< highlight scheme >}}
(apply-generic 'magnitude (cons 'complex (cons 'rectangular (cons 3 4))))
{{< /highlight >}}

`apply-generic` looks for operation `'magnitude` for `'complex` numbers, and applies it to value inside

{{< highlight scheme >}}
(apply (get 'magnitude 'complex) (cons 'rectangular (cons 3 4)))
{{< /highlight >}}

That operation, thanks to Alyssa P. Hacker, is just application of same `magnitude` function, but this time for `'rectangular` object

{{< highlight scheme >}}
(magnitude (cons 'rectangular (cons 3 4)))
{{< /highlight >}}

apply-generic applies operation 'magnitude for 'rectangular type to content of rectangular "package":

{{< highlight scheme >}}
(apply (get 'magnitude 'rectangular) (cons 3 4))
{{< /highlight >}}

which is `magnitude` function from inside rectangular package

{{< highlight scheme >}}
(magnitude (cons 3 4))
(sqrt (+ (square 3)
         (square 4)))
5
{{< /highlight >}}

## Exercise 2.78

{{< highlight scheme >}}
(define (attach-tag type-tag contents)
  (if (eq? type-tag 'scheme-number)
    contents
    (cons type-tag contents)
  )
)
(define (type-tag datum)
  (cond
    ((number? datum) 'scheme-number)
    ((pair? datum) (car datum))
    (else (error "Bad tagged datum -- TYPE-TAG" datum))
  )
)
(define (contents datum)
  (cond
    ((number? datum) datum)
    ((pair? datum) (cdr datum))
    (else (error "Bad tagged datum -- CONTENTS" datum))
  )
)
{{< /highlight >}}

To test:

{{< highlight scheme >}}
(define (add x y) (apply-generic 'add x y))
(define (sub x y) (apply-generic 'sub x y))
(define (mul x y) (apply-generic 'mul x y))
(define (div x y) (apply-generic 'div x y))

(define (install-scheme-number-package)
  (define (tag x)
    (attach-tag 'scheme-number x))    
  (put 'add '(scheme-number scheme-number)
       (lambda (x y) (tag (+ x y))))
  (put 'sub '(scheme-number scheme-number)
       (lambda (x y) (tag (- x y))))
  (put 'mul '(scheme-number scheme-number)
       (lambda (x y) (tag (* x y))))
  (put 'div '(scheme-number scheme-number)
       (lambda (x y) (tag (/ x y))))
  (put 'make 'scheme-number
       (lambda (x) (tag x)))
  'done)
(install-scheme-number-package)
{{< /highlight >}}

## Exercise 2.79

{{< highlight scheme >}}
(put 'equ? '(scheme-number scheme-number) =)

(put 'equ? '(complex complex)
     (lambda (x y) (and
        (= (real-part x) (real-part y))
        (= (imag-part x) (imag-part y))
    ))
)
(define (equ? x y) (apply-generic 'equ? x y))
{{< /highlight >}}


## Exercise 2.80
{{< highlight scheme >}}
(put 'zero? '(scheme-number)
     (lambda (x) (= x 0))
)
(put 'zero? '(complex)
     (lambda (x) (= (magnitude x) 0))
)
(define (zero? x) (apply-generic 'zero? x))
{{< /highlight >}}

