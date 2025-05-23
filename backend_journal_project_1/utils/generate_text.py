import cohere
import os

from dotenv import load_dotenv
load_dotenv()

# You must set your API key as an environment variable or paste it directly (not recommended)
co = cohere.Client(os.getenv("CO_API_KEY")) # or cohere.Client("your-api-key")

def generate_summary_and_insights(transcript):
    prompt = f"""You are an expert summarizer trained to deeply understand human emotions and daily experiences. Each day, a user records a personal video journal, candidly reflecting on their thoughts, feelings, and events. These journals are personal, emotional, and often nuanced. Your task is to:
1. Generate a concise summary (3-5 lines) of the user's day in past tense.
2. Write **three short emotional insights** that each begin with "You", highlighting feelings, lessons, or meaningful moments from the day.

Transcript:
{transcript}

Respond in this format:
Summary:
- ...
- ...

Insights:
- ...
- ...
- ...
"""
    response = co.generate(
        model='command',  # or 'command' depending on your account
        prompt=prompt,
        max_tokens=300,
        temperature=0.5,
    )

    # Split output into summary and insights
    output = response.generations[0].text.strip()
    try:
        summary_part = output.split("Insights:")[0].replace("Summary:", "").strip()
        insights_part = output.split("Insights:")[1].strip()
    except:
        summary_part = output
        insights_part = "Could not extract insights."

    return summary_part, insights_part
