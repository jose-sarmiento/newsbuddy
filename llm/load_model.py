# from huggingface_hub import hf_hub_download

# model_id = "facebook/bart-large-cnn"
# filenames = [
#     ".gitattributes", "README.md", "config.json", "flax_model.msgpack", "generation_config.json", "generation_config_for_summarization.json",
#     "merges.txt", "model.safetensors", "pytorch_model.bin", "rust_model.ot", "tf_model.h5", "tokenizer.json", "vocab.json"
# ]

# print(f"Downloading {model_id} llm")
# for filename in filenames:
#     res = hf_hub_download(repo_id=model_id, filename="config.json", cache_dir="./llm_model")
    

text = """WASHINGTON, USA – The Biden administration on Friday, May 10, said Israel’s use of United States-supplied weapons may have violated international humanitarian law during its military operation in Gaza, in its strongest criticism to date of Israel.

But the administration stopped short of a definitive assessment, saying that due to the chaos of the war in Gaza it could not verify specific instances where use of those weapons might have been involved in alleged breaches.

The assessment came in a 46-page unclassified State Department report to Congress required under a new National Security Memorandum (NSM) that President Joe Biden issued in early February.

The findings risk further souring ties with Israel at a time when the allies are increasingly at odds over Israel’s plans to strike Rafah, a move Washington has repeatedly warned against.

The Biden administration has already put a hold on one package of arms in a major policy shift and said the US was reviewing others even as it reiterated long-term support for Israel.

The State Department’s report included contradictions: It listed numerous credible reports of civilian harm and said Israel did not at first cooperate with Washington to boost humanitarian assistance to the enclave. But in each instance it said it could not make a definitive assessment whether any breaches of law had occurred.

“Given Israel’s significant reliance on US-made defense articles, it is reasonable to assess that defense articles covered under NSM-20 have been used by Israeli security forces since October 7 in instances inconsistent with its IHL obligations or with established best practices for mitigating civilian harm,” the State Department said in the report."""

from transformers import BartForConditionalGeneration, BartTokenizer, pipeline

model = BartForConditionalGeneration.from_pretrained("./llm_model/models--facebook--bart-large-cnn/snapshots/37f520fa929c961707657b28798b30c003dd100b/")
tokenizer = BartTokenizer.from_pretrained("./llm_model/models--facebook--bart-large-cnn/snapshots/37f520fa929c961707657b28798b30c003dd100b/")

summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)

def get_first_500_words(text):
    words = text.split()
    if len(words) > 500:
        first_500_words = ' '.join(words[:500])
        last_period_index = first_500_words.rfind('.')
        if last_period_index != -1:
            return first_500_words[:last_period_index + 1]
        else:
            return first_500_words
    else:
        return text
    
def split_text_into_chunks(text):
    words = text.split()
    num_chunks = len(words) // 500
    chunks = []

    for i in range(num_chunks):
        chunk_start = i * 500
        chunk_end = (i + 1) * 500
        chunk = ' '.join(words[chunk_start:chunk_end])
        chunks.append(chunk)

    # Check if there are remaining words after the last complete chunk
    remaining_words = words[num_chunks * 500:]
    if len(remaining_words) >= 50 or len(chunks) == 0:
        chunks.append(' '.join(remaining_words))

    return chunks
