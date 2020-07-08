(define (inc x) (+ x 1))

(define (sqr x) (* x x))

(define (compose f g) 
  (lambda (x) (f (g x)))
)
(define (double f)
  (lambda (x) (f (f x)))
)

((compose sqr inc) 6)

(define (repeated f n) 
  (if (= n 1)
    f
    (if (even? n)
      (repeated (double f) (/ n 2))
      (compose f (repeated f (- n 1)))
    )
  )
)

(define tolerance 0.00001)
(define (fixed-point f first-guess)
  (define (close-enough? v1 v2)
    (< (abs (- v1 v2)) tolerance))
  (define (try guess limit)
    (display guess) (newline); to debug trace
    (let ((next (f guess)))
      (if (= limit 0)
        (error "Reached iteration limit")
        (if (close-enough? guess next)
            next
            (try next (- limit 1)))
      )))
  (try first-guess 1000)
)

(define (average-damp f) 
  (lambda (y) (/ (+ (f y) y) 2))
)

(define (npow x n)
  (if (= n 1) x (* x (npow x (- n 1)) ))
)

(define (n-root x n) 
  (fixed-point
    ((repeated average-damp (/ n 2)) (lambda (y) (/ x (npow y (- n 1)))))
    1
  )
)

(define (iterative-improve good-enough next)
  (define (iter guess) 
    (if (good-enough guess)
      guess
      (iter (next guess))
    )
  )
  iter
)

(define (~= a b) 
  (< (abs (- a b)) 0.00001)
)

(define (sqrt x) 
  ((iterative-improve
    (lambda (y) (~= (* y y) x))
    (lambda (y) (/ (+ y (/ x y)) 2))
  ) 1.0)
)

(define (fixed-point f first-guess)
  ((iterative-improve
     (lambda (y) (~= (f y) y))
     f
  ) first-guess)
)
