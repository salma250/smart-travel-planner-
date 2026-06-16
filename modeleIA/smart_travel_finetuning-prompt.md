

### PROMPT 1: To Generate the Jupyter Notebook

*Copy and paste this prompt into your code-generation AI (like ChatGPT or Claude) to get your complete notebook code (`smart_travel_finetuning.ipynb`).*

```markdown
Act as an expert Machine Learning Engineer specializing in NLP and LLM fine-tuning. Generate a complete Python Jupyter Notebook named `smart_travel_finetuning.ipynb` to fine-tune the *Gemma-2-2b-it* model using *QLoRA* for a Smart Travel Assistant application.

### Project & Dataset Context:
- **Application:** Smart Travel Assistant.
- **Core Task:** The model accepts travel queries in French or Moroccan Darija text and generates a structured JSON object containing complete itinerary details.
- **Output Schema Constraint:** The generated JSON must strictly align with the frontend's expected format: a list of `days`, each containing a `date` and an array of `activities` (with fields: `id`, `time`, `title`, `location`, `description`, `durationMinutes`).
- **Dataset Source:** The notebook should programmatically download an appropriate Moroccan Darija / French conversational dataset directly from Hugging Face Hub (use a placeholder HF dataset path like `BounharAdnane/Darija-Conversational` or similar, which can be easily swapped, and include code to map it into prompt-completion pairs).

### Environment Context:
- **Platform:** VS Code utilizing a Google Colab Kernel.
- **Hardware:** 15GB VRAM (T4/L4 GPU), 12GB System RAM, 70GB Disk.
- **Library Requirements:** transformers, peft, bitsandbytes, datasets, trl, accelerate, huggingface_hub, matplotlib.

### Detailed Notebook Structure per Cell:

1. **📦 Cell 1 — Library Installation:**
   - Install all required libraries efficiently and quietly (`!pip install -q transformers torch accelerate bitsandbytes huggingface_hub datasets peft trl matplotlib`).

2. **🔑 Cell 2 — Hugging Face Programmatic Login:**
   - Use `huggingface_hub` to log in programmatically using this specific project token: `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`.

3. **📥 Cell 3 — Model & Tokenizer Loading:**
   - Load `google/gemma-2-2b-it` using 4-bit quantization (`BitsAndBytesConfig`) to preserve VRAM.
   - Configure the tokenizer and set `eos_token` as `pad_token`.

4. **⚙️ Cell 4 — Dataset Download & Formatting:**
   - Download the conversational dataset directly from Hugging Face using the `datasets` library.
   - Format the data using Gemma 2's chat template. The user instruction represents travel queries in French/Darija, and the target assistant response is the cleanly structured JSON itinerary object.

5. **✂️ Cell 5 — Data Splitting:**
   - Split the processed dataset into 80% Training, 10% Validation, and 10% Test.

6. **🚀 Cell 6 — Training Configuration with Early Stopping:**
   - Setup LoRA parameters: Target all linear layers, Rank $r=16$, Alpha $=32$, Dropout $=0.05$.
   - Import `EarlyStoppingCallback` from `transformers`. Configure it to monitor `val_loss` and stop training if the validation loss does not improve for 1 consecutive evaluation check (patience=1).
   - Instantiate `SFTTrainer` with these specific hyperparameters: `learning_rate=2e-4`, `batch_size=4`, `gradient_accumulation_steps=4`, `epochs=5` (increased to allow early stopping to trigger), `evaluation_strategy="steps"`, `eval_steps=50`, `save_steps=50`, `load_best_model_at_end=True`, and `fp16=True`.

7. **📊 Cell 7 — Evaluation & Loss Curves Visualization:**
   - Evaluate model metrics on the 10% Test split.
   - Calculate and print the final evaluation loss and Perplexity ($PPL = \exp(\text{loss})$).
   - Generate and display Training vs. Validation Loss curves over training steps using Matplotlib.

8. **🧪 Cell 8 — Format Sanity Check Inference:**
   - Create a test function that passes a sample Moroccan Darija or French travel prompt to the fine-tuned model.
   - Use `json.loads()` on the output to explicitly verify that it returns a valid, uncorrupted JSON payload matching your application backend requirements.

Please deliver this entire script structured into separate, cleanly documented Python cell code blocks.

```

---

### PROMPT 2: For GitHub Copilot / Execution Agent

*Once you open your generated notebook file inside VS Code, paste this prompt into GitHub Copilot Chat or your AI agent to handle the automation, self-healing, and decision-making report.*

```markdown
Act as an autonomous MLOps Execution Agent. Your task is to run the provided Jupyter Notebook (`smart_travel_finetuning.ipynb`) cell by cell within this environment, monitoring its performance, handling self-healing, and providing a strategic post-training deployment report.

### Strict Execution Framework:
1. **Cell-by-Cell Processing:** Execute exactly one cell at a time. Do not attempt to run multiple cells simultaneously or skip ahead.
2. **Error Monitoring & Self-Correction:**
   - If a cell executes successfully, log a success message and proceed to the next cell.
   - If a runtime error occurs (e.g., missing dependencies, package version mismatches, syntax issues, or mapping bugs during dataset formatting), pause immediately.
   - Analyze the precise exception traceback, fix the code logic inside that specific cell, and re-run the updated cell. Do not move forward until the cell passes flawlessly.
3. **Memory Management (OOM Fallback):** If you encounter a CUDA Out Of Memory (OOM) error during the training loop cell, adjust the training hyperparameters reactively. Reduce `batch_size` to 2 or 1, and scale up `gradient_accumulation_steps` proportionally to maintain the intended effective batch size.

### Post-Execution Technical Report & Next-Steps Decision:
Once all cells (including training, early stopping, and evaluation) complete execution successfully, compile a comprehensive **Fine-Tuning Execution Report** containing:

- **Execution Summary:** Total execution runtime and a log of any errors or OOM bugs you caught and self-healed during the run.
- **Training Analytics:** Final recorded training loss vs. validation loss. Confirm if the `EarlyStoppingCallback` was triggered, at which step it stopped, and whether the loss successfully converged.
- **Model Performance:** The final validation/test Loss and Perplexity score ($PPL$).
- **JSON Validation Test:** Display the inference result using a French or Moroccan Darija travel query, demonstrating that the output parses perfectly into the target JSON itinerary structure.
- **Strategic Next-Step Decision:** Provide a clear engineering recommendation on what to do next based on the performance scores:
  - **Option A (Deploy):** If the loss is low, perplexity is optimal, and JSON syntax is 100% valid, state that the model is ready to be exposed to the Next.js API endpoints (`/api/chat/message`).
  - **Option B (Re-train / Adjust data):** If Early Stopping triggered too early or the JSON output is broken/hallucinated, recommend specific hyperparameter adjustments (e.g., modifying the learning rate, updating the prompt formatting layout, or expanding the Darija dataset size).

Initiate execution of Cell 1 now.

```