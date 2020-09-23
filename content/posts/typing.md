---
title: "Thoughs on typing"
date: 2020-09-23T18:36:19+02:00
tags:
- ideas
---

I was searching for something related to SICP, found [this post](https://irreal.org/blog/?p=6019), and noticed another article on that blog, [about typing speed](https://irreal.org/blog/?p=9115).

That article argues that even though typing speed usually is considered to not be a bottleneck in the developer's productivity, it really is. Because, even if we agree that typing code is a small fraction of all the work that software developer is doing, developers type a lot, and it's mostly communication: chats, Jira, emails, documentation, etc.

<!--more-->

Which got me thinking that on last performance review often mentioned area of improvement for me was communication. So, I went through [Google technical writing course](https://developers.google.com/tech-writing/overview) and did exercises there on how to write better text. Did I start to communicate better? Barely, I still prefer to write code instead of long Jira issue descriptions or design documents with proposals for new features. Maybe it is because I type slowly (60 wpm). This is better than 90% or something of the population, but the general population does not spend most of their working day behind the keyboard.

There was another article on that blog, [how to increase your typing speed](https://irreal.org/blog/?p=9087), which linked to [a video with tips to improve typing speed](https://www.youtube.com/watch?v=1ArVtCQqQRE), and [video blog of a guy who increased his speed from 50 wpm to 100 wpm](https://www.youtube.com/watch?v=hnX63qh0EfM), and I thought that maybe I should to try to reach 100 wpm speed too. 

So, I went to [keybr.com](https://www.keybr.com/), and already spent in a total of 2 hours practicing there, and my current record is 90.6 wpm. Not yet 100, but very close.

Keybr generates random texts (with "words" made from random characters) by using statistics on how you type, to train your weakest keys. I think this approach is good and will get me to 100 wpm there in a month or so of focused practice. But it could be improved further.

First, keybr.com has no special characters, which are critical for a programmer. And even for a writer. When I write this in markdown, I use square brackets to add links, for example.

Second, the text is different every time, and you could not repeat the same text to see how you improved. 

I also have read about [an interesting method on the forum about Colemak keyboard layout](https://forum.colemak.com/topic/2201-training-with-amphetype/), called "type-reading", where you type some interesting book paragraph by paragraph, so you train your typing at the same time as you read it. And suggestion to use this to learn some poems. I think it is a very nice idea, which could help me to learn some German. (If you are wondering, no, I'm not going to learn Colemak or Dvorak, I switch Ctrl and Fn keys on my computers, to have Ctrl on the lower-left corner, and that is enough pain when I'm using someone's computer, or when someone uses mine). 

And third, it would be nice to have statistics on only on separate keys, but for trigrams or some kind of n-grams (I'm not sure which n would be optimal). And given some text, it should calculate optimal exercise to speed-up typing that text the most. Keeping in the account that the fastest trigrams are hardest to speedup, but the most frequent ones will influence overall typing speed at most. 

And it should be some console program, so anytime I could type the command:

```
typetrainer add if_kipling if.txt
```

And it will add lessons based on that poem to the set of lessons. And then to test & train run:

``` 
typetrainer test if_kipling
typetrainer train if_kipling
```

And training session will be generated with randomly selected trigrams, where the probability of each trigram to appear next is probably the frequency of that trigram in sample text divided by the speed with which it is typed measured in our average trigram speed (the faster we type the less it is needed to be improved). 

And for each trigram, we keep per-lesson stats, and global stats, of maybe 10 last typing speeds in the ring buffer, so we have a moving average of 10 values instead of the last value, which could get pretty noisy.

Maybe https://github.com/pb-/gotypist could be updated to be like that.

But maybe I should fist focus on achieving 100 wpm speed on keybr.com, and finishing SICP. I have many interests, sometimes they conflict, as Smixx would rap in "Developers". 
