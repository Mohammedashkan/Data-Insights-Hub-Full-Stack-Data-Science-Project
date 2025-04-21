import pandas as pd
import numpy as np
from typing import Dict, Any, List
import json

def generate_summary_statistics(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Generate basic summary statistics for a dataframe
    """
    # Numeric columns analysis
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    numeric_stats = {}
    
    for col in numeric_cols:
        numeric_stats[col] = {
            "mean": float(df[col].mean()),
            "median": float(df[col].median()),
            "std": float(df[col].std()),
            "min": float(df[col].min()),
            "max": float(df[col].max()),
            "missing": int(df[col].isna().sum()),
            "missing_percent": float(df[col].isna().mean() * 100)
        }
    
    # Categorical columns analysis
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    cat_stats = {}
    
    for col in cat_cols:
        value_counts = df[col].value_counts().head(10).to_dict()
        cat_stats[col] = {
            "unique_values": int(df[col].nunique()),
            "missing": int(df[col].isna().sum()),
            "missing_percent": float(df[col].isna().mean() * 100),
            "top_values": value_counts
        }
    
    # Overall dataset statistics
    overall_stats = {
        "rows": len(df),
        "columns": len(df.columns),
        "numeric_columns": len(numeric_cols),
        "categorical_columns": len(cat_cols),
        "memory_usage": df.memory_usage(deep=True).sum()
    }
    
    return {
        "overall": overall_stats,
        "numeric": numeric_stats,
        "categorical": cat_stats
    }

def detect_outliers(df: pd.DataFrame, method: str = "iqr") -> Dict[str, List[int]]:
    """
    Detect outliers in numeric columns using specified method
    """
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    outliers = {}
    
    for col in numeric_cols:
        if method == "iqr":
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            
            outlier_indices = df[(df[col] < lower_bound) | (df[col] > upper_bound)].index.tolist()
            outliers[col] = outlier_indices
    
    return outliers