---
title: "Evergreen notes"
date: 2021-01-27T23:32:22+01:00
tags:
- notes
- on writing
---

Here are my notes of [the notes about "evergreen notes"](https://notes.andymatuschak.org/Evergreen_notes). I find concept interesting, as it reminds me of how I already tried to do knowledge management in the past, while editing Wikipedia, or keeping notes for myself.

**Evergreen notes** are notes made across projects which are expected to evolve and accumulate. "Evergreen" here means functional, live & useful for a long time.

<!--more-->

Andy Matushak invented the term "evergreen notes". He argues that most people write only transient (temporary) notes. Transient notes usually serve only as aid to working memory. Some people try to improve efficiency of transient note taking. This is not very effective, because they focus on improving the tool of note taking, while improvement effort should be focused on better thinking. And transient notes lack useful feedback, so people often plateau in their writing skills.

Evergreen notes are derived from Zettelkasten (note boxes) system, created by Niklas Luhmann. He was a very productive sociologist, who, with the help of his system, published about 70 books. Andy adds, that unlike other people who write articles about note-taking, he actually achieved something in other fields using his tool, while main job of note-taking article authors is writing about note taking & other life hacks. 

## Principles
Evergreen notes are built on following principles:

* They are **atomic**. Each note is about one thing, but comprehensive. Think about them as software modules, keeping in mind coupling and cohesion.
* They are **concept-oriented**. You don't write evergreen note about one book or author, you write it about one idea, and when you read another book on topic - add to existing note. 
* They are **densely linked**. When you write about idea - think about how it relates to other ideas. Building links will make you reread existing notes, which in turn will work as a form of spaced repetition. Links not necessary have to be made to existing notes, they could serve as a writing backlog for the future. 
* **Associative ontologies** (graphs) are better than hierarchical taxonomies (trees). Structure of notes should emerge organically, and not be enforced in advance. Tags are ineffective in organizing knowledge, because they do not add weight (measure of how much something belongs to a tag) to association. Labeled associations are better: why is this associated with that? 

## Process
**Write about what you read**. This will increase your understanding of topic, and you will forget less. Also, if you write about what you read, you will not just repeat someones neural process, but process it yourself and may be have another conclusions. Process of writing about reading has two steps:

1. Write annotations & observations while you read. Bookmark some pages, write down quotes. 
2. Process list of annotations into evergreen notes for each concept.

Maintain **reading backlog** - anything you will read soon. If you are not reading something for a long time - remove it from reading backlog (but you could keep a reference to it in some evergreen note). 

Maintain **writing backlog**. Regularly go over your transient notes and discard unimportant, or add important stuff to evergreen notes. Finish unfinished evergreen notes.

When you need to write about some topic, starting with evergreen notes will be easier then starting from the blank page:

1. Review notes related to topic and probably also related to them. Reviewing notes could cause some interesting new ideas.
2. Write outline.
3. Attach existing notes to outline, add missing notes.
4. Concatenate whole text.
5. Rewrite.

## My ramblings on possible implementations
Andy Matushak uses his own proprietary software for his system. I think it would be not hard to implement with just any tool that could process markdown. But of course any tool that will help with adding links, indexing and tracking backlinks would be useful.

Maybe it could be done in TiddlyWiki and I should give it another try. I used it to aid me with onboarding into my current job, and it was not bad, if you don't count that it uses markup language different from markdown and MediaWiki, and I found it hard to compile some publishable documentation for intranet from it.

Or maybe it could be small program that maps folder with markdown files into set of HTML pages with computed backlinks & index. Maybe that program would also have an interface to edit markdown and see result in split view, and also update markdown file on server? Or something like MediaWiki? Maybe something simpler than MediaWiki, as it requires lots of infrastructure. 

I also have this idea of an application that stores notes on an infinite 2d plane. Something like digital [evidence board](http://en.wikipedia.org/wiki/Evidence_board) in style of [fsn file manager](https://en.wikipedia.org/wiki/Fsn_(file_manager)). Notes have coordinates, width and height. (Maybe also rotation?) And style (background, border...) Notes also could be bitmap or vector images or SVGs. You could add links between notes, and reposition notes using some force-directed graph drawing algorithm. And have infinite level of zoom, where smaller notes are displayed only when you zoom in, and disappear when you zoom out. I imagine that this maybe could be used not only for concept mapping, but for working with code, where you have functions call other functions, and they are organized into classes, modules, packages etc... So when you have architecture of some system of the screen where you see relations between microservices, you zoom in and see packages of microservice, zoom in again - see classes & functions, zoom in again - see implementation of method on the screen.

But for now I just have a blog. Hugo maps markdown into HTML for me, but blog enforces chronological structure. Removing dates from notes will not help, because in blog notes are published, or not published, they are not evergreen.

How do you, dear reader, store your thoughts and work on your notes? 
