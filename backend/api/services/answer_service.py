from transformers import pipeline

# Load TinyLlama model (CPU)
generator = pipeline(
    "text-generation",
    model="TinyLlama/TinyLlama-1.1B-Chat-v1.0",
    device=-1
)


def generate_answer(query, context_chunks):
    # Convert list of chunks into single context string
    context = "\n\n".join(context_chunks)

    # Strong prompt to force model to use context
    prompt = f"""
<|system|>
You are a senior software engineer.

You MUST answer ONLY using the provided code context.
Do NOT give general explanations.
If the answer is not present in the context, say: "Not found in code".

<|user|>
Context:
{context}

Question:
{query}

Explain clearly based only on the code.

<|assistant|>
"""

    response = generator(
        prompt,
        max_new_tokens=200,
        temperature=0.3,
        do_sample=True
    )

    # Clean output (remove prompt part)
    output = response[0]["generated_text"]

    if "<|assistant|>" in output:
        output = output.split("<|assistant|>")[-1].strip()

    return output