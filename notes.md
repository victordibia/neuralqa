## General Notes on Design

### IR Elastic Search
- User experience
    - Query highlighting. 
        - Pros: Showing highlights of how matching is provided helps the user make sense of decisions made by the IR module.
        - Cons: Query highlighting can increase query time by up to **6x**.

    - Stop word removal. Search queries including stop words (the, of, a) can make IR results noisy e.g. longer passages with these words get better matching scores based on frequency of occurrence of stop words which hold little value for actual relevance. Given that we will rely heavily on the ranking produced by elastic, we want to be more conservative here



### Bert Passage Reading

- BERT models process input with a max sequence length of 512 tokens. This introduces latency challenges when attempting to read a typical court document (> 10,000 tokens). In general, we have a few options
    - Read all passages
        - Look at all  opinions within each case
        - Pro: Exhaustive search on all content 
        - Con: Court document are long and sometime repetitive! 
    - [The approach we use] Read a curated subset of all passages
        - Use highlights from elastic (snippets that contain search query) as passage candidates
        - Merge these highlights into a single passage that can be read by BERT


### Passage Tokenization

- Using the default tokenization for distilbert (or any other neural model) reveals a couple of issues. First, our case dataset contains a set of knarly sequences (citations) e.g `Baldasar v. Illinois, 446 U.S. 222, 100 S.Ct. 1585, 64 L.Ed.2d 169 (1980)` and can get tokenized into the strangest (long) tokens. 
- This makes a case for some form of "data cleaning" to "manage" the size the size of tokens generated for each passage e.g. removing certain alphanumeric words/sequences that are unlikely to contribute to meaning of queries


### Optimizations
- Uses the HF fast tokenizer .. 5 - 7x improvement in tokenization speed.

## Thoughts
- Leveraging signals from highlights provided by IR methods goes a long way in making BERT practical for use today.
- On a commercial CPU laptop it takes about 0.3 seconds for BERT to read a relatively short passage (200 words)
- While IR will frequently return snippets that are relevant, there is still additional human effort required to part each of these snippets and examine the surrounding area for clues towards the answer. This is where a BERT QA  can indeed serve to reduce this effort significantly.
- 