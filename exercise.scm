(define (accumulate combiner null-value term a next b)
  (if (> a b)
    null-value
    (combiner
      (term a)
      (accumulate combiner null-value term (next a) next b)
    )
  )
)

(define (sum term a next b)
  (accumulate + 0 term a next b)
)

(define (product term a next b)
  (accumulate * 1 term a next b)
)

(define (accumulate combiner null-value term a next b)
  (define (iter a result)
    (if (> a b)
      result
      (iter (next a) (combiner (term a) result))
    )
  )
  (iter a null-value)
)

(define (filtered-accumulate combiner null-value term a next b filter)
  (define (iter a result)
    (if (> a b)
      result
      (if (filter a) 
          (iter (next a) result)
          (iter (next a) (combiner (term a) result))
      )
    )
  )
  (iter a null-value)
)

(define (sum-of-squares-of-primes-in-interval a b)
    (filtered-accumulate + 0 sqr a inc b prime?)
)

(define (product-of-relatively-primes-to n)
    (define (!rel-prime x)
      (not (= (gcd x n) 1))
    )
    (filtered-accumulate * 1 identity 1 inc n !rel-prime)
)
