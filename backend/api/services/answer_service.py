from transformers import pipeline

# Load TinyLlama (chat model)
generator = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    device=-1  # CPU
)

def generate_answer(query, context_chunks):
    context = "\n\n".join(context_chunks)

    prompt = f"""
<|system|>
You are a senior software engineer who explains code clearly and accurately.

<|user|>
Context:
{context}

Question:
{query}

Explain ONLY using the provided context.
If the answer is not in the context, say "Not found in code".
Be specific and refer to code behavior.

<|assistant|>
"""

    response = generator(
        prompt,
        max_new_tokens=200,
        do_sample=True,
        temperature=0.3
    )

    output = response[0]["generated_text"]
    return output.split("<|assistant|>")[-1].strip()