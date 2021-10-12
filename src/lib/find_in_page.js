import { YIPYIP_ROOT_ID, DO_NOT_SEARCH_NODE_TYPES } from "../constants.js";

import AppSpecificSettings from './app_specific_settings.js';
import Synonyms from './synonyms.js';
import NodeScorer from './node_scorer.js';
import HiddenAttributeSettings from './hidden_attribute_settings.js';

class FindInPage {
  constructor(searchText) {
    this.searchText = searchText.toLowerCase().trim();
    const domain = window.location.host;
    const appSpecificSettings = AppSpecificSettings.getSettingsForDomain(domain)
    const appSpecificSynonyms = Synonyms.mergeMutualSynonymsIntoDirected(appSpecificSettings.synonyms || {});
    const appSpecificRelevantWords = appSpecificSettings.relevant_words || [];
    const appSpecificRelevantSelectors = appSpecificSettings.relevant_selectors || [];
    const appSpecificAdditionalButtonSelectors = appSpecificSettings.additional_button_selectors || []

    this.nodeScorer = new NodeScorer(this.searchText, appSpecificSynonyms, appSpecificRelevantWords, appSpecificRelevantSelectors);
    this.hiddenAttributeSettings = new HiddenAttributeSettings(appSpecificAdditionalButtonSelectors);
    this.nodesWithHiddenAttributesQuerySelector = this.hiddenAttributeSettings.hiddenAttributeSettingsByNodeNameToQuerySelector();
  }

  findMatches() {
    if (this.searchText.length > 1) {
      const matchingNodes = this.findMatchesInNode(document.body);
      const matchingLinksAndButtons = matchingNodes.filter(node => this.hiddenAttributeSettings.isLinkOrButtonOrInput(node));
      const bestMatchingLinkOrButtonIndex = this.findIndexOfBestMatchingNode(matchingLinksAndButtons);
      return { matchingNodes, matchingLinksAndButtons, bestMatchingLinkOrButtonIndex }
    } else {
      return { matchingNodes: [], matchingLinksAndButtons: [], bestMatchingLinkOrButtonIndex: null }
    }
  }

  findMatchesInNode(node, parentNode=null, matches=[]) {
    if (!this.canSearchNode(node)) { return matches }

    if (node.nodeType === Node.TEXT_NODE && parentNode && !matches.some(match => match === parentNode)) {
      matches.push(parentNode);
    } else if (node.nodeType === Node.ELEMENT_NODE && this.isVisible(node)) {
      matches.concat(this.findMatchesInElement(node, parentNode, matches));
    }

    return matches
  }

  findMatchesInElement(element, parentNode=null, matches=[]) {
    const matchesSearch = this.nodeScorer.nodeMatches(element)
    const elementHasChildren = element.childNodes && element.childNodes.length > 0;
    const searchableChildren = element.querySelectorAll(this.nodesWithHiddenAttributesQuerySelector);
    if (matchesSearch && (!elementHasChildren || this.hiddenAttributeSettings.isLinkOrButtonOrInput(element))) {
      matches.push(element);
    } else if (matchesSearch) {
      [...element.childNodes].forEach(childNode => {
        this.findMatchesInNode(childNode, element, matches)
      })
    } else if (searchableChildren.length > 0) {
      [...searchableChildren].forEach(childNode => {
        this.findMatchesInNode(childNode, parentNode, matches)
      })
    }

    return matches
  }

  findIndexOfBestMatchingNode(nodes) {
    if (nodes.length > 0) {
      const sortedMatchesWithIndex = nodes
        .map((node, index) => ({ node, index, score: this.nodeScorer.scoreNode(node) }))
        .sort((a, b) => b.score - a.score);

      return sortedMatchesWithIndex[0].index;
    } else {
      return 0;
    }
  }

  canSearchNode(node) {
    return !DO_NOT_SEARCH_NODE_TYPES.includes(node.nodeName) && node.id !== YIPYIP_ROOT_ID
  }

  isVisible(node) {
    const computedStyle = window.getComputedStyle(node);
    return !!(node.offsetWidth || node.offsetHeight || node.getClientRects().length || computedStyle.display === 'contents') &&
      computedStyle.visibility !== "hidden" && computedStyle.opacity !== '0'
  }
}

export default FindInPage;
