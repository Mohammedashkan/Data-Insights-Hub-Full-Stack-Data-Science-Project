from typing import Dict, Any, List, Tuple
import re
import numpy as np
import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure the Gemini API
genai.configure(api_key=os.getenv("GOOGLE_GENAI_API_KEY"))

# Set up the model
model = genai.GenerativeModel('gemini-pro')

def extract_entities(query: str) -> Dict[str, Any]:
    """
    Extract entities like column names, filters, and aggregations from a query
    """
    entities = {
        "columns": [],
        "filters": [],
        "aggregations": [],
        "time_range": None,
        "limit": None,
        "sort": None
    }
    
    # Extract column references
    column_pattern = r'(?:show|display|what is|what are|analyze|compare)(?:\s+the)?\s+([a-zA-Z0-9_\s,]+)(?:\s+from|\s+in|\s+of|\s+for|\s+by|\s+where|$)'
    column_matches = re.search(column_pattern, query, re.IGNORECASE)
    
    if column_matches:
        columns_text = column_matches.group(1)
        columns = [col.strip() for col in columns_text.split(',')]
        entities["columns"] = columns
    
    # Extract filters (where conditions)
    filter_pattern = r'where\s+([a-zA-Z0-9_]+)\s+(is|=|>|<|>=|<=|!=)\s+([a-zA-Z0-9_\s\'\"]+)'
    filter_matches = re.findall(filter_pattern, query, re.IGNORECASE)
    
    if filter_matches:
        for match in filter_matches:
            column, operator, value = match
            entities["filters"].append({
                "column": column.strip(),
                "operator": operator.strip(),
                "value": value.strip().strip('\'"')
            })
    
    # Extract aggregations
    agg_pattern = r'(average|avg|sum|total|count|min|max|mean|median)\s+(?:of|for)?\s+([a-zA-Z0-9_\s]+)'
    agg_matches = re.findall(agg_pattern, query, re.IGNORECASE)
    
    if agg_matches:
        for match in agg_matches:
            agg_func, column = match
            entities["aggregations"].append({
                "function": agg_func.lower(),
                "column": column.strip()
            })
    
    # Extract time range
    time_pattern = r'(?:from|between)\s+([a-zA-Z0-9_\s\-\/]+)\s+(?:to|and)\s+([a-zA-Z0-9_\s\-\/]+)'
    time_match = re.search(time_pattern, query, re.IGNORECASE)
    
    if time_match:
        start_date, end_date = time_match.groups()
        entities["time_range"] = {
            "start": start_date.strip(),
            "end": end_date.strip()
        }
    
    # Use Gemini to enhance entity extraction for complex queries
    if not any(entities.values()):
        try:
            prompt = f"""
            Extract structured information from this data query: "{query}"
            Return a JSON object with these fields:
            - columns: list of column names mentioned
            - filters: list of filter conditions (column, operator, value)
            - aggregations: list of aggregation functions and their columns
            - time_range: any time period mentioned
            - limit: any result limit mentioned
            - sort: any sorting criteria mentioned
            
            Format your response as valid JSON only, no explanations.
            """
            
            response = model.generate_content(prompt)
            
            # Try to parse the response as JSON
            import json
            try:
                gemini_entities = json.loads(response.text)
                # Merge with existing entities
                for key, value in gemini_entities.items():
                    if value and not entities[key]:
                        entities[key] = value
            except json.JSONDecodeError:
                # If JSON parsing fails, continue with regex results
                pass
                
        except Exception as e:
            # If Gemini API fails, continue with regex results
            print(f"Gemini API error: {e}")
    
    return entities

# Update the model name in the classify_intent function
def classify_intent(query: str) -> Tuple[str, float]:
    """
    Classify the intent of a data query using Gemini
    """
    intents = [
        "data_exploration", 
        "statistical_analysis",
        "trend_analysis",
        "comparison",
        "prediction",
        "anomaly_detection",
        "data_filtering",
        "data_aggregation"
    ]
    
    try:
        # Use the updated model name
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        prompt = f"""
        Classify this data query into exactly one of these categories:
        {', '.join(intents)}
        
        Query: "{query}"
        
        Return only the category name and a confidence score between 0 and 1, 
        formatted as: "category|confidence"
        """
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Parse the response
        if '|' in result_text:
            intent, confidence_str = result_text.split('|')
            intent = intent.strip()
            confidence = float(confidence_str.strip())
            
            # Validate the intent is in our list
            if intent in intents:
                return intent, confidence
        
        # Fallback to default if parsing fails
        return "data_exploration", 0.7
        
    except Exception as e:
        print(f"Gemini API error in intent classification: {e}")
        # Fallback to default
        return "data_exploration", 0.5