---
title: "SICP 2.2.2 Hierarchical structures"
date: 2020-07-19T23:07:22+02:00
tags:
- SICP
---

AKA trees. Here I learned to debug Scheme a little bit, because I wrote code that not just worked from the first try.

Also here some trivial exercises are skipped, because one with drawing I done on paper and won't upload it here because it is useless, and another is "What would interpreter print", which I guessed, tested with interpreter and it was right. If you want to have solution - ask your interpreter.

<!--more-->

## Exercise 2.25

```scheme
(define l (list 1 3 (list 5 7) 9))
l
(car (cdr (car (cdr (cdr l)))))

(define l (list (list 7)))
l
(car (car l))

(define l (list 1 (list 2 (list 3 (list 4 (list 5 (list 6 7)))))))
l
(car (cdr (car (cdr (car (cdr (car (cdr (car (cdr (car (cdr l))))))))))))
```

## Exercise 2.27

```scheme
(define x (list (list 1 2) (list 3 4)))
(reverse x)

(define (deep-reverse l)
  (define (rev-el el)
    (if (pair? el)
      (deep-reverse el)
      el
    )
  )
  (define (iter src dst)
    (if (null? src)
      dst
      (iter (cdr src) (cons (rev-el (car src)) dst))
    )
  )
  (iter l nil)
)
```

## Exercise 2.28

```scheme
(define (fringe t)
  (define (iter src dst)
    (cond
      ((null? src) dst)
      ((pair? (car src)) (iter
         (cdr src)
         (append (iter (car src) nil) dst)
      ))
      (else (iter
          (cdr src)
          (cons (car src) dst)
      ))
    )
  )
  (reverse (iter t nil))
)
```

## Exercise 2.29

Constructors and selectors:
```scheme
(define (make-mobile left right)
  (list left right))

(define (left-branch mobile)
  (car mobile))

(define (right-branch mobile)
  (car (cdr mobile)))

(define (make-branch length structure)
  (list length structure))

(define (branch-length branch)
  (car branch))

(define (branch-structure branch)
  (car (cdr branch)))
```

Test data:
```scheme
(define m1 
  (make-mobile 
    (make-branch 1 10)
    (make-branch 1 
        (make-mobile 
            (make-branch 1 5)
            (make-branch 1 5)
        )
    )
  )
)
(define m2 
    (make-mobile
        (make-branch 2 10)
        (make-branch 1 m1)
    )
)

(define m3
    (make-mobile
        (make-branch 2 10)
        (make-branch 1 10)
    )
)
```

```scheme
(define (total-weight mobile) 
  (if (pair? mobile)
    (+
      (total-weight (branch-structure (left-branch mobile)))
      (total-weight (branch-structure (right-branch mobile)))
    )
    mobile ; if not pair - it should be just weight
  )
)

(define (balanced mobile)
  ; weight-b returns weight of mobile if it is balanced, otherwise - negative value
  (define (weight-b mobile)
    (if (pair? mobile)
      (let ((lb (weight-b (branch-structure (left-branch mobile))))) ; compute left balance
        (if (< lb 0)
          -1 ; left submobile is not balanced, so this mobile too
          (let ((rb (weight-b (branch-structure (right-branch mobile))))) ; compute right balance
            (if (< rb 0)
              -1 ; right submobile is not balanced, so this mobile too
              (if (=
                (* lb (branch-length (left-branch mobile)))
                (* rb (branch-length (right-branch mobile)))
              )
                (+ lb rb) ; finally, balanced case
                -1 ; submobiles are balanced, but apply different torques in this
              )
            )
          )
        )
      )
      mobile ; single weight is already balanced by itself
    )
  )
  (> (weight-b mobile) 0)
)
(balanced m1)
(balanced m2)
(balanced m3)
```

With `balanced` I was stuck, too many levels of nesting. As usual, I [asked on StackOverflow](https://stackoverflow.com/questions/62962576/how-to-find-where-scheme-calls-integer-less), went to sleep and in the morning found bug, then someone answered my very obvious question.

Part d. If we have such constructors:
```scheme
(define (make-mobile left right)
  (cons left right))
(define (make-branch length structure)
  (cons length structure))
```

We only have to change such selectors:
```scheme
(define (right-branch mobile)
  (cdr mobile))
(define (branch-structure branch)
  (cdr branch))
```

Layers of abstraction are useful (sometimes).


## Exercise 2.30

```scheme
(define (square-tree t) 
  (cond 
    ((null? t) nil)
    ((pair? t) (cons (square-tree (car t)) (square-tree (cdr t))))
    (else (sqr t))
  )
)

(square-tree
 (list 1
       (list 2 (list 3 4) 5)
       (list 6 7)))
```

Version with map:
```scheme
(define (square-tree t) 
  (if (pair? t)
    (map square-tree t)
    (sqr t)
  )
)
```

## Exercise 2.31
```scheme
(define (tree-map f t) 
  (if (pair? t)
    (map (lambda (t) (tree-map f t)) t)
    (f t)
  )
)

(tree-map (lambda (x) (+ x 1))
 (list 1
       (list 2 (list 3 4) 5)
       (list 6 7)))
```


## Exercise 2.32

```scheme
(define (subsets s)
  (if (null? s)
      (list nil)
      (let ((rest (subsets (cdr s))))
        (append
          rest
          (map (lambda (ss) (cons (car s) ss)) rest)
        ))))
```

Emtpy set has only one subset - empty. Otherwise each element in the set doubles number of elements in the set of subsets - it creates subsets that are just like subsets without that element, except that they include it.

