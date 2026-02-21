import spacy
from typing import List

class MatchingService:
    def __init__(self):
        # Load a small English model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            # Fallback if model is not downloaded
            self.nlp = None

    def calculate_similarity(self, text1: str, text2: str) -> float:
        if not self.nlp:
            # Simple jaccard similarity fallback
            set1 = set(text1.lower().split())
            set2 = set(text2.lower().split())
            intersection = len(set1.intersection(set2))
            union = len(set1.union(set2))
            return intersection / union if union > 0 else 0.0
        
        doc1 = self.nlp(text1)
        doc2 = self.nlp(text2)
        return doc1.similarity(doc2)

    def rank_jobs_for_user(self, user_skills: str, jobs: List[dict]) -> List[dict]:
        """
        Rank a list of jobs based on similarity to user skills.
        Each job dict should have a 'description' field.
        """
        for job in jobs:
            job['relevance_score'] = self.calculate_similarity(user_skills, job.get('description', ''))
        
        # Sort by score descending
        return sorted(jobs, key=lambda x: x['relevance_score'], reverse=True)

matching_service = MatchingService()
