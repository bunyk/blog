---
title: "SICP 2.2.3 Sequences as Conventional Interfaces"
date: 2020-07-23T20:21:19+02:00
tags:
- SICP
---

Here we become skilled in list manipulation and build a set of useful subroutines.

<!--more-->

## Exercise 2.33

{{< highlight scheme >}}
(define (accumulate op initial sequence)
  (if (null? sequence)
      initial
      (op (car sequence)
          (accumulate op initial (cdr sequence)))))

(define (map p sequence)
  (accumulate (lambda (x y) (cons (p x) y)) nil sequence))

(map (lambda (x) (+ 1 x)) (list 1 2 3))

(define (append seq1 seq2)
  (accumulate cons seq2 seq1))

(append (list 1 2 3) (list 4 5))


(define (length sequence)
  (accumulate (lambda (x y) (+ 1 y)) 0 sequence))
{{< /highlight >}}

## Exercise 2.34

{{< highlight scheme >}}
(define (horner-eval x coefficient-sequence)
  (accumulate (lambda (this-coeff higher-terms) (+ this-coeff (* higher-terms x)))
              0
              coefficient-sequence))

(horner-eval 2 (list 1 3 0 5 0 1))
; 79
{{< /highlight >}}

## Exercise 2.35

{{< highlight scheme >}}
(define (identity x) x)

(define (count-leaves t)
  (accumulate (lambda (head tail)
    (+ (if (pair? head) (count-leaves head) 1) tail)
  ) 0 (map identity t)))
{{< /highlight >}}

Don't know why map is here...

## Exercise 2.36
{{< highlight scheme >}}
(define (accumulate-n op init seqs)
  (if (null? (car seqs))
      nil
      (cons (accumulate op init (map car seqs))
            (accumulate-n op init (map cdr seqs)))))

(define s (list (list 1 2 3) (list 4 5 6) (list 7 8 9) (list 10 11 12)))
(accumulate-n + 0 s)
{{< /highlight >}}

## Exercise 2.37

{{< highlight scheme >}}
(define (dot-product v w)
  (accumulate + 0 (map * v w)))

(define (matrix-*-vector m v)
  (map (lambda (m-row) (dot-product m-row v)) m))

(matrix-*-vector (list (list 0 -1) (list 1 0)) (list 1 0))

(define (transpose mat)
  (accumulate-n cons nil mat))

(define (matrix-*-matrix m n)
  (let ((cols (transpose n)))
    (map (lambda (m-row)
           (map (lambda (n-col)
                  (dot-product m-row n-col)
                )
            cols
           )
         ) m)))
{{< /highlight >}}


## Exercise 2.38

I guess, if operation is commutative and associative, then it does not matter which fold to use, otherwise it matters.


## Exercise 2.39

{{< highlight scheme >}}
(define (reverse sequence)
  (fold-right (lambda (x y) (append y (list x))) nil sequence))
(define (reverse sequence)
  (fold-left (lambda (x y) (cons y x)) nil sequence))
{{< /highlight >}}

# Exercise 2.40

{{< highlight scheme >}}
(define (enumerate-interval low high)
  (if (> low high)
      nil
      (cons low (enumerate-interval (+ low 1) high))))

(define (flatmap proc seq)
  (accumulate append nil (map proc seq)))

(define (unique-pairs n)
  (flatmap (lambda (i)
    (map (lambda (j) (list i j)) (enumerate-interval 1 (- i 1)))
  ) (enumerate-interval 2 n))
)
(unique-pairs 5)

(define (any l) 
  (if (null? l)
    #f
    (if (car l)
      #t
      (any (cdr l))
    )
  )
)
(define (prime? n)
  (define (divisor? x) (= (remainder n x) 0))
  (not (any (map divisor? (enumerate-interval 2 (truncate (/ n 2))))))
)
(define (test-prime)
  (map (lambda (n) (list n (prime? n))) (enumerate-interval 1 20))
)
(test-prime)

(define (prime-sum-pairs n)
    (define (prime-sum? pair)
      (prime? (+ (car pair) (cadr pair))))

    (define (make-pair-sum pair)
      (list (car pair) (cadr pair) (+ (car pair) (cadr pair))))

  (map make-pair-sum
       (filter prime-sum? (unique-pairs n))))
(prime-sum-pairs 6)
{{< /highlight >}}

## Exercise 2.41

{{< highlight scheme >}}
; 1 <= i < j < k <= n
; i + j + k = s
(define (triplets n s)
  (define (build-triplet i j)
    (let ((k (- s i j)))
      (if (and (< j k) (<= k n))
        (list i j k)
        0
      )
    )
  )
  (flatmap (lambda (i)
    (filter pair? (map (lambda (j)
        (build-triplet i j)
    ) (enumerate-interval (+ i 1) (- n 1)))))
    (enumerate-interval 1 (- n 2))
  ))
(triplets 4 6)
{{< /highlight >}}


## Exercise 2.42

{{< highlight scheme >}}
(define empty-board (list)) ; or nil
(define (adjoin-position new-row k rest-of-queens)
  (cons new-row rest-of-queens)
)
; Check that predicate p(i, elem) is true at least for one of elements of list
(define (any p l)
  (define (iter l i)
    (if (null? l) #f
      (if (p (car l) i)
        #t
        (iter (cdr l) (+ i 1))
      )
    )
  )
  (iter l 1)
)
(any = (list 3 2 1))
(any = (list 2 3 4))

(define (safe? k positions)
  (let (
    (row (car positions))
    (d1 (+ (car positions) 1))
    (d2 (- (car positions) 1))
  )
    (not (any (lambda (q i)
        (or (= q row)
            (= d1 (+ q i 1)) ; i should be increased by 1 because we are in cdr of board
            (= d2 (- q i 1))
        )
    ) (cdr positions)))
  )
)
(safe? 0 (list 1 2))
(safe? 0 (list 1 1))
(safe? 0 (list 3 1 4 2))
(define (queens board-size)
  (define (queen-cols k)  
    (if (= k 0)
        (list empty-board)
        (filter
         (lambda (positions) (safe? k positions))
         (flatmap
          (lambda (rest-of-queens)
            (map (lambda (new-row)
                   (adjoin-position new-row k rest-of-queens))
                 (enumerate-interval 1 board-size)))
          (queen-cols (- k 1))))))
  (trace queen-cols)
  (queen-cols board-size))
(queens 6)

(define (display-board positions size)
    (define (display-empty n)
      (if (> n 0) (begin
        (display " .")
        (display-empty (- n 1))
      ))
    )
    (define (display-row q)
        (display-empty (- q 1))
        (display " Q")
        (display-empty (- size q))
        (newline)
    )
    (for-each display-row positions)
    (newline)
)
(define (test-queens size)
    (for-each
      (lambda (b) (display-board b size))
      (queens size)
    )
)
(test-queens 6)

; Beautiful:
; . . . . Q .
; . . Q . . .
; Q . . . . .
; . . . . . Q
; . . . Q . .
; . Q . . . .
;
; . . . Q . .
; Q . . . . .
; . . . . Q .
; . Q . . . .
; . . . . . Q
; . . Q . . .
;
; . . Q . . .
; . . . . . Q
; . Q . . . .
; . . . . Q .
; Q . . . . .
; . . . Q . .
;
; . Q . . . .
; . . . Q . .
; . . . . . Q
; Q . . . . .
; . . Q . . .
; . . . . Q .
{{< /highlight >}}

## Exercise 2.43

For size 0 basically running time is the same.

For size 1, we call `(quen-cols 0)` once, check position 1 and return, same for Louis.

For size 2, we call `(queen-cols 1)` once, check positions for next queen 1 and 2, and return. Louis calls (queen-cols 1) twice, because that is inside loop.

For size 3, we call `(queen-cols 2)` once, check positions 1, 2 and 3, and return. Louis calls `(queens-cols 2)` 3 times, each of which calls `(queens-cols 1)` 2 times. 

So for us queens-cols is called `size` times, and for Louis `(factorial size)`. If our eight queens runs for time T, then his program will run 8!/8 T = 7! T = 5040T.

