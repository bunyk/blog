---
title: "Bare metal \"Hello, world!\""
date: 2021-10-23T21:22:29+02:00
toc: true
tags:
- notes
- asm
---

From time to time I get an itch to write. I mean code. Everything: video games, search engines, operating systems. Many of my old friends [wrote their own OSes](https://danbst.wordpress.com/2009/12/26/helloworld_os_boot_sector/) (or at least bare-metal code), and I have FOMO.

Recently I bought eBook reader with bigger screen than my Kindle. So I went on treasure hunt over internet to fill it with all the awesome free books that I wanted to read, but was not reading, because they did not fit to that tiny Kindle screen. And I found some unfinished free book: ["Writing a Simple Operating System - from Scratch" by Nick Blundel (2010)](https://www.cs.bham.ac.uk/~exr/lectures/opsys/10_11/lectures/os-dev.pdf). It retriggered that itch to write OS, or at least code that runs without OS again.

Here I'll post notes of my journey, skipping boring parts like explaining benefits of hexadecimal notation.

<!--more-->

## Installing tools
First things that we need are assembler and VM to run code produced by that assembler, because I would not risk running code written by me on bare metal, and risk formatting my disk.

Book uses Netwide Assembler (NASM) and QEMU as VM. To install them with `apt`, run:

```bash
sudo apt-get install qemu-system-x86 nasm
```

Or select installation variant for your system:
- [QEMU](https://www.qemu.org/download/)
- [NASM](https://www.nasm.us/)

Book also has alternative to use Bochs emulator, but I prefer Qemu, because it does not require config file to run

To view a binary file, which is sometimes useful, you could use:

```bash
od -t x1 -A n boot_sect.bin
```

`od` stands for "octal dump" (but could dump other formats), `-t x1` stands for "type (`-t`) hexadecimal (`x`), 1 byte per number", and `-A n` stands for "addresses no" (don't print byte offsets).


## Not yet hello world
So, every tutorial starts from printing hello world to the screen, but this one will finish with it.

Instead, we start from code that just runs, and does nothing else, at all:

```x86asm
; infinite loop bootsector

loop:                 ; define a label (address in code)
	jmp loop          ; go execute code starting from instruction at label

times 510-($-$$) db 0 ; pad with zeroes, so whole sector is 512 bytes

dw 0xaa55 ; last two bytes are magic number to mark this as boot sector
```

Assembler is full of abbreviations:
- `jmp` stands for jump. It is instruction for CPU to do something.
- `db` probably stands for "define byte". This is pseudo-instruction of NASM, that says to just put something into particular address in memory.
- `dw` probably stands for "define word" (two bytes)

Interesting, how, unlike in high-level languages, assembler code translates 1 to 1 to bytes that will be loaded to computer memory. Where data, like magic numbers are mixed with instructions.

To compile:
```bash
nasm boot_sect.asm -f bin -o boot_sect.bin
```

To run:
```bash
qemu-system-x86_64 boot_sect.bin
```

## Registers

When we program CPU, instead of using variables, we use *registers* to store our data. Each x86 CPU has 4 general purpose registers: `ax` , `bx`, `cx`, `dx`, able to store *word*, or 16 bits of data. They are way faster to read or write than memory. Also, each byte of register could be referenced separately, as `ah` (high) and `al` (low).

Instruction `mov` moves data from and to register:
- `mov ax, 123` - set value of `ax` to decimal `123`
- `mov ax, 0xabcd` - set value of `ax` to hexadecimal `abcd`
- `mov ax, 'a'` - set value of `ax` to ASCII code of `'a'`
- `mov bx, ax`  - copy value of `ax`   to `bx` (equivalent of `bx = ax;` in higher-level languages)

## Interrupts
*Interrupts* are like a callbacks of CPU. They allow it to interrupt what it currently runs, and run some other code to handle interrupt, before continuing with current task. They are raised by software instruction (for example `int 0x10`) , or by some device requiring action (input some data, etc..)

Each interrupt has a number, that is used as index to table set-up by BIOS at the start of memory (address `0x0`), that contains pointers to *interrupt service routines (ISRs)* 

Since BIOS has a log of ISRs, they are they are entry points to a set of handlers, indexed with `ax` register. `int 0x10` calls a screen-related ISR defined by `ax`, and `int 0x13` - disk related IO. They both have inside something like `switch` statement, that branches depending by `ax` value.

## Hell!
To print a character on the screen, we need to set `ah` to `0xe` (teletype mode screen), `al` to ascii code of character to print, and call `int 0x10`. We could set `ah` once per al characters, and then just change `al`.

And this is how to write bootsector that prints "Hell!" on the screen using BIOS interrupt:

```x86asm
mov ah, 0x0e 	; teletype mode for BIOS interrupt 

mov al, 'H' 	; char to print
int 0x10 		; call interrupt to print char
mov al, 'e' 
int 0x10 
mov al, 'l'
int 0x10
mov al, 'l'
int 0x10
mov al, '!'

jmp $

times 510-($-$$) db 0 ; pad with zeroes

dw 0xaa55 ; magic number to mark this as boot sector
```

It prints "Hell!" because "Hello, world!" would be too much work. Until we implement strings.
 
Or, one cool trick. Since we are so low level, we could look at binary produced, and figure out that  code

```x86asm
mov al, 'H'
int 0x10
```

is compiled to `b0 48 cd 10`, where 48 is ASCII code of `'H'`. So we could write code to print "Hell", like this:

```x86asm
db 0xb0,'H',0xcd,0x10
db 0xb0,'e',0xcd,0x10
db 0xb0,'l',0xcd,0x10
db 0xb0,'l',0xcd,0x10
```

Lower than that would be just rewiring cables on plugboard.

## Memory

`label:` could be seen as constant that stores index of byte in memory from which instruction (or bytes defined by `db`) after it starts.

The problem is, BIOS loads code of boot sector to address `0x7c00`, because beginning of memory is already taken by ISRs, if you remember. To offset our addresses, we could tell assembler that our program will be located there by using directive `[org 0x7c00]`.  We could also do pointer arithmetic manually, be we will do it for more interesting things, which is to print "Hello, world!".

So we could put bunch of bytes somewhere after our code using `db "Hello world!"`, mark their address using `msg:`, and then use `msg` to set value of `ah`.

Just if we will use `mv al, msg`, it will put into `al` address marked by `msg`, and later print ASCII value of it. If we want to do pointer dereferencing, we use square brackets `mv al, [msg]`. NASM also could do pointer arithmetic for you. This, for example, prints "Hel": 

```x86asm
[org 0x7c00] ; Memory offset of boot sector

mov ah, 0x0e; teletype mode

mov al, [msg] ; put value from memory address msg to al
int 0x10 	
mov al, [msg+1] ; put value from memory address msg+1 to al
int 0x10 	
mov al, [msg+2]
int 0x10 	

jmp $ ; loop forever

msg: 
db "Hello world!"

times 510-($-$$) db 0 ; pad with zeroes
dw 0xaa55 ; magic number to mark this as boot sector
```


## Control structures
In language C, string is sequence of bytes that ends with byte 0. If we create our string like this, we could write code that loops over addresses starting from beginning of string, and stops when reaches zero character.

We already know how to do infinite loops:
```x86asm
loop:
jmp loop

; or shorter equivalent:

jmp $
```

To program loops that end, we need conditional jumps, and comparison instruction.

`cmp x, y`, compares `x` with `y`, and sets result into special `flags` register. Now, there are instruction that jump depending on the comparison result stored in that register:
- `je` - jump if equal
- `jne` - if not equal
- `jl` - less than
- `jle` - less than or equal
- `jg` - greater
- `jge` - greater or equal

And we need a little bit of arithmetic:
- `inc ax` - increments `ax` (`ax++``)
- `add ax, 2` - adds 2 (or any other value you wish) to `ax` (`ax+=2`)

## Hello world, finally
Putting it all together:

```x86asm
[org 0x7c00] ; Memory offset of boot sector

mov ah, 0x0e; teletype mode

mov bx, msg ; put address of message to bx

loop:
	mov al, [bx] ; prepare to print character to which bx points now

	cmp al, 0    ; is it 0?
	je finish    ; if yes - jump to finish

	int 0x10 	 ; print current character

	inc bx 		 ; go to next byte
jmp loop

finish:
jmp $ ; loop forever

msg: 
db "Hello, world!",0

times 510-($-$$) db 0 ; pad with zeroes

dw 0xaa55 ; magic number to mark this as boot sector
```

If you forget to jump to finish, and make infinite loop, you could print content of whole memory. Which of course will be trash once you went over "Hello, world!", all the zeroes and magic number.

Next level from here, would probably be to try to fit "fizz buzz" into boot sector, or load more sectors.
