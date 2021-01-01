---
title: "Machine Translation course notes"
date: 2020-12-04T17:11:00+01:00
toc: true
mathjax: true
tags:
- MOOC
- notes
---

Recently finished Coursera course on [Machine Translation](https://www.coursera.org/learn/machinetranslation/). That was mostly overwiew course without any programming practice, but with a lot of links to scientific papers. So it is somewhat theoretical, but I would probably recommend if you want to dive into that field from research point of view.

So for example you get quizzed with questions like:
One important difference between phrase-based MT and n-gram based MT is:

1. N-gram based MT has a fixed segmentation into units.
2. ..

But you will not be taught how to implement any of those. Instead you will get links to [MOSES](http://www.statmt.org/moses/) & [GIZA](http://www.statmt.org/moses/giza/GIZA++.html) projects. But probably course will help to understand that project.

I'm not at all a researcher, have no skill of reading the papers, and to get most of that course, tried to just write down notes. I have couple of promising areas into which I should dive deeper and experiment, to help me with my job of automating content creation for multilingual e-commerce site. And just on listening lectures, writing down notes and doing quizzes took me 14 hours measured in pomodoros to complete (already more than SICP, I should return back to it eventually). Then I'll probably try some hands-on experimentation [with TensorFlow](https://www.tensorflow.org/tutorials/text/nmt_with_attention).

So, here are typed notes made of my handwritten notes. They probably will not make much sense for you, especially because I'm to lazy to digitize hand-drawn diagrams, but maybe will help you to figure out what is inside the course and if you need to enroll into it yourself.

<!--more-->

## History

Translation has long history. Longest known parallel corpus of text is Bible, which is translated for thousands of years already.

People started to think about machine translation (MT for short), just when machines appeared - after WW2. 

There was some "memorandum" of Warren Weaver in 1949, where he compared task of MT to task of decryption. And first model of translation was decryption model.

In 1954 there was a Georgetown experiment, where they translated 19 sentences from russian. 

In 1966 was published ALPAC report, that said that MT failed to give meaningful results, and people mostly gave up on this.

1977 was the year of first successfull application of MT translation in limited scope - [METEO system](https://en.wikipedia.org/wiki/METEO_System) for translating weahter forecasts from French to English. It used rule-based approach.

At the end of 1980s MT research resumed mostly with efforts by Japan. 

First implementations of statistical machine translation appeared in 1990.

In 2005 MT have seen public adoption by organizations like Google, MicroSoft, EU Parlament...

## Approaches

We could approach translation with different levels of abstraction (from highekst to lowest):

- Interlingua (encodes meaning, sematnic and pragmatic, but is hard to create, because creator needs to know all languages that will be used)
- Semantic transfer
- Syntactic transfer
- Dictionary transfer/lookup

This hierarchy is called Vaquois triangle.

Historically MT was approached with:

1. Dictionary lookup (looks weird and is not correct)
2. Rule based MT (very laborious and manual)
3. Example based translation
4. Statistical translation (SMT)
5. Neural translation (NMT)

3 to 5 are data driven, which means we don't need to reprogram system for new translations, just retrain it.

We could translate from and to different modalities - images, voice, etc. But different modalities bring in their challenges, like the need to infer punctuation from intonation, and need to train speach recognition, performance of which will influence performance of system overall.

## Data
Success of MT is also influenced by availability of language data on the web. Modern MT systems train on gigawords datasets, while average human speaks 0.5 gigawords in a whole lifetime.

One common source of parallel data is European parlament, which publishes documents in 23 languages of EU. 

## Performance
Measuring performance of MT system is additional challenge. You could not just compare translations with unittests, as most of the sentences have multiple correct translations. Additionally apart from correctnes, we need to think about style transfer: formal/informal style, politeness, everyday/academic language etc.

There is popular scoring scheme for MT systems called BLEU.


## Use cases
- assimilation: use MT like Google translate to understand foreign text.
- dissemination: produce text in foreigh language. This use case needs a good quality. But here quality could be improved also by tuning source (reducing ambiguity, etc.) 

## Language
Syntax of a language defines it's structure, or how to compose it's elements.

Semantics defines meaning.

Basic units of machine translation are usually words. And word segmentation is already a nontrivial problem. Winterschuhe in German is two words or one? 

Morphology adds another challenge to the task of translation. Morphemes are built from stem & morphems. 

Example Finnish -> English:

- talo -> house
- talossa -> in house
- talossani -> in my house
- talossanikin -> in my house too
- talossanikinko -> in my house too? 

Parts of speech define which role word plays in the sentence. Noun, adjective, verb, etc...

Grammatical category - property of items within grammar: Tense, Voice, Person, Gender, Number...

Agreement - when grammatical category of one word influences morphology. For example when noun and adjective should have same gender and number.


Sentence structure could be described by phrase structure grammar:

Jane buys a house

```
S (sentence)
├── NP (noun phrase)
│   └── Noun
│       └── Jane
└── VP (verb phrase)
    ├── Verb
    │   └── Buys
    └── NP
        ├── article
        │   └── a
        └── Noun
            └── house
```

Semantics has important property of compositionality: meaning of a sentence is composed from meaning of its phrases.

Lexical semantics - meaning of single words. 

It's difficult to derive semantics, because:

- Words could have multiple meanings
  - polysemy: one word could have multiple meanings: interest (in something, or %), bank (of a river, or financial institution).
  - homonymy: different words could have the same spelling: can (a verb, expresses ability to do action), can (a noun, for example: can of beans).
- Semantics is influenced by context
- It is influenced by structure
- Lexical mismatch. Word in one language could be described by different words in other languages, for example rice in japanese has one word for cooked rice, and another word for a rice plant. In spanish fish is "pez" when it is in the water, but "pezcado" when it is a dish.
- Morphology also adds information. Lehrer, Lehrerin -> male & female teacher

It is easier if source language has more information than target one.

- References
  - Co-reference (to something in sentenc or outside)
  - Anaphora: he, she, it
  - Deictic reference: hree, now, I.
  - Reference with synonym: house, buidling...

Example: "If the baby does not strive on the raw milk, boil it."

"It" referes to what? 

- a) baby
- b) milk

Additional difficulty is that language is evolwing and constantly gains new words:

- Constructed: Brexit = Britain + Exit
- Borrowed: downgeloaded (german for downloaded)

Abbreviations, are another challenge for sematnics.

## Approaches

Rule based MT: humans write rules, computer applies rules to text.

Corpora based: get big text corpora, apply machine learning.

Vauquois triangle:

![Vauquois triangle](https://upload.wikimedia.org/wikipedia/commons/f/f4/Direct_translation_and_transfer_translation_pyramid.svg)

### Rule-based 
Dictionary based. Does not work between languages where structure of sentence changes much.

Example of application of dictionary based approach - translation memory. Find similar already translated sentence and show to translator. 

Transfer-based. 3-step approach:

1. Analyze source and generate it's abstract representation (parse tree, morphology information etc.)
2. Transfer source representation to matching target representation using rules.
3. Generate target text from target representation. Ex: (house, plural) -> "houses".

Interlingua - language for pure meaning. Just 2 steps:

1. Analyze
2. Generate

Interlingua approach helps in cases of having many language pairs.

But good interlingua is hard to find and it is done only for limited domains.

### Corpus-based
No more manually written rules. We learn models from data.

It is usually easier to collect data then to have language experts that could write rules.

Statistical machine translation:

1. Create alternative translations.
2. Score them.
3. Select one with best score.

First SMT approaches were direct translations, advanced SMT uses interlingua representations.

Neural machine translation is also corpus based and is the latest approach developed for now. Has following advantages:

- Automatic learning of intermediate representation, no need to design it.
- More compact representations than in SMT
- Better translation quality


## Data
Is main knowledge source in corpus-based approach. 

- Monolingual data (raw text) is available in huge amounts.
- Parallel data: pairs of sentences in 2 languages.

There are algorithms for sentence alignment for cases where we have parallel data aligned by documents, not by sentences.

Famous corpuses: TED corpus, EU parlament corpus.

Notation note: source sentences are marked with letter f (for French) and target with e (for English).

Data requires preprocessing to make text homohenous.

For example numbers are replaced with placeholder token, as they could refer to pages, which change from language to language, and we would not want to train on that.

Tokenization: mainly done by spaces and punctuation for european languages. Special cases are abbrefiations.

True-casing: some words should be uppercase, some lower-case, but at the beginning of the sentence they should be uppercase. Need to train on true case.


## Evaluation
How to measure quality of translation? It is important, as you could only improve what you could measure.

Approaches: Human vs automatic.

Difficulties: 

- Multiple translations are correct, we could not just compare strings.
- Small changes could be very important. ("Let's eat grandma" vs "Let's eat, grandma")
- Evaluation is subjective


Human evaluation:

- Advantage:
  - Gold standard
- Disadvantages:
  - Subjective
  - Expensive
  - time consuming

Automatic

- Advantages:
  - Cheap
  - Fast
- Disadvantages:
  - still need human reference
  - difficult. If we made good evaluation program, maybe just use it to select best translation for us?

Granularity:

- Per sentence? 
- Per document? 

Task-based evaluation - is translation good for it's application? 

Aspects of evaluation:

- Adequacy: is translation correct
- Fluency: does it sound unusual in that language?

Error analysis: where is the source of error? Wrong word, wrong order ... There is special software - BLAST - toolkit for error analysis.


### Human evaluation
Expensive, so we need to minimize effort.

Stats:

- *Inter annotator agreement* - how different annotators evaluate translations. Study was a 2016 shown that [Cohen's kappa](https://en.wikipedia.org/wiki/Cohen%27s_kappa) coefficient (0 - random rankings, 1 - rankings are completely the same) for different annotators is 0.357
- *Intra annotagor agreement* - how same annotator ranks the same translation next time it is shown him: 0.529.

So, translators tend to disagree about quality not even with others, but with themselves. 

#### Approaches

Direct assesment:\
Given: source, translation.\
Evaluate: performance, adequacy, fluency at some scale.

Ranking:\
Given number of translations, select best of them, or rank them from best to worst.

Post editing:\
Measure time or keystrokes to edit machine translation into correct translation.

Task-based:\
evaluate translation performance where it will be used. Give students translated text, and then quiz them if they understood it.

- Advantage: this measures overall system performance.
- Disadvantage:
  - complex
  - other factors, like quality of source, or some aspects of task influence result of evaluation


## BLEU: BiLingual Evaluation Understudy

BLEU uses human translated examples from the same source as machine translated, and then checks how good they match.

<div>$$ \text{n-gram overlap} = \frac{|\text{n-grams in example} \cap \text{n-grams in MT}|}{|\text{n-grams in MT}|}$$</div>

$$Score = \sqrt[4]{\text{1-gram overlap} \cdot \text{2-gram overlap} \cdot \text{3-gram overlap} \cdot \text{4-gram overlap} } \cdot BP$$

Brevity penalty: <div>$$BP = \begin{cases}
1, |MT| > |HT|\\\\\\
e^{1-\frac{|HT|}{|MT|}}, |MT| \leq |HT|
\end{cases}$$</div>

BP is necessary to not rank too short translations (which loose information) too highly (as score is higher for shorter MT sentences). 


## Statistical Machine translation
Word based SMT. Do not directly translate, find probability of some sentence being a translation. As it is hard to compute probability of a sentence (it is small), we move down to words.

Lexicon: store possible translations for word. Example:

Wagen: 

| Word    | Count | Probability |
|---------|-------|-------------|
| vehicle | 5000  | 0.5         |
| car     | 3000  | 0.3         |
| coach   | 1500  | 0.15        |
| wagon   | 500   | 0.05        |

Also we have alignment function from target words to source words (which translates to which). Target words additinallly have NULL to "translate" source words that does not exist in target.

Having lexicon and alignment function, we could implement [IBM Model 1](https://en.wikipedia.org/wiki/IBM_alignment_models). To get alignment function, we could use [expectation-maximization algorithm](https://en.wikipedia.org/wiki/Expectation%E2%80%93maximization_algorithm).

### Language model
Language model is a probability distribution of a sentences in language (how probable that given sentence is generated by native speaker of that language). It tries to model fluency (not accuracy).

<div>$$ P(w_1, w_2, ..., w_i) = \frac{\text{occurences}}{\text{total sentences}}$$</div>

Lots of sentences do not occur in training, but it's good to have P > 0 for them.

<div>$$ P(w_1, w_2, ..., w_i) = P(w_1) \cdot P(w_2 | w_1) ... \cdot P(w_i | w_1, w_2, ..., w_{i-1})$$</div>

*Markov assumption*: probability of word is approximated by n previous words before it.

<div>$$ P(w_3 | w_1, w_2) = \frac{count(w_1, w_2, w_3)}{\sum_{\forall w} count(w_1, w_2, w)}$$</div>

Unknown n-gram => count = 0, P = 0 => P(sentence) = 0. This is bad, so we will need smoothing, where we shift some probability to unseen words.

One smoothing approach is to count unseen n-grams as occuring once, but that shifts a lot of probability to unknown. 

Long n-grams are more precise, but a lot more sparse. We could use interpolation between long and short n-grams:

<div>$$ P(w_3 | w_1, w_2) = \lambda_1 P_1(w_3) + \lambda_2 P_2(w_3 | w_2) + \lambda_3 P_3(w_3 | w_1, w_2)$$</div>

Most common smoothing model used today is modified Kneser-Ney smoothing.


### Translation
Task of translation - to find the most probable translation e, given source sentence f.

Translation model: $$ P(e|f) $$
Language model: $$ P(e)$$

How to combine two models?

Noisy channel approach from information theory. Assume source language was distorted into foreign language. Find most probable source message.

<div>$$\hat{e} = \underset{e}{\operatorname{argmax}} P(e | f) = \underset{e}{\operatorname{argmax}} \frac{P(f|e) \cdot P(e)}{P(f)}$$</div>

P(f) could be dropped, as it does not change depending on e.

Problem of this model is that often output is fluent, but not accurate. So we add weights to components to better tune it:

<div>$$\hat{e} = \operatorname{argmax} p(f|\hat{e})^{\lambda_{TM}} \cdot p(\hat{e})^{\lambda_{LM}} = \operatorname{argmax} e^{\lambda_{TM} \log (P(f|\hat{e}) + \lambda_{LM} \log ( P(\hat{e}))}$$</div>

Such kind of interpolation is called log-linear model. With it we are not restricted to two features, but could have any number of them. And with any weight.

How to get optimal weights? 

We could train in different stages:

1. Learn language model and translation model.
2. Tuning: learn weights. Test different weights on validation data.

Common way to speedup tuning, which could be very slow, because of many parameters & complex BLEU evaluation, is minimum error training:

1. Start from random weights.
2. Apply Powell search. For all parameters:
  1. Fix all parameters except current.
  2. Find best value for current.
3. Save result, and start from 1 until having enough results.
4. Select best one.

Need to evaluate translations using BLEU on whole evaluation set.

### Phrase based MT
Instead of having words as a basic units - use phrases. Phrase is any sequence of words.

It shold be better, because there is no word-to-word correspondence between languages. For example:

- Idioms: kicked the bucket (en) = biss ins Grass (de)
- Translation of word is context dependent: auf meine Kosten (de) = at my cost (en) => (auf = at), auf meinem Shiff = on my boat => (auf = on)

We use IBM Models to generate Viterbi alignment.

After alignment - extract phrase pairs from sentences:

saw = gesehen haben
bisher = up till now

Includes words
was = what

And longer phrases:

what we seen up till now = was wir bisher gesehen haben

Now, estimate probability from corpus:

Up till now:

| f         | count | p(f\|e) |
|-----------|-------|---------|
| bisher    | 20    | 20/70   |
| bis jetzt | 13    | 13/70   |
| bis heute | 8     | 8/70    |
| ...       | 29    | 29/70   |

<div>$$p(\text{bisher} | \text{up till now}) = \frac{2}{7}$$</div>

But with log-linear model we could use multiple features to improve translation. For example, when we seen phrase only once:

Up till now

| f         | count | p(f\|e) |
|-----------|-------|---------|
| bisher    | 1     | 1       |

Probability is 1, but we should not be so sure. So we could check inverse probability - how often we see "up till now" given "bisher".

Challenge of phrase-based MT is reordering. In German, for example verb could be split to be at the end and at the beginning of the sentence. So we could do some preordering first, so source sentence looks more like target one.

Or - use hierarchical phrases - phrases of phrases.

Was wir X gesehen haben -> What se saw X

Another approach - parts of speech language models. Build n-gram model from parts of speech: NOUN VERB NOUN. As there are a lot less parts of speech then words, n-grams could be a lot longer, without having a lot of sparsity. And having longer n-grams helps with ordering.

Also, cluster-based model could be used - automatically cluster words, when part of speech tagging is not available.


## Neural networks
- Perceptron
- Multi layer perceptron

Size of hidden layers is a hyperparameter.

Error functions:

- Mean square error:

<div>$$ E = \sum_x \sum_{i=1}^n (t_i^x - o_i^x)^2 $$</div>

- Cross entropy:

<div>$$ E = \sum_x \sum_{i=1}^n t_i^x \cdot \ln(o_i^x)$$</div>

o - output, t - desired output (target). x - each example from batch.

Stochastic gradient descent:

1. Randomly take example.
2. Calculate error function.
3. Calculate gradient.
4. Update weihts with gradient.

Model language using neural net. 

Multilayer perceptron, where input - previous n-1 words, output - next word.

Problem - no fixed vocabulary. Look at most common words, replace the rest with UNKNOWN token.

Represent each word by index in frequency table.

Then use one-hot representation, because we don't want to have "the" be more close to "and" then to "a". In one-hot representation all the words are on the equal distance from each other.

Word embeding layer - group similar words into one embedding. Automatically learned and has less values then input. Used for each word separately and then output of word embedding for whole sentence is feeded into hidden layer.

Softmax activation function:

<div>$$ o_i = \frac{e^{a_i}}{\sum_{j=0}^k e^{a_i}} $$</div>

makes sure that sum of all outputs of layer is 1, and is good for modelling probability.

### Recurrent neural network language model
Good for modelling long dependencies, where n-grams does not work good:

Ich melde mich ... an\
I register myself ...

register - melde an

Hidden state depends on input and previous hidden state output. Always insert one word and predict one next word. Use same one-hot representation with embeddings.

But it has wanishing gradient problem, backpropagation multiplies derivatives, and for first elements in sequence gradient is very small, so it learns very slowly. We try to fix this problem with special recurrent units: LSTM or GRU.

### Neural translation models
**N-gram based NMT approach**:

Reorder source to be similar to target. Extract translation units. Get pairs of minimal translation units.

Model probability of translating of "bisher" to "up till now", given history (previous translation units).

Challenge - there are a lot more possible translation units then words, as translation units are tuples of words. 

**Joint models approach**: Add source context to target language model.

**Discriminative word lexicon approach**:
Predict target word based on all source words in source sentence. Bag of words representation, one hot is replaced with many-hot.


### Encoder-decoder model
Sequence-to-sequence translation. No need for alignment. Whole system is trained together.

Source -> **Encoder RNN** -> hidden state of encoder is a sequence representation -> **Decoder RNN** -> Target

Advantage - it is simple. Disadvantage - has bottleneck - fixed size of sentence representation. 

Note: TensorFlow has [tutorial on sequence2sequence translation](https://www.tensorflow.org/tutorials/text/nmt_with_attention)

Decoding: Beam search. It is like greedy search, where we each time select next most probable word, but here we find n most probable words, then predict from them, then again prune to n best results and coninue until the end.

### Attention based NMT
Designed to overcome bottleneck of fixed representation between encoder & decoder.

Have sequence of hidden states.

Also, run RNN on reversed sentence, and as state depends most on the last input, we will have context with the next words. Compbine forward & backward representation and you will get representation for part of sentence. 

How to determine which source states to use for given decoder state? Another neural network.

Conditional GRU. _Here it become very confusing to me._

### Training
Same model differently randomly initialized will have different performances after training. 

**Ensemble of models** - average output of multiple models.

Advantage: better performance.
Disadvantages: Training speed, decoding speed.

**Weight averating** - while training save model checkpoints. Error could increase when training for longer time, so it's better to have more models with different errors. Take model with average weights from different checkpoints (but not models from different trainings, will not work).


### Byte-pair encoding
Another way to overcome vocabulary limitation (not fixed size, names, compound words, new words like brexit), except using UNKNOWN token, is to represent all possible words with just n symbols.

1. Represent sequence with characters.
2. Find most frequent two characters.
3. Replace them with new symbol
4. Repeat

Then, rare words will be split into multiple parts.

### Character-based NMT
No word segmentation. Istead of word embeddings - character group embedding. Challenge here is longer sequence length.

[Subword Neural Machine Translation](https://github.com/rsennrich/subword-nmt)


### Monolingual data for NMT
Again, available in a lot larger amounts. Even if it is better to have parallel data.

Decoder is similar to RNN language model.

- Train language model separately and combine with some weight in decoder.
- Syntetic data. Get monolingual data of target language machine translated to source, even if not very correctly, and train on it like on ordinary parallel data. It will be trained on good target data, even with incorrect source, so it will train to generate correct text.


### Multilingual MT
There are about 6000 languages. Which gives about 36 millions possible translation directions. There are no parallel data for all this pairs. Parallel data exists mostly with English.

Use English as interlingua? But it is ambiguous.

Use language-independent representation with language-dependent encoder-decoder and shared attention mechanism.

There is research from Facebook on [Language-Agnostic SEntence Representations](https://github.com/facebookresearch/LASER).


### NMT architectures
Popular ones are:

- LSTM
- Transformer architecture with self attention.

