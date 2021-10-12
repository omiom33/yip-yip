import { FIELD_BOOSTS, SEARCH_TERM_BOOSTS, STARTS_WITH_BOOST, RELEVANT_WORD_BOOST,
  RELEVANT_SELECTOR_BOOST, IS_VISIBLE_BOOST
} from "../constants.js";

import Utils from "./utils.js";
import Synonyms from './synonyms.js';
import HiddenAttributeSettings from './hidden_attribute_settings.js';

const WHITESPACE_SPLIT_REGEX = /[(\s+)\-.,/\u200B-\u200D\uFEFF\u200E\u200F]+/;

class NodeScorer {
  constructor(searchText, appSpecificSynonyms, appSpecificRelevantWords, appSpecificRelevantSelectors) {
    this.searchText = searchText;
    this.synonyms = Synonyms.getSynonymsForTextFromSettings(searchText, appSpecificSynonyms);
    this.relevantWords = appSpecificRelevantWords;
    this.relevantSelectors = appSpecificRelevantSelectors;
  }

  scoreNode(node) {
    const innerText = Utils.getTextContentOfNode(node).slice().toLowerCase().trim();
    const attributeValues = this.getSearchableHiddenAttributeValuesForNodeType(node);
    return this.score(node, innerText, attributeValues)
  }

  nodeMatches(node) {
    const innerText = Utils.getTextContentOfNode(node).slice().toLowerCase().trim();
    const attributeValues = this.getSearchableHiddenAttributeValuesForNodeType(node);

    if (innerText && innerText.length > 0 && innerText.includes(this.searchText)) {
      return true
    }

    if (attributeValues.length > 0 && attributeValues.some(attributeValue => attributeValue.includes(this.searchText))) {
      return true
    }

    if (this.synonyms.length > 0) {
      if (innerText && innerText.length > 0 && this.synonyms.some(synonym => innerText.includes(synonym))) {
        return true
      }

      if (attributeValues.length > 0 && this.synonyms.some(synonym => attributeValues.some(attributeValue => attributeValue.includes(synonym)))) {
        return true
      }
    }

    return false
  }

  getSearchableHiddenAttributeValuesForNodeType(node) {
    const hiddenAttributesForNode = HiddenAttributeSettings.hiddenAttributesForNode(node);
    if (hiddenAttributesForNode) {
      return hiddenAttributesForNode
        .map(attributeName => node.getAttribute(attributeName))
        .filter(Boolean)
        .map(attributeValue => attributeValue.toLowerCase());
    } else {
      return []
    }
  }

  score(node, innerText, attributeValues) {
    let score = 0;

    const innerTextWords = this.getWordsFromText(innerText)
    if (innerText && innerText.length > 0) {
      score += this.fieldScore(innerText, innerTextWords, this.searchText, FIELD_BOOSTS.innerText, SEARCH_TERM_BOOSTS.searchText)
    }

    if (attributeValues.length > 0) {
      const highestAttributeScore = this.getHighestAttributeScore(attributeValues, this.searchText)
      if (highestAttributeScore > score) {
        score = highestAttributeScore;
      }
    }

    if (score === 0 && this.synonyms.length > 0) {
      if (innerText && innerText.length > 0) {
        score += this.getHighestSynonymScore(innerText, innerTextWords)
      }

      if (attributeValues.length > 0) {
        const highestSynonymAttributePairScore = this.getHighestSynonymAttributePairScore(attributeValues)
        if (highestSynonymAttributePairScore > score) {
          score = highestSynonymAttributePairScore;
        }
      }
    }

    if (score > 0) {
      if (this.relevantSelectors.some(selector => Utils.nodeMatchesSelector(node, selector))) {
        score = score * RELEVANT_SELECTOR_BOOST;
      }

      if (Utils.nodeIsInViewport(node)) {
        score = score * IS_VISIBLE_BOOST;
      }
    }

    return score
  }

  fieldScore(fieldText, fieldWords, queryText, fieldBoost=1, queryTermBoost=1) {
    let score = 0;

    if (!fieldText || fieldText.length === 0) { return 0 }

    if (fieldText.includes(queryText)) {
      score += fieldBoost * queryTermBoost;
    }

    if (score > 0) {
      const hasWordStartingWithQueryText = fieldWords.some(word => word.startsWith(queryText));
      if (hasWordStartingWithQueryText) {
        score = score * STARTS_WITH_BOOST
      }

      const relevantWord = this.relevantWords.find(word => word.includes(queryText) && fieldWords.includes(word))
      if (relevantWord) {
        score = score * RELEVANT_WORD_BOOST;
      }
    }

    return score;
  }

  getWordsFromText(text) {
    return text.split(WHITESPACE_SPLIT_REGEX);
  }

  getHighestAttributeScore(attributeTextValues, queryText, queryIsSynonym=false) {
    const attributeScores = attributeTextValues.map(attributeValue => {
      const attributeWords = this.getWordsFromText(attributeValue)
      return this.fieldScore(
        attributeValue,
        attributeWords,
        queryText,
        FIELD_BOOSTS.attribute,
        queryIsSynonym ? SEARCH_TERM_BOOSTS.synonym : SEARCH_TERM_BOOSTS.searchText
      )
    });
    return this.getHighestScore(attributeScores);
  }

  getHighestSynonymScore(innerText, innerTextWords) {
    const synonymScores = this.synonyms.map(synonym => {
      return this.fieldScore(
        innerText,
        innerTextWords,
        synonym,
        FIELD_BOOSTS.innerText,
        SEARCH_TERM_BOOSTS.synonym
      )
    });
    return this.getHighestScore(synonymScores);
  }

  getHighestSynonymAttributePairScore(attributeTextValues) {
    const synonymScores = this.synonyms.map(synonym => {
      return this.getHighestAttributeScore(attributeTextValues, synonym, true)
    });
    return this.getHighestScore(synonymScores);
  }

  getHighestScore(scores) {
    return scores.sort(Utils.compareDescending)[0];
  }
}

export default NodeScorer;
