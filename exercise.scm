
(define (cont-frac n d k)
  (define (iter i result) 
    (if (= i 0)
      result
      (iter
        (- i 1)
        (/ (n i) (+ (d i) result))
      )
    )
  )
  (iter k 0)
)


(define (golden k)
    (/ 1 (cont-frac (lambda (i) 1.0)
           (lambda (i) 1.0)
           k))
)

(golden 12)
;Value: 1.6180555555555558

(define seq
         (lambda (i)
           (if (= (remainder i 3) 2)
             (* (+ 1 (floor (/ i 3))) 2)
             1.0
            )
         )
)
(seq 1)
(seq 2)
(seq 3)
(seq 4)
(seq 5)
(seq 6)

(define (e k)
  (+ 2 (cont-frac
         (lambda (i) 1.0)
         (lambda (i)
           (if (= (remainder i 3) 2)
             (* (+ 1 (floor (/ i 3))) 2)
             1.0
            )
         )
         k
  ))
)


(define (tan x k)
  (let ((n_sqr (- 0 (* x x))))
      (/ x (+ 1 (cont-frac
        (lambda (i) n_sqr)
        (lambda (i) (+ 1 (* i 2)))
        k
      )))
  )
)
