import re
import spacy
from typing import List, Tuple, Set
import math
from collections import Counter

# Load spacy model (assuming it's installed as per requirements)
try:
    nlp = spacy.load("en_core_web_sm")
except:
    # Fallback if model not downloaded
    nlp = None

class AIProcessor:
    def __init__(self):
        # Common skills list for fallback/enrichment
        self.common_skills = {
            "python", "javascript", "react", "node.js", "sql", "java", "c++", "aws", "docker", "kubernetes",
            "html", "css", "git", "linux", "tableau", "power bi", "excel", "machine learning", "ai",
            "driving", "carpentry", "plumbing", "electrical", "welding", "cooking", "cleaning", "delivery"
        }

    def extract_skills(self, text: str) -> List[str]:
        """
        Extract skills using NLP and keyword matching.
        """
        if not text:
            return []
            
        text_lower = text.lower()
        extracted = set()

        # 1. Simple Keyword Matching
        for skill in self.common_skills:
            if re.search(rf'\b{re.escape(skill)}\b', text_lower):
                extracted.add(skill.title())

        # 2. NLP Named Entity Recognition (NER) and Part-of-Speech (POS) enrichment
        if nlp:
            doc = nlp(text)
            for token in doc:
                # Look for Proper Nouns or Nouns that might be technical terms
                if token.pos_ in ["PROPN", "NOUN"] and len(token.text) > 1:
                    # Very basic filter: if it's capitalized in original or looks like code term
                    if token.text[0].isupper() or any(c in token.text for c in ['+', '#', '.']):
                        extracted.add(token.text.title())

        return list(extracted)

    def extract_experience(self, text: str) -> int:
        """
        Extract experience years from text.
        Ex: "Need 2 years experience" -> 2
        """
        if not text:
            return 0
            
        # Look for patterns like "X years", "X yrs", "X+ years"
        patterns = [
            r'(\d+)\s*(?:years?|yrs?)\b',
            r'experience\s*(?:of|is)\s*(\d+)',
            r'(\d+)\+\s*years?'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 0

    def calculate_match_score(self, resume_text: str, job_description: str) -> float:
        """
        Calculate cosine similarity between resume and job description.
        Returns 0.0 to 100.0
        """
        if not resume_text or not job_description:
            return 0.0

        def get_vectors(text1, text2):
            words = re.findall(r'\w+', text1.lower() + " " + text2.lower())
            all_words = set(words)
            
            v1 = Counter(re.findall(r'\w+', text1.lower()))
            v2 = Counter(re.findall(r'\w+', text2.lower()))
            
            return v1, v2, all_words

        v1, v2, all_words = get_vectors(resume_text, job_description)
        
        common = set(v1.keys()) & set(v2.keys())
        numerator = sum([v1[x] * v2[x] for x in common])
        
        sum1 = sum([v1[x]**2 for x in v1.keys()])
        sum2 = sum([v2[x]**2 for x in v2.keys()])
        denominator = math.sqrt(sum1) * math.sqrt(sum2)
        
        if not denominator:
            return 0.0
        else:
            return (float(numerator) / denominator) * 100

ai_processor = AIProcessor()
