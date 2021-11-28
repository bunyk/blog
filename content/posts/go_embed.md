---
title: "Embedding files in Go"
date: 2021-11-28T22:08:07+01:00
tags:
- go
---

Go has a nice property - it compiles to single executable, that could just run. Which does not have depencencies to other packages, does not require runtime or interpreter.

But many of programs could not be built just in Go, and use multiple of different languages that are better fit for their tasks. For example in web you would probably use a lot of SQL, JavaScript, CSS, HTML, JSON, etc... Even desktop apps could use some embedded XML or GLSL, or even CSS for styling.

![Yo dawg, we heard you like coding](/content/yo-dawg-code.jpg "Put a language in your language")

There are two ways to put such code in your projects: as string literals in Go code, or as separate files. Separate files have advantage of having better modularity, and being more readable (less indentation, and it's easier to highlight file with extension `.sql` as SQL).

But text files in project that does not contain Go code have huge disadvantage - they are not included into the executable built by compiler, and need to be loaded during runtime. So you need to add them to Docker image, and distribute docker image instead. Or distribute your program in some other package format, that includes both executable and files.

Four years ago I have built a package & tool to fix that problem and embed text files into go executable as strings: [https://github.com/bunyk/require](https://github.com/bunyk/require)

In that library you could call `require.File("filename.txt")`, and it will return content of that file as a string, without actually opening it. There is a `hardcode` utility that generates go code for each `require.File` call you have in your codebase to work.

But today I noticed two interesting lines [in code of Neoray](https://github.com/hismailbulut/neoray/blob/e4baaaf8a09651a4f311a6e50cfb5ed3ec0fae14/src/renderergl.go#L40-L41) (My GUI of choice for Neovim):

```go
//go:embed shader.glsl
var EmbeddedShaderSources string
```

Turns out that since Go 1.16, [embed functionality is in standard library](https://go.dev/doc/go1.16#library-embed). Written by Russ Cox and reviewed by Rob Pike ([commit](https://cs.opensource.google/go/go/+/400581b8b008ece8d0df34f54f281d365a175dba)). So, obviously it has better design than my package.

Small downside it has, is that you could use it only with global variables. Using `embed` directive in function gave me `cannot apply to var inside func` compilation error. And it does not work with constants, so you need to be careful to not mutate value yourself. 

But, that are not really reasons to not deprecate my library. To quote fortune program used as an example:

> One of my most productive days was throwing away 1000 lines of code.  — Ken Thompson


```go
package main

import (
	_ "embed"
	"fmt"
	"math/rand"
	"strings"
	"time"
)

//go:embed fortunes.txt
const contents string

func main() {
	fortunes := strings.Split(contents, "\n")

	rand.Seed(time.Now().UTC().UnixNano())

	fmt.Println(fortunes[rand.Intn(len(fortunes))])
}
```
