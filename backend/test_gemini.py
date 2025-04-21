import os
from dotenv import load_dotenv
import google.generativeai as genai
from ai.chatbot.intent_recognition import extract_entities, classify_intent

# Load environment variables
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GOOGLE_GENAI_API_KEY")
genai.configure(api_key=api_key)

def test_gemini_connection():
    """Test basic connection to Gemini API"""
    try:
        # List available models first to see what's available
        models = genai.list_models()
        print("Available models:")
        for model in models:
            print(f" - {model.name}")
        
        # Use the correct model name (likely "gemini-1.5-pro" or similar)
        model = genai.GenerativeModel('gemini-1.5-pro')  # Updated model name
        response = model.generate_content("Hello, are you working?")
        print("Gemini API Test Response:")
        print(response.text)
        print("\nAPI connection successful!")
        return True
    except Exception as e:
        print(f"Error connecting to Gemini API: {e}")
        return False

def test_intent_recognition():
    """Test the intent recognition function"""
    test_queries = [
        "Show me sales data for the last quarter",
        "What is the average revenue by region?",
        "Compare customer satisfaction scores between 2022 and 2023",
        "Predict next month's sales based on historical data"
    ]
    
    print("\nTesting Intent Recognition:")
    for query in test_queries:
        intent, confidence = classify_intent(query)
        print(f"Query: '{query}'")
        print(f"Intent: {intent}, Confidence: {confidence:.2f}")
        
        entities = extract_entities(query)
        print(f"Entities: {entities}\n")

if __name__ == "__main__":
    print("Testing Gemini API Integration")
    print("==============================")
    
    if test_gemini_connection():
        test_intent_recognition()
    else:
        print("Please check your API key and internet connection.")