---
title: "SICP 2.3.4 Huffman encoding"
date: 2020-08-02T18:20:22+02:00
tags:
- SICP
---

Exercises to use sets and trees in practice. This topic reminds me of project in Scala course by Martin Odersky.

<!--more-->


## Exercise 2.67

```scheme
(define (make-leaf symbol weight)
  (list 'leaf symbol weight))
(define (leaf? object)
  (eq? (car object) 'leaf))
(define (symbol-leaf x) (cadr x))
(define (weight-leaf x) (caddr x))

(define (make-code-tree left right)
  (list left
        right
        (append (symbols left) (symbols right))
        (+ (weight left) (weight right))))
(define (left-branch tree) (car tree))

(define (right-branch tree) (cadr tree))
(define (symbols tree)
  (if (leaf? tree)
      (list (symbol-leaf tree))
      (caddr tree)))
(define (weight tree)
  (if (leaf? tree)
      (weight-leaf tree)
      (cadddr tree)))

(define (decode bits tree)
  (define (decode-1 bits current-branch)
    (if (null? bits)
        '()
        (let ((next-branch
               (choose-branch (car bits) current-branch)))
          (if (leaf? next-branch)
              (cons (symbol-leaf next-branch)
                    (decode-1 (cdr bits) tree))
              (decode-1 (cdr bits) next-branch)))))
  (decode-1 bits tree))

(define (choose-branch bit branch)
  (cond ((= bit 0) (left-branch branch))
        ((= bit 1) (right-branch branch))
        (else (error "bad bit -- CHOOSE-BRANCH" bit))))

(define (adjoin-set x set)
  (cond ((null? set) (list x))
        ((< (weight x) (weight (car set))) (cons x set))
        (else (cons (car set)
                    (adjoin-set x (cdr set))))))

(define sample-tree
  (make-code-tree (make-leaf 'A 4)
                  (make-code-tree
                   (make-leaf 'B 2)
                   (make-code-tree (make-leaf 'D 1)
                                   (make-leaf 'C 1)))))

(define sample-message '(0 1 1 0 0 1 0 1 0 1 1 1 0))

(decode sample-message sample-tree)
;Value 14: (a d a b b c a)
```

## Exercise 2.68

```scheme
(define (encode message tree)
  (if (null? message)
      '()
      (append (encode-symbol (car message) tree)
              (encode (cdr message) tree))))

(define (encode-symbol sym tree)
    (cond 
        ((leaf? tree) '())
        ((element-of-set? sym (symbols (left-branch tree)))
         (cons 0 (encode-symbol sym (left-branch tree))))
        ((element-of-set? sym (symbols (right-branch tree)))
         (cons 1 (encode-symbol sym (right-branch tree))))
        (else (error "encode-symbol fails for symbol" sym " with tree " tree))
    )
)

(define (element-of-set? x set)
    (cond
        ((null? set) #f)
        ((equal? x (car set)) #t)
        (else (element-of-set? x (cdr set)))
    )
)


(encode '(a d a b b c a) sample-tree)
```


## Exercise 2.69

```scheme
(define (make-leaf-set pairs)
  (if (null? pairs)
      '()
      (let ((pair (car pairs)))
        (adjoin-set (make-leaf (car pair)    ; symbol
                               (cadr pair))  ; frequency
                    (make-leaf-set (cdr pairs))))))

(define (adjoin-set x set)
  (cond ((null? set) (list x))
        ((< (weight x) (weight (car set))) (cons x set))
        (else (cons (car set)
                    (adjoin-set x (cdr set))))))

(define (generate-huffman-tree pairs)
  (successive-merge (make-leaf-set pairs)))

(define (successive-merge forest)
    (if (null? (cdr forest)) ; single element
        (car forest) ; means we merged all trees and could return the only element
        (let ( ; othwerise let's take two smallest
            (smallest1 (car forest))
            (smallest2 (cadr forest))
            (tail (cddr forest))
        )
            (successive-merge (adjoin-set
                (make-code-tree smallest1 smallest2) ; merge them
                tail ; and add to the remaining set of trees
            ))
        )
    )
)

(generate-huffman-tree '((a 1) (b 1) (c 5)))
```

## Exercise 2.70

```scheme
(define rock-code (generate-huffman-tree '(
    (A 	    2)
    (BOOM 	1)
    (GET 	2)
    (JOB 	2)
    (NA 	16)
    (SHA 	4)
    (YIP 	9)
    (WAH 	1) 
)))

(define rock-song '(Get a job

Sha na na na na na na na na

Get a job

Sha na na na na na na na na

Wah yip yip yip yip yip yip yip yip yip

Sha boom
))
```

How many bits are required for encoding?
```scheme
(length (encode rock-song rock-code))
;Value: 84
```

What is the smallest number of bits that would be needed to encode this song if we used a fixed-length code for the eight-symbol alphabet? 

```scheme
(* 3 (length rock-song))
;Value: 108
```

## Exercise 2.71

Most frequent symbol is encoded in one bit, least frequent - in n bits.

## Exercise 2.72

If search in set is linear, then for the most frequent symbol endoing is done in O(n), for the least frequent - in O(n<sup>2</sup>). If search is done in log(n) - then encoding could be done from log(n) to n*log(n)
