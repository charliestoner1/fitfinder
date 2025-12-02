"""
Smart recommendation engine for outfit suggestions.
Applies rules for color harmony, formality, and weather appropriateness.
"""

from .models import WardrobeItem, Recommendation
from typing import List, Tuple, Dict
import colorsys
import re

class RecommendationEngine:
    """Engine to generate smart outfit recommendations based on context."""
    
    # Color harmony rules - map colors to complementary colors
    COLOR_HARMONY = {
        'red': ['white', 'black', 'navy', 'grey'],
        'blue': ['white', 'beige', 'grey', 'navy'],
        'green': ['white', 'beige', 'grey', 'navy'],
        'yellow': ['white', 'navy', 'grey', 'black'],
        'black': ['white', 'grey', 'red', 'yellow'],
        'white': ['any'],
        'grey': ['any'],
        'beige': ['blue', 'green', 'brown', 'white'],
        'navy': ['white', 'red', 'beige', 'yellow'],
        'brown': ['beige', 'white', 'yellow', 'green'],
    }
    
    # Formality levels for clothing categories
    FORMALITY_LEVELS = {
        'Shoes': {
            'formal': ['dress shoes', 'heels', 'oxford', 'loafer'],
            'casual': ['sneakers', 'flip-flops', 'sandals', 'boat shoes'],
            'professional': ['loafers', 'oxfords', 'flats'],
        },
        'Tops': {
            'formal': ['blazer', 'dress shirt', 'tuxedo', 'gown'],
            'casual': ['t-shirt', 'hoodie', 'tank top', 'polo'],
            'professional': ['dress shirt', 'blouse', 'cardigan'],
        },
        'Bottoms': {
            'formal': ['dress pants', 'skirt', 'trousers'],
            'casual': ['jeans', 'shorts', 'joggers'],
            'professional': ['dress pants', 'pencil skirt', 'slacks'],
        },
        'Outerwear': {
            'formal': ['blazer', 'long coat', 'dress coat'],
            'casual': ['denim jacket', 'hoodie', 'windbreaker'],
            'professional': ['blazer', 'long coat'],
        },
    }
    
    # Weather appropriateness
    WEATHER_SEASONS = {
        'sunny': {'light': 2, 'breathable': 3},
        'cloudy': {'light': 1, 'standard': 2},
        'rainy': {'waterproof': 3, 'dark': 1},
        'snowy': {'heavy': 3, 'warm': 3},
        'hot': {'light': 3, 'breathable': 3},
        'cold': {'heavy': 3, 'warm': 3},
    }
    
    # Occasion categories mapped to formality
    OCCASION_TO_FORMALITY = {
        'casual': 'casual',
        'professional': 'professional',
        'formal': 'formal',
        'party': 'formal',
        'date': 'professional',
        'gym': 'casual',
        'outdoor': 'casual',
        'beach': 'casual',
    }
    
    @staticmethod
    def extract_color(item: WardrobeItem) -> str:
        """Extract dominant color from item name or tags."""
        name = item.name.lower() if item.name else ""
        tags = item.tags or {}
        
        # Check tags first
        if isinstance(tags, dict) and 'color' in tags:
            return tags['color'].lower()
        
        # Check item name
        colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'grey', 'beige', 'navy', 'brown']
        for color in colors:
            if color in name:
                return color
        
        return 'grey'  # Default to grey if no color found
    
    @staticmethod
    def extract_formality_hints(item: WardrobeItem) -> List[str]:
        """Extract formality indicators from item name and tags."""
        hints = []
        name = item.name.lower() if item.name else ""
        tags = item.tags or {}
        
        formal_keywords = ['blazer', 'dress', 'tie', 'tuxedo', 'heels', 'oxford', 'formal']
        casual_keywords = ['hoodie', 't-shirt', 'sneaker', 'jeans', 'casual', 'sport']
        
        for keyword in formal_keywords:
            if keyword in name:
                hints.append('formal')
        for keyword in casual_keywords:
            if keyword in name:
                hints.append('casual')
        
        if isinstance(tags, dict) and 'formality' in tags:
            hints.append(tags['formality'])
        
        return hints
    
    @staticmethod
    def color_compatibility_score(color1: str, color2: str) -> float:
        """Score how well two colors complement each other (0-1)."""
        if color1 in RecommendationEngine.COLOR_HARMONY:
            harmonies = RecommendationEngine.COLOR_HARMONY[color1]
            if 'any' in harmonies or color2 in harmonies:
                return 0.9
            elif color1 == color2:
                return 0.7
            else:
                return 0.4
        return 0.5
    
    @staticmethod
    def formality_match_score(item_formality: List[str], occasion_formality: str) -> float:
        """Score how well item matches occasion formality (0-1)."""
        if not item_formality:
            return 0.5  # Neutral if no formality hints
        
        if occasion_formality in item_formality:
            return 1.0
        elif 'formal' in item_formality and occasion_formality in ['professional', 'formal']:
            return 0.8
        elif 'casual' in item_formality and occasion_formality == 'casual':
            return 1.0
        elif 'professional' in item_formality and occasion_formality in ['professional', 'formal']:
            return 0.9
        else:
            return 0.3
    
    @staticmethod
    def generate_recommendation(
        user,
        weather: str,
        occasion: str,
        temperature: int = None,
    ) -> Tuple[List[WardrobeItem], float, str]:
        """
        Generate outfit recommendation based on context.
        Returns: (recommended_items, compatibility_score, explanation)
        """
        # Get user's wardrobe
        wardrobe = WardrobeItem.objects.filter(user=user)
        if not wardrobe.exists():
            return ([], 0, "No wardrobe items available for recommendations.")
        
        occasion_formality = RecommendationEngine.OCCASION_TO_FORMALITY.get(occasion, 'casual')
        
        # Score each item
        item_scores = {}
        for item in wardrobe:
            score = 0.0
            reasons = []
            
            # Check category appropriateness
            if item.category:
                score += 0.1  # Basic categorization score
                reasons.append(f"Includes {item.category}")
            
            # Check formality match
            formality_hints = RecommendationEngine.extract_formality_hints(item)
            formality_score = RecommendationEngine.formality_match_score(formality_hints, occasion_formality)
            score += formality_score * 0.4
            if formality_score > 0.5:
                reasons.append(f"Appropriate formality for {occasion}")
            
            # Check weather appropriateness
            item_color = RecommendationEngine.extract_color(item)
            item_name = item.name.lower() if item.name else ""
            
            # Penalize heavy items in sunny/hot weather
            heavy_keywords = ['coat', 'blazer', 'sweater', 'cardigan', 'hoodie', 'parka', 'leather jacket', 'denim jacket']
            is_heavy = any(keyword in item_name for keyword in heavy_keywords)
            
            if weather in ['sunny', 'hot'] and is_heavy:
                score -= 0.2  # Penalize heavy items for sunny/hot weather
            elif weather in ['sunny', 'hot'] and item.season in ['Summer', 'Spring']:
                score += 0.3
            elif weather in ['snowy', 'cold'] and (is_heavy or item.season in ['Winter', 'Fall']):
                score += 0.3
                reasons.append("Appropriate for cold weather")
            elif item.season == 'None' or item.season == '':
                score += 0.15  # Neutral season items get small bonus
                reasons.append("Season-neutral item")
            
            item_scores[item.id] = (item, score, reasons)
        
        # Select top items (aim for 3-5 pieces)
        sorted_items = sorted(item_scores.items(), key=lambda x: x[1][1], reverse=True)
        recommended_ids = [item_id for item_id, _ in sorted_items[:5]]
        recommended_items = [item_scores[item_id][0] for item_id in recommended_ids]
        
        # Calculate overall compatibility score
        avg_score = sum(item_scores[item_id][1] for item_id in recommended_ids) / len(recommended_ids) if recommended_ids else 0
        compatibility_score = min(100, avg_score * 100)
        
        # Generate explanation
        explanation_parts = [f"Recommended {len(recommended_items)} items for a {occasion} occasion in {weather} weather."]
        
        # Add color harmony note
        colors_used = [RecommendationEngine.extract_color(item) for item in recommended_items]
        if len(set(colors_used)) > 1:
            explanation_parts.append(f"Colors selected for harmony: {', '.join(set(colors_used))}.")
        
        # Add formality note
        explanation_parts.append(f"Selected items matching {occasion_formality} formality level.")
        
        # Add temperature note if provided
        if temperature:
            if temperature < 10:
                explanation_parts.append("Cold weather - prioritizing warm items.")
            elif temperature > 25:
                explanation_parts.append("Warm weather - prioritizing light, breathable items.")
        
        explanation = " ".join(explanation_parts)
        
        return (recommended_items, compatibility_score, explanation)
    
    @staticmethod
    def generate_multiple_recommendations(
        user,
        weather: str,
        occasion: str,
        temperature: int = None,
        count: int = 3,
    ) -> List[Tuple[List[WardrobeItem], float, str]]:
        """
        Generate multiple outfit recommendations (3 different combinations).
        Returns: List of (recommended_items, compatibility_score, explanation) tuples
        """
        # Get user's wardrobe
        wardrobe = list(WardrobeItem.objects.filter(user=user))
        if not wardrobe:
            return []
        
        occasion_formality = RecommendationEngine.OCCASION_TO_FORMALITY.get(occasion, 'casual')
        all_recommendations = []
        
        # Generate 'count' different recommendations
        for variant_num in range(count):
            # Score each item with slight randomization for variety
            item_scores = {}
            for item in wardrobe:
                score = 0.0
                
                # Check category appropriateness
                if item.category:
                    score += 0.1
                
                # Check formality match
                formality_hints = RecommendationEngine.extract_formality_hints(item)
                formality_score = RecommendationEngine.formality_match_score(formality_hints, occasion_formality)
                score += formality_score * 0.4
                
                # Check weather appropriateness
                item_name = item.name.lower() if item.name else ""
                heavy_keywords = ['coat', 'blazer', 'sweater', 'cardigan', 'hoodie', 'parka', 'leather jacket', 'denim jacket']
                is_heavy = any(keyword in item_name for keyword in heavy_keywords)
                
                if weather in ['sunny', 'hot'] and is_heavy:
                    score -= 0.2
                elif weather in ['sunny', 'hot'] and item.season in ['Summer', 'Spring']:
                    score += 0.3
                elif weather in ['snowy', 'cold'] and (is_heavy or item.season in ['Winter', 'Fall']):
                    score += 0.3
                elif item.season == 'None' or item.season == '':
                    score += 0.15
                
                # Add variant offset for diversity (later variants get slightly different scores)
                if variant_num > 0:
                    # Reduce scores of highly-ranked items to get different recommendations
                    score = score * (1.0 - (variant_num * 0.15))
                
                item_scores[item.id] = (item, score)
            
            # Select top items for this variant
            sorted_items = sorted(item_scores.items(), key=lambda x: x[1][1], reverse=True)
            recommended_ids = [item_id for item_id, _ in sorted_items[:5]]
            recommended_items = [item_scores[item_id][0] for item_id in recommended_ids]
            
            if not recommended_items:
                continue
            
            # Calculate compatibility score
            avg_score = sum(item_scores[item_id][1] for item_id in recommended_ids) / len(recommended_ids)
            compatibility_score = min(100, avg_score * 100)
            
            # Generate explanation
            explanation_parts = [f"Outfit Option {variant_num + 1}: {len(recommended_items)} items for a {occasion} occasion in {weather} weather."]
            colors_used = [RecommendationEngine.extract_color(item) for item in recommended_items]
            if len(set(colors_used)) > 1:
                explanation_parts.append(f"Colors selected for harmony: {', '.join(set(colors_used))}.")
            explanation_parts.append(f"Selected items matching {occasion_formality} formality level.")
            if temperature:
                if temperature < 10:
                    explanation_parts.append("Cold weather - prioritizing warm items.")
                elif temperature > 25:
                    explanation_parts.append("Warm weather - prioritizing light, breathable items.")
            
            explanation = " ".join(explanation_parts)
            all_recommendations.append((recommended_items, compatibility_score, explanation))
        
        return all_recommendations

