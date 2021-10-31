---
title: "Bare metal \"Fizz Buzz\""
date: 2021-10-31T19:45:07+01:00
tags:
- notes
- asm
---

Being able to write [hello world](http://bunyk.github.io/posts/bare_metal_hello_world) would not get you a job. To be able to get a job, you need to at least be able to write program called "[fizz buzz](https://en.wikipedia.org/wiki/Fizz_buzz#Programming)". Yes, really, on one interview I was asked to write such program. 

It's hard to design such a program without subroutines to print different strings and numbers, so we would need to learn how to add subroutines to assembler.

<!--more-->

## New way to jump around
To have subroutines we need just two instructions, `call`, and `ret`.

Call is almost the same as `jmp`, but in addition it writes the address of next instruction to the stack, so `ret` knows where to return. We could return also by using `jmp`, but if we call our subroutine from two different places, `jmp` would not know where to jump.

There is special register called `ip`, that has address of instruction currently executed, but we could not read or manipulate it directly (on `x86` processors).

Additionally, it is nice behaviour for the subroutines to `push` values of the registers they will mess with to the stack, and then `pop` them before return, so code that calls subroutines, could use that registers for other computations.

So, knowing all this, routine to print a string could look like this:

```x86asm
; println routine prints null-terminated string to which bx points
println:
	push ax ; save ax, and bx, since their values will be changed
	push bx

	mov ah, 0x0e; teletype mode

	print_loop: 
		mov al, [bx] ; prepare to print character to which bx points now

		cmp al, 0    ; is it 0?
		je finish_print    ; if yes - jump to finish_print

		int 0x10 	 ; print current character

		inc bx 		 ; go to next byte
	jmp print_loop

	finish_print:
	mov al, 13 ; print \r, moves to beginning of line
	int 0x10
	mov al, 10 ; print \n, moves to new line
	int 0x10

	pop bx ; restore values of registers
	pop ax
ret ; return to caller
```

Having this subroutine, to print two different lines, we just write this code:

```x86asm
mov bx, msg ; put address of message to bx
call println ; print what bx points to

mov bx, msg2  ; print msg2
call println

jmp $ ; loop forever

msg: 
db "Fizz",0

msg2: 
db "Buzz!",0
```

## Arithmetic's
To print number, we need to know it's digits, and to know it's digits, we need to be able to divide and find a remainder of division.

That is tricky to do in assembly, since `div` instruction has no parameters like `div z, x, y ; same as z = x/y` that I imagined. 

Turns out it has single argument, and that argument could not be a constant, it should be register, or address of memory. And size of that argument defines how `div` would behave. For 16 bit register, div will divide `dx:ax` by that register, and after this `ax` will store the result of division, `dx` will store the remainder.

So, if we want to check if some 16 bit integer is divisible by 3, we need to do this:
1. Put it into `ax`
2. Put 0 into `dx`, to make sure value from there does not influence result.
3. Put 3 into `bx` (or `cx`)
4. Finally, call `div bx` (or `div cx`)
5. Now check if value in `dx` is 0, and jump depending on that. 

Using this, section of code that prints string addressed by label `fizzbuzz`, if `ax` is divisible by 15 looks like this:

```x86asm
	push ax ; store ax, because it will be modified

	mov dx, 0  ; div, divides dx:ax number by it's argument, but we want only ax
	mov bx, 15 ; div is not able to work with constants, so use bx to store 15
	div bx     ; divide dx:ax by bx. After this ax = ax / bx; dx = ax % bx;

	pop ax; restore ax

	cmp dx, 0  ; was it divisible by 15 ? 
	jne check_fizz ; if not - try with 5

	mov bx, fizzbuzz ; if yes - print fizzbuzz
	call println
```

While programming in assembly, I feel like I need more registers, and a way to give them better names than just two letters. I miss variables.

Maybe people who actually know assembly know how to use memory addresses as variables, I'm instead trying to stick to this 4 general purpose registers. 

## Printing decimals
Ok, now we are able to print any string by it's address, and we are able to do division. The only thing left is to print decimal numbers.

For that - we just loop over all the digits, and print each. The only hard thing is that it is hard to know with which digit the number starts. It is easier to know with which digit it ends, because it's the remainder of division by 10. The digit that ends our number divided by 10 - is the second digit, etc... We could divide by 10 in each iteration, and get digits in reverse.

But we could push all of them to the stack, and then just pop and print, that would print them in normal order. 

My decimal number printing code looks like this:

```x86asm
; print_decimal routine prints number stored in ax
print_decimal:
	push ax ; store values of registers that will change
	push bx
	push cx
	push dx

	mov cx, 0 ; cx will hold number of digits, initially 0

	cmp ax, 0 ; is number we want to print 0? 
	jne push_last_digit ; if not - proceed to pushing last digit of it
	push 0 ; digit is 0
	mov cx, 1 ; number of digits in stack is 1
	jmp print_from_stack ; and print this

	push_last_digit:
		mov dx, 0  ; div, divides dx:ax number by it's argument, but we want only ax
		mov bx, 10 ; div is not able to work with constants, so use bx to store 10
		div bx     ; divide dx:ax by bx. After this ax = ax / bx; dx = ax % bx;

		push dx   ; dx is last digit, put it in stack
		inc cx    ; we have one more digit to print

	cmp ax, 0 ; do we still have numbers?
	jne push_last_digit ; if yes - push that again

	print_from_stack:
		cmp cx, 0 ; are there numbers to print?
		je exit_print_decimal; if no - finish subroutine

		pop bx  ; put number to print into bx
		add bx, '0' ; add to bx ASCII code of 0
		mov al, bl  ; put that code to AL

		mov ah, 0x0e; teletype mode
		int 0x10 	 ; print current digit

		dec cx ; and now we have one less digit to print
	jmp print_from_stack

	exit_print_decimal:

	mov al, 13 ; print \r, moves to beginning of line
	int 0x10
	mov al, 10 ; print \n, moves to new line
	int 0x10

	pop dx ; restore registers
	pop cx 
	pop bx 
	pop ax
ret
```

## Slowing down
And our FizzBuzz runs so fast that it's impossible to read anything, I found out how to ask BIOS to wait for some time:

```x86asm
; sleep about cx/15 seconds
; CX:DX = interval in microseconds, if we don't set dx - one cx is ~65536A microseconds, or 1/15 of second
sleep:
	push ax

	mov al, 0
	mov ah, 0x86
	int 0x15

	pop ax
ret
```


## Main FizzBuzz loop
Having all that subroutines in place, FizzBuzz looks like this:

```x86asm
mov ax, 0 ; loop counter
mov cx, 5 ; how long to sleep in 1/15th of second

loop:
	inc ax
	call sleep

	push ax ; store ax, because it will be modified

	mov dx, 0  ; div, divides dx:ax number by it's argument, but we want only ax
	mov bx, 15 ; div is not able to work with constants, so use bx to store 15
	div bx     ; divide dx:ax by bx. After this ax = ax / bx; dx = ax % bx;

	pop ax; restore ax

	cmp dx, 0  ; was it divisible by 15 ? 
	jne check_fizz ; if not - try with 5

	mov bx, fizzbuzz ; if yes - print fizzbuzz
	call println
	jmp loop ; continue with next iteration

	check_fizz:
	push ax

	mov dx, 0
	mov bx, 5
	div bx

	pop ax

	cmp dx, 0  ; was it divisible by 5 ? 
	jne check_buzz ; if not - try with 3

	mov bx, fizz ; if yes - print fizz
	call println

	jmp loop ; and move to next number

	check_buzz:
	push ax

	mov dx, 0
	mov bx, 3
	div bx

	pop ax

	cmp dx, 0  ; was it divisible by 3 ? 
	jne integer ; not - proceed to printing

	mov bx, buzz ; if yes - print fizz
	call println

	jmp loop

	integer:
	call print_decimal
jmp loop
```

Overall code with all the subroutines, constants, and comments takes me 172 lines. A lot for a FizzBuzz, but in Python you would not write two "print" functions for two data types from scratch. 

If I remove padding with zeroes, it no longer runs, but binary has just a little over 200 bytes. So, even with my poor assembly skills FizzBuzz could fit into 512 bytes bootsector twice.
