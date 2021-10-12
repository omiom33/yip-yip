export const F_KEYCODE = 'KeyF';
export const ENTER_KEYCODE = 'Enter';
export const TAB_KEY = 'Tab';
export const BACKSPACE_KEY = 'Backspace';
export const ESCAPE_KEYCODE = 'Escape';

export const MAC_OS_PLATFORMS = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];

export const KEYS_VALID_FOR_FOCUS_REGEX = /^[a-zA-Z0-9-_/]$/i;
export const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const YIPYIP_ROOT_ID = 'yipyip-root'
export const YIPYIP_HIGHLIGHT_CLASS = 'yipyip-highlight';
export const YIPYIP_FOLLOWING_HIGHLIGHT_CLASS = 'yipyip-following-highlight';

export const DISCORD_INVITE_LINK = 'https://discord.gg/CnaC38Ch2p';
export const COMAKE_LANDING_PAGE_LINK = 'https://comake.io';
export const GITHUB_REPO_LINK = 'https://github.com/comake/yip-yip';
export const TWITTER_LINK = "https://twitter.com/intent/tweet?text=Loving%20%40comake_io's%20YipYip%20Extension!";
export const YIPYIP_FAQS_LINK = 'https://www.yip-yip.com/#FAQs';
export const YIPYIP_WELCOME_LINK = 'https://www.yip-yip.com/welcome';
export const TYPEFORM_FEEDBACK_LINK = 'https://comake1.typeform.com/to/auw8nYZg';

export const YIPYIP_CONTAINER_HEIGHT = 50;
export const YIPYIP_CONTAINER_WIDTH = 300;
export const YIPYIP_CONTAINER_DEFAULT_EDGE_MARGIN = 10;

export const INPUT_NODE_TYPES = ['INPUT', 'TEXTAREA', 'SELECT'];
export const LINK_OR_BUTTON_OR_INPUT_TYPES = ['BUTTON', 'A', 'LINK', 'INPUT', 'TEXTAREA', 'SELECT'];
export const LINK_OR_BUTTON_ROLE_VALUES = ['link', 'button', 'checkbox', 'tab'];
export const DO_NOT_SEARCH_NODE_TYPES = ['SCRIPT', 'STYLE'];

export const FIELD_BOOSTS = {
  innerText: 1,
  attribute: 0.9
}

export const SEARCH_TERM_BOOSTS = {
  searchText: 1,
  synonym: 0.9
}

export const IS_VISIBLE_BOOST = 1.1;
export const STARTS_WITH_BOOST = 1.5;
export const RELEVANT_WORD_BOOST = 1.5;
export const RELEVANT_SELECTOR_BOOST = 1.6;

export const SETTINGS_KEYS = {
  AUTO_HIDE: 'autoHide',
  USE_ON_EVERY_WEBSITE: 'useOnEveryWebsite',
  USER_EMAIL: 'userEmail'
};
