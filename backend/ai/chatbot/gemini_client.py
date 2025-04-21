import google.generativeai as genai
from google.api_core.exceptions import InvalidArgument
import os
from dotenv import load_dotenv

load_dotenv()

# Configure the Gemini API with your API key
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# Update to use the correct API version and model
def get_gemini_response(prompt, context=None):
    try:
        # Use the correct model name and API version
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        if context:
            response = model.generate_content([context, prompt])
        else:
            response = model.generate_content(prompt)
            
        return response.text
    except InvalidArgument as e:
        print(f"Gemini API error: {e}")
        # Fallback to a different model if available
        try:
            model = genai.GenerativeModel('gemini-1.0-pro')
            if context:
                response = model.generate_content([context, prompt])
            else:
                response = model.generate_content(prompt)
            return response.text
        except Exception as fallback_error:
            print(f"Fallback model error: {fallback_error}")
            return "I'm sorry, I encountered an error processing your request."
    except Exception as e:
        print(f"Gemini API error: {e}")
        return "I'm sorry, I encountered an error processing your request."