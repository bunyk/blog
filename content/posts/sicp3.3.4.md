---
title: "SICP3.3.4 A simulator for digital cirtuits"
date: 2022-11-08T19:19:15+01:00
tags:
- SICP
---

I tried chapter 3.3.2 Representing queues, but it was easy and boring. 

Solution to Exercise 3.21 looks like this:

```scheme
(define (print-queue queue)
  (display (car queue))
)
```

3.3.3 is even more boring, and I even not bothered to try if it's hard or easy. So I skipped them both. Still, here we have more than enough code.

But turned out that simulator of digital circuits uses queue data structure from there. And I made a bug in it's implementation, by forgetting to update the pointer at the end of the queue, which led me to a lot of debugging of circuits code, until I realized that bug is in queue code.

This chapter is very interesting not only because of digital circuits emulation, but also because you build your own event system. In particular something similar to `setTimeout` in JavasScript. It's also inspiring. Now I have an itch to build graphical circuits simulator, the one similar to [Digital-Logic-Sim](https://github.com/SebLague/Digital-Logic-Sim) of Sebastian Lague. Or maybe play a game "[Turing Complete](https://store.steampowered.com/app/1444480/Turing_Complete/)"

And I feel difference from other chapters: functions here were mostly called for side-effects, not to return values. So when you call something like full-adder, it does nothing, it just connects inputs with outputs. Then you set values for inputs, run the "event loop", and read values from outputs. Full-adder by itself returns nothing. 

Also, in this chapter you could not test your solutions until you get to it's end, because implementation of some utilities like agenda is given only after they are used. So I'll give most exercises in one listing, so it could be run in scheme interpeter.

<!-- more -->

## Code

```scheme
;;;;;;;;;;;;;;;;;;;;;;;;; Wire
(define (make-wire)
  (let (
    (signal-value false)
    (action-procedures '())
  )
	(define (set-my-signal! new-value)
	  (if (not (eq? signal-value new-value))
		(begin (set! signal-value new-value)
			   (call-each action-procedures)
		)
	  )
	  'done
	)

	(define (accept-action-procedure! proc)
	  (set! action-procedures (cons proc action-procedures))
	  (proc) ; Exercise 3.31 asks why this is here
	)
	(define (dispatch m)
	  (cond 
		((eq? m 'get-signal) signal-value)
		((eq? m 'set-signal!) set-my-signal!)
		((eq? m 'add-action!) accept-action-procedure!)
		(else (error "Unknown operation on wire" m))
	  )
	)
	dispatch
  )
)

(define (call-each procedures)
  (if (null? procedures)
	'done
	(begin
	  ((car procedures))
	  (call-each (cdr procedures))
	)
  )
)

(define (get-signal wire)
  (wire 'get-signal)
)
(define (set-signal! wire new-value)
  ((wire 'set-signal!) new-value)
)
(define (add-action! wire procedure)
  ((wire 'add-action!) procedure)
)

;;;;;;;;;;;;;;;;;;;;;;;;; Agenda

(define (after-delay delay action)
  (add-to-agenda!
	(+ delay (current-time the-agenda))
	action
	the-agenda
  )
)

(define (propagate)
  (if (empty-agenda? the-agenda)
	'done
	(let (
		(first-item (first-agenda-item the-agenda))
	)
	  ; (newline)
	  ; (display "\ntime:") (display (current-time the-agenda))
	  ; (display " processing ")
	  ; (display first-item)
	  (first-item)
	  (remove-first-agenda-item! the-agenda)
	  ; (display-agenda the-agenda)
	  (propagate)
	)
  )
)

(define (probe name wire)
  (add-action! wire (lambda ()
	(newline)
	(display (current-time the-agenda))
	(display " ")
	(display name)
	(display " = ")
	(display (get-signal wire))
  ))
)

(define make-time-segment cons)
(define segment-time car)
(define segment-queue cdr)

(define (display-segment segment)
  (newline)
  (display (segment-time segment))
  (display " ")
  (print-queue (segment-queue segment))
)

(define (make-agenda)
  (list 0)
)
(define current-time car) ; head of agenda list is current time
(define set-current-time! set-car!)
(define segments cdr) ; the rest of agenda is segments
(define set-segments! set-cdr!)
(define (first-segment agenda)
  (car (segments agenda))
)
(define (rest-segments agenda)
  (cdr (segments agenda))
)
(define (empty-agenda? agenda)
  (null? (segments agenda))
)

(define (display-agenda agenda) 
  (newline)
  (display "Time: ")
  (display (current-time agenda))
  (display "\nSegments:")
  (define (display-segments segments)
	(if (null? segments)
	  (display "\nend.\n")
	  (begin 
		(display-segment (car segments))
		(display-segments (cdr segments))
	  )
	)
  )
  (display-segments (segments agenda))
)

(load "queue.scm")

(define (add-to-agenda! time action agenda)
  (define (belongs-before? segments)
	(or
	  (null? segments)
	  (< time (segment-time (car segments)))
	)
  )
  (define (make-new-time-segment time action)
	(let ((q (make-queue)))
	  (insert-queue! q action)
	  (make-time-segment time q)
	)
  )
  (define (add-to-segments! segments)
	(if (= (segment-time (car segments)) time)
	  (insert-queue! (segment-queue (car segments)) action)
	  (let ((rest (cdr segments)))
		(if (belongs-before? rest)
		  (set-cdr! segments
			(cons (make-new-time-segment time action) rest)
		  )
		  (add-to-segments! rest)
		)
	  )
	)
  )
  (let ((segments (segments agenda)))
	(if (belongs-before? segments)
	  (set-segments!
		agenda
		(cons (make-new-time-segment time action) segments)
	  )
	  (add-to-segments! segments)
	)
  )
  ; (display-agenda agenda)
)

(define (remove-first-agenda-item! agenda)
  (let ((q (segment-queue (first-segment agenda))))
	(delete-queue! q)
	(if (empty-queue? q)
	  (set-segments! agenda (rest-segments agenda))
	)
  )
  ; (display-agenda agenda)
)

(define (first-agenda-item agenda)
  (if (empty-agenda? agenda)
	(error "No first-agenda-item in empty agenda")
	(let ((first-seg (first-segment agenda)))
	  (set-current-time! agenda (segment-time first-seg))
	  (front-queue (segment-queue first-seg))
	)
  )
)

(define the-agenda (make-agenda))

;;;;;;;;;;;;;;;;;;;;;;;;; Gates

(define inverter-delay 2)
(define and-gate-delay 3)
(define or-gate-delay 5)

(define (inverter input output)
  (define (invert-input) 
	(let ((new-value (not (get-signal input))))
	  (after-delay inverter-delay
			(lambda () (set-signal! output new-value)))
	)
  )
  (add-action! input invert-input)
  'ok
)

(define (and-gate a1 a2 output)
  (define (action-procedure) 
	(let (
		(new-value (and (get-signal a1) (get-signal a2)))
	)
	  	(after-delay and-gate-delay
			(lambda () (set-signal! output new-value)))
	)
  )
  (add-action! a1 action-procedure)
  (add-action! a2 action-procedure)
  'ok
)

; Exercise 3.28
; (define (or-gate a1 a2 output)
;   (define (action-procedure) 
; 	(let (
; 		(new-value (or (get-signal a1) (get-signal a2)))
; 	)
; 	  	(after-delay or-gate-delay
; 			(lambda () (set-signal! output new-value)))
; 	)
;   )
;   (add-action! a1 action-procedure)
;   (add-action! a2 action-procedure)
;   'ok
; )

; Exercise 3.29
(define (or-gate a1 a2 output) 
  (let (
	(na1 (make-wire))
	(na2 (make-wire))
	(no (make-wire))
  )
	(inverter a1 na1)
	(inverter a2 na2)
	(and-gate na1 na2 no)
	(inverter no output)
  )
  'ok
)
; delay should be 2 * inverter-delay + and-gate-delay

;;;;;;;;;;;;;;;;;;;;; Testing or-gate:
(define input1 (make-wire))
(define input2 (make-wire))

(define (check-inputs i1 i2)
  (set-signal! input1 i1)
  (set-signal! input2 i2)
  (propagate)
)
; 
; (define or-output (make-wire))
; (or-gate input1 input2 or-output)
; (probe 'or or-output)
; 
; (check-inputs false false)
; (check-inputs true false)
; (check-inputs false true)
; (check-inputs true true)


(define (half-adder a b s c)
  (let (
		(d (make-wire))
		(e (make-wire)))
	(or-gate a b d)
	(and-gate a b c)
	(inverter c e)
	(and-gate d e s)
  )
  'ok
) ; Delay should be max(or-gate-delay, and-gate-delay + inverter-delay) + and-gate-delay

(define (full-adder a b c-in sum c-out)
  (let (
	(s (make-wire))
	(c1 (make-wire))
	(c2 (make-wire))
  )
	(half-adder b c-in s c1)
	(half-adder a s sum c2)
	(or-gate c1 c2 c-out)
  )
  'ok
)
) ; Delay should be max(or-gate-delay, and-gate-delay + inverter-delay) + and-gate-delay + or-gate-delay

; Exercise 3.30

(define (ripple-carry-adder A B S c)
  (if (null? A) 
	(set-signal! c false) ; Carry adder of 0 bits returns 0 carry
	(let (
	  (nc (make-wire))
	)
	  (ripple-carry-adder (cdr A) (cdr B) (cdr S) nc)
	  (full-adder (car a) (car b) nc (car S) c)
	)
  )
)
) ; Delay should be (max(or-gate-delay, and-gate-delay + inverter-delay) + and-gate-delay + or-gate-delay) * number of bits

;;;;;;;;;;;;;;;;;;;;;;;;; Testing ripple-carry-adder

(define (make-bus bits) 
  (if (= bits 0)
	'()
	(cons (make-wire) (make-bus (- bits 1)))
  )
)
(define (get-signals bus)
  (map get-signal bus)
)
(define (set-signals! bus signals)
  (map set-signal! bus signals)
)

(define A (make-bus 4))
(define B (make-bus 4))
(define S (make-bus 4))
(define c (make-wire))
(ripple-carry-adder A B S c)

(set-signals! A (list false false true true)) ; A = 3
(set-signals! B (list false true false true)) ; B = 5
(propagate)
(get-signals S) ; S = 8 t f f f
(get-signal c)

(set-signals! A (list true true true false)) ; A = 14
(set-signals! B (list false false true false)) ; B = 2
(propagate)
(get-signals S) ; S = 0
(get-signal c) ; c = 1
```

## Exercise 3.31
So, if we remove `proc` call from `accept-action-procedure!` and test half-adder, it returns wrong results for `false true`, and `true false` arguments. 

```scheme
(define sum (make-wire))
(define carry (make-wire))
(half-adder input1 input2 sum carry)
(probe 'sum sum)
(probe 'carry carry)

(check-inputs false false)
(check-inputs true false)
(check-inputs false true)
(check-inputs true true)
(check-inputs false true)
```

It is because inverter inside it does not return inverted signal, while it should. It waits for input to first change, and then recalculates the signal.
That happens only after true true is given. For the inverter to work correctly with default wire signals, we need to set output signal when inverter is connected
This also applies to other gates. Since we could already have inverter or something else connected to a wire, that wire could have any value, so it's better to reevaluate output values.

## Exercise 3.32
So, in and-gate, for each input wire we have added action that computes a new value that is logical and of both values, and after delay changes state of output wire.

Initially singals on wires are 0, 1, output is 0. Now we change first signal to 1.

Action is called, and new value is 1, because both wires are 1. We add to agenda function to set signal to 1

Then second value changes to 0. new-value is computed as 0, and new agenda function in queue will set signal to 0.

WITH FIFO, first signal is 1, but then 0, which is correct.

With LIFO, first signal changed to 0 (because that is last added value) and then to 1, so final state is not correct.

## Code for queue.scm

```scheme
(define (make-queue)
  (cons '() '())
)


(define (empty-queue? queue)
  (null? (car queue))
)

(define (insert-queue! queue item)
  (let ((new-pair (cons item '())))
	(cond
	  ((empty-queue? queue)
	   	(set-car! queue new-pair)
	   	(set-cdr! queue new-pair)
	  )
	  (else
	    (set-cdr! (cdr queue) new-pair)
		(set-cdr! queue new-pair)
	  )
	)
	queue
  )
)

(define (delete-queue! queue)
  (cond
	((empty-queue? queue) (error "delete called with empty queue"))
	(else
	  (set-car! queue (cdr (car queue)))
	  queue
	)
  )
)

(define (front-queue queue)
  (if (empty-queue? queue)
	(error "No front-queue for empty queue")
	(car (car queue)) ; first element of front pointer
  )
)

(define (print-queue queue)
  (display (car queue))
)
```
