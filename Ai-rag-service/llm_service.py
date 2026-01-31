
import requests
from typing import Optional, Generator
import json


# Ollama configuration
OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "mistral"


def check_ollama_health() -> bool:
    """
    Check if Ollama is running and accessible.
    
    Returns:
        True if Ollama is healthy, False otherwise
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        return response.status_code == 200
    except requests.exceptions.RequestException:
        return False


def list_available_models() -> list[str]:
    """
    List all models available in Ollama.
    
    Returns:
        List of model names
    """
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            return [model["name"] for model in data.get("models", [])]
        return []
    except requests.exceptions.RequestException:
        return []


def generate_response(
    prompt: str,
    model: str = DEFAULT_MODEL,
    system_prompt: Optional[str] = None,
    temperature: float = 0.1,
    max_tokens: int = 1024
) -> str:
    """
    Generate a response from the LLM.
    
    Args:
        prompt: The user prompt/question
        model: Ollama model name
        system_prompt: Optional system prompt for context
        temperature: Controls randomness (0.0 = deterministic, 1.0 = creative)
        max_tokens: Maximum tokens in response
        
    Returns:
        Generated response text
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens
        }
    }
    
    if system_prompt:
        payload["system"] = system_prompt
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            timeout=120
        )
        
        if response.status_code == 200:
            return response.json().get("response", "")
        else:
            raise Exception(f"Ollama error: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to connect to Ollama: {str(e)}")


def generate_response_stream(
    prompt: str,
    model: str = DEFAULT_MODEL,
    system_prompt: Optional[str] = None,
    temperature: float = 0.1,
    max_tokens: int = 1024
) -> Generator[str, None, None]:
    """
    Generate a streaming response from the LLM.
    
    Args:
        prompt: The user prompt/question
        model: Ollama model name
        system_prompt: Optional system prompt for context
        temperature: Controls randomness
        max_tokens: Maximum tokens in response
        
    Yields:
        Response text chunks
    """
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens
        }
    }
    
    if system_prompt:
        payload["system"] = system_prompt
    
    try:
        response = requests.post(
            f"{OLLAMA_BASE_URL}/api/generate",
            json=payload,
            stream=True,
            timeout=120
        )
        
        if response.status_code == 200:
            for line in response.iter_lines():
                if line:
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]
        else:
            raise Exception(f"Ollama error: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to connect to Ollama: {str(e)}")
