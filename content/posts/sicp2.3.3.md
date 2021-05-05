---
title: "SICP 2.3.3 Representing sets"
date: 2020-07-28T23:59:22+02:00
tags:
- SICP
---

This was more boring in comparison to previous section, probably because it required writing less code, and just writing more explanations. Writing is thinking, so I tried to do that. Or maybe it was boring because sets are not as exciting as symbolic differentiation. At least when you have high level language.

<!--more-->

## Exercise 2.59

```scheme
(define (element-of-set? x set)
  (cond ((null? set) false)
        ((equal? x (car set)) true)
        (else (element-of-set? x (cdr set)))))

(define (adjoin-set x set)
  (if (element-of-set? x set)
      set
      (cons x set)))

(define (union-set set1 set2)
  (fold-left
    (lambda (union next) (adjoin-set next union))
    set1
    set2
  )
)
```

## Exercise 2.60

```scheme
(define (element-of-set? x set)
  (cond ((null? set) false)
        ((equal? x (car set)) true)
        (else (element-of-set? x (cdr set)))))
```

O(n), as unique one, but here list could be way longer, so less performant.


```scheme
(define (adjoin-set x set)
  (cons x set)
)
```

O(1), lot better than unique one ( O(n)), because we not checking uniqueness.

```scheme
(define (union-set set1 set2)
  (append set1 set2)
)
```

Append has complexity O(n) = O(len(set1)) if I'm not mistaken. O(n), better than O(n<sup>2</sup>).

```scheme
(define (intersection-set set1 set2)
  (cond ((or (null? set1) (null? set2)) '())
        ((element-of-set? (car set1) set2)        
         (cons (car set1)
               (intersection-set (cdr set1) set2)))
        (else (intersection-set (cdr set1) set2))))
```

Intersection has same implementation and as a result same asymptotic complexity O(n<sup>2</sup>), but we expect n to be a lot larger.

So, this approach would suit applications where we will do a lot of adjoins and unions, and not much checking for element or intersections. 

## Exercise 2.61

```scheme
(define (adjoin-set x set)
  (cond ((or (null? set) (< x (car set))) (cons x set))
        ((= x (car set)) set)
        (else (cons (car set) (adjoin-set x (cdr set))))))

(adjoin-set 0 (list 1 3))
(adjoin-set 1 (list 1 3))
(adjoin-set 2 (list 1 3))
(adjoin-set 4 (list 1 3))
```

## Exercise 2.62

```scheme
(define (union-set set1 set2)
    (cond
        ((null? set1) set2)
        ((null? set2) set1)
        ((< (car set1) (car set2)) (cons (car set1) (union-set (cdr set1) set2)))
        (else (cons (car set2) (union-set set1 (cdr set2))))
    )
)
(union-set (list 1 2) (list 3 4))
(union-set (list 2 3) (list 1 4))
```


## Exercise 2.63
a. Yes, they give same results by traversing tree from left to right.

b. One without `append` is better. For the second one `copy-to-list` is called for right subtree first, and then process conses current tree entry to result, then `copy-to-list` is called recursively to cons left subtree to the resulting list.

In case with append, we compute `tree->list1` for both subtrees simultaniously, then iterate over result for left subtree inside `append`.  Append takes O(n) time, where n is length of left argument. It is processing half of nodes in each level in the tree, which is approximately O(n log(n)).


## Exercise 2.64
```scheme
(define (list->tree elements)
  (car (partial-tree elements (length elements))))

(define (partial-tree elts n)
  (if (= n 0)
      (cons '() elts)
      (let ((left-size (quotient (- n 1) 2)))
        (let ((left-result (partial-tree elts left-size)))
          (let ((left-tree (car left-result))
                (non-left-elts (cdr left-result))
                (right-size (- n (+ left-size 1))))
            (let ((this-entry (car non-left-elts))
                  (right-result (partial-tree (cdr non-left-elts)
                                              right-size)))
              (let ((right-tree (car right-result))
                    (remaining-elts (cdr right-result)))
                (cons (make-tree this-entry left-tree right-tree)
                      remaining-elts))))))))
```

`partial-tree` takes as arguments `elts` - list of elements, and integer `n` and returns pair whose `car` is balanced tree containing the first `n` elements of the list and `cdr` is the list of elements not included in the tree.

If we need to construct tree with 0 elements, we just return empty tree and list provided to us. Otherwise, we will have tree with one element in root, and subtrees. Size of subtrees will be (n-1) / 2 (remaining amount of elements appriximately equally split for each subtree). First we build left subtree and obtain remaining elements. First of the remaining elements goes into root of our tree, the rest - to building right subtree. After we have both subtrees attached to tree with root element, we return it, and what was left in list of elements from building right subtree.

So, when we have list `(1 3 5 7 9 11)`, we will have following tree:

```
(5
    (1
        ()
        (3 () ())
    )
    (9
        (7 () ())
        (11 () ())
    )
)
```

b. What is the order of growth in the number of steps required by list->tree to convert a list of n elements? 

partial-tree is called once for n = 0. For n > 0, it is called X(n), where X(n) = 2 + X( (n-1) / 2) + X(n - 1 - (n-1)/2 = (n-1)/2) => X(n) = 2 + X((n-1)/2). If X is identity function - equation is true, so X(n) = n. Order of growth is linear.

## Exercise 2.65
Finally coding and not writing essays. I'm bad at essays (probably need another textbook on this topic, but how to test myself?) 

I imagine we convert both trees to ordered lists, then use operations on ordered lists described in previous section, then convert back to trees. All of this operations take O(n).

```scheme
(define (union-set s1 s2)
  (list->tree (list-union-set (tree->list2 s1) (tree->list2)))
)
```

Same for intersection, just call different function. I'm even not going to test this code, as it will be more effort than writing it.

## Exercise 2.66

```scheme
(define (lookup given-key set-of-records)
  (cond ((null? set-of-records) false)
        ((= given-key (key (entry set-of-records)))
         (entry set-of-records))
        ((< given-key (key (entry set-of-records)))
         (lookup (left-branch set-of-records)))
        (else
         (lookup (right-branch set-of-records)))))
```

