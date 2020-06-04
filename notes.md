## General Notes on Design

In this note, we will discuss some implementation decisions made while desigining CaseQA. 

### Information Retrieval with Elastic Search 
- User experience
    - Query highlighting.
    We use the query [highlighting](https://www.elastic.co/guide/en/elasticsearch/reference/6.8/search-request-highlighting.html) feature offered by elastic search. 
        - Pros: Showing highlights of how matching is provided helps the user make sense of decisions made by the IR module. 
        - Cons: Query highlighting can increase query time (in some cases we saw up to **5x** increased time for first time queries) .  

    - Stop word removal. 
    We apply an [elastic analyzer](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-stop-analyzer.html) to prevent elastic from matching based on stop words.
    Search queries including stop words (the, of, a) can make IR results noisy e.g. longer passages with these words get better matching scores based on frequency of occurrence of stop words which hold little value for actual relevance. Given that we will rely heavily on the document retrieval ranking produced by elastic for downstream QA, we want to be more conservative here.



### Passage Selection Strategy

- BERT models process input with a max sequence length of 512 tokens. This introduces latency challenges when attempting to read a typical court document (> 10,000 tokens). In general, we have a few options
    - Read all passages
        - Look at all  opinions within each case
        - Pro: Exhaustive search on all content 
        - Con: Court document are long and sometime repetitive! 
    - Passage Fragmentation
        - At index creation time, we can break up large passages into smaller paragraphs and store them as individual documents in the index.
    - [The approach we use] Curated Passages based on highlights
        - Use highlights from elastic (`n` snippets that contain search query) as passage candidates
            - This allows us reduce a passage of 10k tokens to ~1000 tokens!
        - Merge highlights from each passage into a single combined passage that can be read by BERT
            - Depending on the size of the snippets used, the combined passage may exceed the total number of tokens that BERT. Here we use a chunking approach
                - Encode long question and passage once
                - Construct question + passage_chunk such that len(question + passage_chunk) < max_model_length
                - Use a stride to keep some context across chunks (can result in more tokens)
        - Rank extracted answer spans based on softmax probability of answer start position. 


### Passage Tokenization

- Using the default tokenization for distilbert (or any other neural model) reveals a couple of issues. First, our case dataset contains a set of knarly sequences (citations) e.g `Baldasar v. Illinois, 446 U.S. 222, 100 S.Ct. 1585, 64 L.Ed.2d 169 (1980)` and can get tokenized into the strangest (long) tokens. 
- This makes a case for some form of "data cleaning" to "manage" the size the size of tokens generated for each passage e.g. removing certain alphanumeric words/sequences that are unlikely to contribute to meaning of queries
- Transformer Fast Toknizer
    - Using the fast tokenizer library by HuggingFace resulted in ~6.8x speedups for input tokenization


## Thoughts
- Leveraging signals from highlights provided by IR methods goes a long way in making BERT practical for use today.
- On a commercial CPU laptop it takes about 0.3 seconds for BERT to read a relatively short passage (200 words)
- While IR will frequently return snippets that are relevant, there is still additional human effort required to parse each of these snippets and examine the surrounding area for clues towards the answer. This is where a BERT QA  can indeed serve to reduce this effort significantly. By surfacing snippets, the BERT model either address the users requirement immediately, or serve as an index into the larger document for further exploration.
