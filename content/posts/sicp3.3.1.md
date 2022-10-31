---
title: "SICP3.3.1 Mutable list structure"
date: 2022-10-31T18:19:37+01:00
tags:
- SICP
---

This chapter seems to be not about state itself, but about the weird recursive data structures that you could have when you have assignment. Like lists that contain themselves. Could you build such list without mutation? Well, I don't think so, because to add a list to a list, you should already have a list you add. And you could not do that with just one `cons`.

You could think that I skipped section 3.2. I did not, but exercises there do not ask to write code, just draw some diagrams or guess output. You don't want to look at that scribbles, because they look like this:

<!--more-->

## Exercise 3.15

![My scribbles](/content/sicp-scribble-337.png "My Scheme environment scribbles")


### Exercise 3.16
Having this procedure to count pairs in list:

```scheme
(define (count-pairs x)
  (if (not (pair? x))
	0
	(+ (count-pairs (car x))
	   (count-pairs (cdr x))
	   1)))
```

p3, p4, p7 and p3 again are structures made exactly from 3 pairs for which this function returns
3, 4, 7 pairs and maximum recursion depth errors respectively.

```scheme
(define p3 (list 1 2 3))
p3 ; (1 2 3)
(count-pairs p3)

(define c (list 3))
(define p4 (cons c (cons 2 c)))
p4 ; ((3) 2 3)
(count-pairs p4)

(define a (list 1))
(define b (cons a a))
(define p7 (cons b b))
p7; (((1) 1) (1) 1)
(count-pairs p7)

(set-cdr! (cdr (cdr p3)) p3)
p3
(count-pairs p3) ; Aborting!: maximum recursion depth exceeded
```


### Exercise 3.17
Correct `count-pairs`. Returns 3 for all the tests in previous exercise.

```scheme
(define (new-set)
  (define items '())

  (define (in el items) 
	(if (null? items)
	  false
	  (if (eq? (car items) el)
		true
		(in el (cdr items)))))

  (define (add el)
	(set! items (cons el items)))

  (define (dispatch m)
	(cond 
	  ((eq? m 'add) add)
	  ((eq? m 'in) (lambda (el) (in el items)))
	  ((eq? m 'as-list) items)))

  dispatch)

(define (in-set? set el)
  ((set 'in) el))

(define (add-to-set set el)
  ((set 'add) el))

(define (as-list set)
  (set 'as-list))

(define ts (new-set)); test set
(as-list ts)
(add-to-set ts 1)
(as-list ts)
(add-to-set ts 2)
(as-list ts)
(in-set? ts 1)
(in-set? ts 3)
(add-to-set ts 3)
(as-list ts)
(in-set? ts 3)


(define (count-pairs x)
  (define counted (new-set))

  (define (count-uncounted x)
	(if (or (not (pair? x)) (in-set? counted x))
	  0
	  (begin
		(add-to-set counted x)
		(+ 1
		   (count-uncounted (car x))
		   (count-uncounted (cdr x))
		)
	  )
	)
  )

  (count-uncounted x)
)
```

### Exercise 3.18
Detect a cycle in list. It says the only one that makes interation with `cdr` to go into infinite loop, but it's not very hard to make one that finds loops in whole graph of pairs.

Wikipedia on cycles:

> The existence of a cycle in directed and undirected graphs can be determined by whether depth-first search (DFS) finds an edge that points to an ancestor of the current vertex (it contains a back edge).

```scheme
(define (in-list? l el) 
  (cond 
	((null? l) false)
	((eq? el (car l)) true)
	(else (in-list? (cdr l) el))
  )
)

(define (has-cycle? l) 
  (define (visit node path)
	(cond 
	  ((not (pair? node)) false); Finished DFS in this subtree
	  ((in-list? path node) true) ; Found back edge
	  (else 
		(let ((new-path (cons node path))) ; visit from this node
		  (or
			(visit (car node) new-path) ; check for loops in car
			(visit (cdr node) new-path) ; check for loops in cdr
		  )
		)
	  )
	)
  )
  ; (trace visit)
  (visit l '())
)

; FROM PREVIOUS EXERCISE
(define p3 (list 1 2 3))
p3 ; (1 2 3)
(has-cycle? p3)

(define c (list 3))
(define p4 (cons c (cons 2 c)))
p4 ; ((3) 2 3)
(has-cycle? p4)

(set-cdr! (cdr (cdr p3)) p3)
p3
(has-cycle? p3)

(define p1 (list 1 2 3))
(set-car! p1 p1)
p1
(has-cycle? p1)
```

### Exescise 3.19
Redo Exescise 3.18 using an algorighm that takes only a constant amount of space. (This requires a very clever idea.).

I know which idea, but for for this idea to work, we need to stick to definition of loop from 3.18, view the list only as a list that could loop on the end, not a graph of pairs.

I know this idea because of [video "If Programming Was An Anime"](https://www.youtube.com/watch?v=pKO9UjSeLew). 

> This question is ...
>
> trivial
>
> Solving this in linear time and constant space requires Floyd's Tortoise and Hare

```scheme
(define (has-cycle? l) 
  (define (iter tortoise hare)
	(cond
	  ((null? hare) false) ; hare reached finish, there is no loop
	  ((eq? tortoise hare) true) ; loop race finished, there is a loop
	  ((null? (cdr hare)) false) ; hare reached finish
	  (else (iter (cdr tortoise) (cddr hare))) ; continue race
	)
  )
  (cond  ; first, handle some edge cases
	((null? l) false) ; empty lists have no cycles
	((null? (cdr l)) false) ; one-element lists have no cycles
  	(else (iter (cdr l) (cddr l))) ; start the race
  )
)

(define p1 (list 1))
(has-cycle? p1)
(set-cdr! p1 p1)
p1
(has-cycle? p1)

(define p3 (list 1 2 3))
p3
(has-cycle? p3)

(set-cdr! (cdr (cdr p3)) p3)
p3
(has-cycle? p3)
```
