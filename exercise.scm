(define zero (lambda (f) (lambda (x) x)))

(define (inc n) (lambda (f) (lambda (x) (f ((n f) x)))))

(define one (lambda (f) (lambda (x) (f x))))

(define two (lambda (f) (lambda (x) (f (f x)))))

(define (plus a b)
    (lambda (f) (lambda (x) ((a f) ((b f) x))))
)

; To debug if I placed parentheses correctly :)
(define (church-to-int n)
  ((n (lambda (x) (+ x 1))) 0)
)

(church-to-int (plus one two))
;Value: 3
