const chunker = require('./chunker');
const retriever = require('./retriever');
const prompt = require('./promptBuilder');
const llm = require('./llmClient');
const embed = require('./embeddingsClient');

class ragEngine {
  constructor(llmkey, embkey, url, model, path) {
    this.chunker = new chunker(300, 50);
    this.prompt = new prompt();
    this.llm = new llm(llmkey);
    this.embed = new embed(embkey, model, url, path);
    this.retriever = null;
  }

  async ingest(docs) 
  {
    this.chunks = [];

    for (let i = 0; i < docs.length; i++) 
    {
      const parts = this.chunker.split(docs[i]);

      for (let j = 0; j < parts.length; j++)
      {
        if (parts[j].length > 0) 
        {
          this.chunks.push(parts[j]);
        }
      }
    }

    let vectors = [];

    if (this.embed.isEnabled())
    {
      try
      {
        vectors = await this.embed.embedBatch(this.chunks);
      } 
      catch (err)
      {
        console.log('[RAG] embeddings failed: ' + err.message);
      }
    }

    let semantic = false;

    if (vectors.length > 0)
    {
      semantic = true;
    }

    this.retriever = new retriever(
      {
        vectors: vectors,
        chunks: this.chunks
      }
    );

    this.semantic = semantic;

    if (semantic)
    {
      console.log( '[RAG] ingested ' + this.chunks.length + ' chunks (Embeddings only).');
    }
    else 
    {
      console.log('[RAG] ingested ' + this.chunks.length + ' chunks (Embeddings unavailable).');
    }
  }

  async ask(q, onToken)
    {
    if (!this.retriever) 
    {
      throw new Error('ingest() must be called before ask().');
    }

    if (!onToken) 
    {
      onToken = function () {};
    }

    let qv = null;

    if (this.semantic)
    {
      try
      {
        qv = await this.embed.embed(q);
      } 

   
      catch (err) 
      {
        qv = null;
      }
    }
    
    const docs = this.retriever.retrieve(qv, 15);
    const p = this.prompt.build(q, docs);

    const answer = await this.llm.generateStream(p, onToken);
    return {
      answer: answer,
      sources: docs
    };
  }
}

module.exports = ragEngine;


