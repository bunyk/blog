
(define (add-interval x y)
  (make-interval (+ (lower-bound x) (lower-bound y))
                 (+ (upper-bound x) (upper-bound y))))

(define (mul-interval x y)
  (let ((p1 (* (lower-bound x) (lower-bound y)))
        (p2 (* (lower-bound x) (upper-bound y)))
        (p3 (* (upper-bound x) (lower-bound y)))
        (p4 (* (upper-bound x) (upper-bound y))))
    (make-interval (min p1 p2 p3 p4)
                   (max p1 p2 p3 p4))))

(define (div-interval x y)
  (mul-interval x 
                (make-interval (/ 1.0 (upper-bound y))
                               (/ 1.0 (lower-bound y)))))


;; Ex 2.7
(define (make-interval a b) (cons a b))

(define (lower-bound i)
  (min (car i) (cdr i)))

(define (upper-bound i)
  (max (car i) (cdr i)))


;; Ex 2.8 
(define (sub-interval x y)
  (make-interval 
    (- (lower-bound x) (upper-bound y))
    (- (upper-bound x) (lower-bound y))))

;; Ex 2.9

Let's have interval (a1,b1) of with w1 = b1 - a1. And similar interval (a2,b2) of with w2 = b2 - a2.

(a1,b1) + (a2,b2) = (a1 + a2, b1+b2)
with of this interval is (b1+b2) - (a1+a2) = (b1 - a1) + (b2-a2) = w1+w2

(a1,b1) - (a2,b2) = (a1 - b2, b1-a2)

with of this interval is (b1-a2) - (a1-b2) = b1 - a2 - a1 + b2 = (b1 - a1) + (b2-a2) = w1+w2


Multiplication counterexample

Let's multiply two intervals of width 1:
(1,2) * (1,2) = (1, 3) 
Gives interval of width 3.

Let's multiply another two intervals of width 1:
(1,2) * (2,3) = (2, 6) 

Gives interval of width 6. Width of multiplication could not be just function of width of arguments, because it's gives different results for the same inputs. It must be function of something else.

;; Ex 2.10

(define (spans-zero i)
  (and (<= (lower-bound i) 0) (>= (upper-bound i) 0))
)

(define (div-interval x y)
  (if (spans-zero y)
    (error "Could not divide by interval that spans zero")
    (mul-interval x 
                (make-interval (/ 1.0 (upper-bound y))
                               (/ 1.0 (lower-bound y))))
  )
)

;; Ex 2.11

(define (random-interval) 
  (make-interval (- (random 11) 5) (- (random 11) 5))
)
(define (eq-interval a b)
  (and
    (= (lower-bound a) (lower-bound b))
    (= (upper-bound a) (upper-bound b))
  )
)


(define (test-mul-interval) 
  (define (bad-pair i1 i2) 
    (display "Mul-iterval result differs for ")
    (display i1)
    (display i2)
    #f
  )
  (define (try n)
    (if (= n 0) #t
      (let (
            (i1 (random-interval))
            (i2 (random-interval))
        )
        (if (eq-interval (mul-interval2 i1 i2) (mul-interval i1 i2))
          (try (- n 1)) 
          (bad-pair i1 i2)
        )
      )
    )
  )
  (try 100)
)

(define (mul-interval2 x y)
  (let (
    (lx (lower-bound x))
    (ux (upper-bound x))
    (ly (lower-bound y))
    (uy (upper-bound y))
  )

  (cond 
    ((and (< ux 0) (< uy 0))
     (make-interval (* ux uy) (* lx ly)))

    ((and (spans-zero x) (< uy 0))
     (make-interval (* ux ly) (* lx ly)))

    ((and (> lx 0) (< uy 0))
     (make-interval (* ux ly) (* lx uy)))

    ((and (< ux 0) (spans-zero y))
     (make-interval (* lx uy) (* lx ly)))

    ((and (spans-zero x) (spans-zero y))
     (make-interval (min (* ux ly) (* lx uy)) (max (* lx ly) (* ux uy))))

    ((and (> lx 0) (spans-zero y))
     (make-interval (* ux ly) (* ux uy)))

    ((and (< ux 0) (> ly 0))
     (make-interval (* lx uy) (* ux ly)))

    ((and (spans-zero x) (> ly 0))
     (make-interval (* lx uy) (* ux uy)))

    ((and (> lx 0) (> ly 0))
     (make-interval (* lx ly) (* ux uy)))

    (else (error "impossible case"))
  ))
)

Wow this took a lot of effort. Good that they teached to use let, without it secod version of mul-interval would be huge.

And this required lots of attention, but somehow my code passed the test from the first try.

;; Ex 2.12

(define (make-center-width c w)
  (make-interval (- c w) (+ c w)))
(define (center i)
  (/ (+ (lower-bound i) (upper-bound i)) 2))
(define (width i)
  (/ (- (upper-bound i) (lower-bound i)) 2))

(define (make-center-percent c p)
  (let ((w (* p 0.01 (abs c))))
  (make-interval (- c w) (+ c w))))

(define (percent i)
  (* 100 (/ (width i) (center i)))
)

;; Ex 2.13

It's approximately addition.


;; Ex 2.14
(define (par1 r1 r2)
  (div-interval (mul-interval r1 r2)
                (add-interval r1 r2)))
(define (par2 r1 r2)
  (let ((one (make-interval 1 1))) 
    (div-interval one
                  (add-interval (div-interval one r1)
                                (div-interval one r2)))))

(define a (make-center-percent 100 1))
(define b (make-center-percent 200 1))


(center (par1 a b))
(center (par2 a b))

(percent (par1 a b))
(percent (par2 a b))

;; Ex 2.15

Every operation on intervals with non zero width increases width of result.

In par1 program does 3 operations in which both intervals have non zero widht, and par2 program does only addition, all the rest are operations with interval of zero widht.

;; Ex 2.16

No I can not, because this problem is very difficult. I imagine it will require simplification of expression to some base form, before computing it. 
