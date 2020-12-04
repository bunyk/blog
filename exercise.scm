SICP 2.5.2 Combining data of different types

Oh, I made a huge break between previous and this section, and now need to remind myself again a lot meaning of previously used code.


And [here is link to the book section](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-18.html#%_sec_2.5.2)

; Exercise 2.81

a) my guess is that it will go into infinite loop, because apply generic will not find procedure for given types, then
find coercion `t1->t2`, and then again `(apply-generic op (t1->t2 a1) a2))`

(load "lib.scm")
(define (scheme-number->scheme-number n) n)
(define (complex->complex z) z)
(put-coercion 'scheme-number 'scheme-number
              scheme-number->scheme-number)
(put-coercion 'complex 'complex complex->complex)

(define (exp x y) (apply-generic 'exp x y))


(define c1 (make-complex-from-real-imag 1 1))
(exp c1 c1)

And it loops.

b) Works perfectly on numbers where operation is defined:
(define n2 (make-scheme-number 2))
(exp n2 n2)

So, apply-generic is ok, we just need to define exp operation in complex package.

c)
(define (apply-generic op . args)
    (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
        (if proc
            (apply proc (map contents args))
            (if (= (length args) 2)
                (let ((type1 (car type-tags))
                      (type2 (cadr type-tags))
                      (a1 (car args))
                      (a2 (cadr args)))

                    (if (eq? type1 type2)  ; <-- Added this check
                        (error "No procedure for these types"
                             (list op type-tags)
                        )
                        (let ((t1->t2 (get-coercion type1 type2))
                              (t2->t1 (get-coercion type2 type1)))

                            (cond
                                (t1->t2 (apply-generic op (t1->t2 a1) a2))
                                (t2->t1 (apply-generic op a1 (t2->t1 a2)))
                                (else (error "No coercion for these types"
                                    (list op type-tags)
                                ))
                            )
                        )
                    )
                )
                (error "No procedure for these types"
                     (list op type-tags)
                )
            )
        )
    ))
)

Exercise 2.82

First, let's improve complex package like this (so we could have `add-complex` wit multiple arguments):

(define (install-complex-package)
  (define (tag z) (attach-tag 'complex z))

  ;; imported procedures from rectangular and polar packages
  (define (make-from-real-imag x y)
    (tag ((get 'make-from-real-imag 'rectangular) x y))
  )
  (define (make-from-mag-ang r a)
    (tag ((get 'make-from-mag-ang 'polar) r a))
  )
  ;; internal procedures
  (define (add-complex . args)
    (make-from-real-imag (apply + (map real-part args))
                         (apply + (map imag-part args))
  ))
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
  (put 'add '(complex complex) add-complex)
  (put 'add '(complex complex complex) add-complex)
  (put 'add '(complex complex complex complex) add-complex)
  (put 'sub '(complex complex) sub-complex)
  (put 'mul '(complex complex) mul-complex)
  (put 'div '(complex complex) div-complex)
  (put 'make-from-real-imag 'complex make-from-real-imag)
  (put 'make-from-mag-ang 'complex make-from-mag-ang)
  (put 'real-part '(complex) real-part)
  (put 'imag-part '(complex) imag-part)
  (put 'magnitude '(complex) magnitude)
  (put 'angle '(complex) angle)
  'done)
(install-complex-package)

(define (add . args) (apply apply-generic (cons 'add args)))

Now, we could add 3 complex numbers:

(define c1 (make-complex-from-real-imag 1 1))

(add c1 c1 c1)

But not yet `complex` and `scheme-number`:

(define n2 (make-scheme-number 2))

(define (scheme-number->complex n)
  (make-complex-from-real-imag (contents n) 0))

(put-coercion 'scheme-number 'complex scheme-number->complex)
(add c1 c1 n2)

Let's modify `apply-generic`:

(define (coerce-to type vals)
    (define (coerced val) 
        (cons val (coerce-to type (cdr vals)))
    )
    (if (null? vals)
        '()
        (if (eq? (type-tag (car vals)) type)
            (coerced (car vals))
            (let ((coercion (get-coercion (type-tag (car vals)) type)))
                (if coercion
                    (coerced (coercion (car vals)))
                    #f
                )
            )
        )
    )
)
; Test:
(coerce-to 'complex (map make-scheme-number '(1 2 3)))

(define (repeat el times)
    (define (ncons el lst n)
      (if (= n 0)
        lst
        (cons el (ncons el lst (- n 1)))
      )
    )
    (ncons el '() times)
)
; Test:
(repeat 1 5)

(define (try-to-apply-with-coercion op tags-to-try vals)
    (if (null? tags-to-try)
        (error "No procedure (even with coersion) for these values and operation"
             (list op vals)
        )
        (let ((proc (get op (repeat (car tags-to-try) (length vals)))))
            (if proc
                (apply proc (coerce-to (car tags-to-try) vals))
                (try-to-apply-with-coercion op (cdr tags-to-try) vals)
            )
        )
    )
)

(define (apply-generic op . args)
    (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
        (if proc
            (apply proc (map contents args))
            (try-to-apply-with-coercion
                op
                type-tags
                args
            )
        )
    ))
)


; Now test:
(add c1 c1 n2)
(add n2 c1 n2)

And this will not work for case when we for example have procedure to raise complex number to integer power, and would want to raise integer to integer power, without having any operation for exponentiating integers.

; Exercise 2.83
I will implement raising from scheme number to complex, the rest should be similar.

Inside complex package:

(define (scheme-number->complex n)
  (make-complex-from-real-imag n 0))
(put 'raise '(scheme-number) scheme-number->complex)


(define (raise . args) (apply apply-generic (cons 'raise args)))

(raise n2)

; ## Exercise 2.84

Let's add `type-level` operation to `scheme-number` and `comlex` packages:

  (put 'type-level '(scheme-number) (lambda (x) 0)) ; level 0
  
  (put 'type-level '(complex) (
    lambda (x) (+ 1 (type-level (make-scheme-number 0))) ; level nex after scheme-number
  ))

(define (type-level . args) (apply apply-generic (cons 'type-level args)))

; Test:
(type-level n2)
(type-level c1)


; Needed to avoid recursion when looking for raise for complex
(put 'raise '(complex) (lambda (x) x))

(define max-level 1)

(define (raise-one args)
    (let ((min-level (apply min (map type-level args))))
      (define (raise-first-min-level args)
        (if (= (type-level (car args)) min-level)
          (cons (raise (car args)) (cdr args))
          (cons (car args) (raise-first-min-level (cdr args)))
        )
      )
      (if (>= min-level max-level)
        (error "all arguments are already raised to max level" args)
        (raise-first-min-level args)
      )
    )
)
; Test:
(raise-one (list c1 n2 n2))

(define (apply-generic op . args)
    (let ((type-tags (map type-tag args)))
    (let ((proc (get op type-tags)))
        (if proc
            (apply proc (map contents args))
            (apply apply-generic (cons op (raise-one args)))
        )
    ))
)
; Test:
(add c1 n2 n2)


; Exercise 2.85

; project pushes an object down in the tower of types
; For example, projecting a complex number would involve throwing away the imaginary part.
; To lower real number to integer, we will round it
(define (project val)
)
; a number can be dropped if, when we project it and raise the result back to the type we started with, we end up with something equal to what we started with.
(define (drop val)
)
    Show how to implement this idea in detail, by writing a drop procedure that drops an object as far as possible. You will need to design the various projection operations53 and install project as a generic operation in the system. You will also need to make use of a generic equality predicate, such as described in exercise 2.79. Finally, use drop to rewrite apply-generic from exercise 2.84 so that it ``simplifies'' its answers. 
