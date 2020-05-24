## General Notes on Design

### IR Elastic Search
- User experience
    - Query highlighting. Showing highlights of how matching is provided helps the user make sense of decisions made by the IR module.
    - Stop word removal. Search queries including stop words (the, of, a) can make IR results noisy e.g. longer passages with these words get better matching scores based on frequency of occurrence of stop words which hold little value for actual relevance. Given that we will rely heavily on the ranking produced by elastic, we want to be more conservative here
    - 



### Bert Passage Reading

- Long Passage Handling BERT has a max sequence length of 512 tokens. We have a few options
- We can 

### Passage Tokenization

- Using the default tokenization for distilbert (or any other neural model) reveals a couple of issues. First, our case dataset contains a set of knarly things that look like this `` and can get tokenized into the strangest tokens. 
- This makes a case for some form of "data cleaning" to "manage" the size the size of tokens generated for each passage e.g. removing certain alphanumeric words/sequences that are unlikely to contribute to meaning of queries


### Reading Long Passages
- Most passages are well beyond 512 words, and can each generate over 10k tokens each. E


### Optimizations
- Uses the HF fast tokenizer