/**
 * Build styles
 */
import { getLineStartPosition } from './utils/string';
import './index.css';
import 'prismjs/themes/prism.css';
import Prism from 'prismjs';

/**
 * CodeTool for Editor.js
 *
 * @author CodeX (team@ifmo.su)
 * @copyright CodeX 2018
 * @license MIT
 * @version 2.0.0
 */

/** global PasteEvent */

/**
 * Code Tool for the Editor.js allows to include code examples in your articles.
 */
export default class CodeTool {

  /**
   * Notify core that read-only mode is supported
   *
   * @returns {boolean}
   */
  static get isReadOnlySupported() {
    return true;
  }

  /**
   * Allow to press Enter inside the CodeTool textarea
   *
   * @returns {boolean}
   * @public
   */
  static get enableLineBreaks() {
    return true;
  }

  /**
   * @typedef {object} CodeData — plugin saved data
   * @property {string} code - previously saved plugin code
   * @property {string} selectedLanguage - previously saved plugin language selection
   */

  /**
   * Render plugin`s main Element and fill it with saved data
   *
   * @param {object} options - tool constricting options
   * @param {CodeData} options.data — previously saved plugin code
   * @param {object} options.config - user config for Tool
   * @param {object} options.api - Editor.js API
   * @param {boolean} options.readOnly - read only mode flag
   */
  constructor({ data, config, api, readOnly }) {
    this.api = api;
    this.readOnly = readOnly || false;

    this.placeholder = this.api.i18n.t(config.placeholder || CodeTool.DEFAULT_PLACEHOLDER);

    this.CSS = {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
        settingsButton: this.api.styles.settingsButton,
        settingsButtonActive: this.api.styles.settingsButtonActive,
      wrapper: 'ce-code',
      textarea: 'ce-code__textarea',
        code: 'ce-code__textarea',
        codeblock: 'ce-code__visublock',
        textvariant: 'cdx-text-variant__toggler',
        microlight: 'microlight',
    };

    this.viewImg ='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">' +
        '<path d=\"M569.354 231.631C512.969 135.949 407.81 72 288 72 168.14 72 63.004 135.994 6.646 231.' +
        '631a47.999 47.999 0 0 0 0 48.739C63.031 376.051 168.19 440 288 440c119.86 0 224.996-63.994 281.' +
        '354-159.631a47.997 47.997 0 0 0 0-48.738zM288 392c-75.162 0-136-60.827-136-136 0-75.162 60.826' +
        '-136 136-136 75.162 0 136 60.826 136 136 0 75.162-60.826 136-136 136zm104-136c0 57.438-46.562 ' +
        '104-104 104s-104-46.562-104-104c0-17.708 4.431-34.379 12.236-48.973l-.001.032c0 23.651 19.173 ' +
        '42.823 42.824 42.823s42.824-19.173 42.824-42.823c0-23.651-19.173-42.824-42.824-42.824l-.032.' +
        '001C253.621 156.431 270.292 152 288 152c57.438 0 104 46.562 104 104z"/></svg>' +
        '<!--Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com License - ' +
        'https://fontawesome.com/license (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)-->';
    this.editImg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">' +
        '<path d="M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485' +
        '.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 ' +
        '0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z"/></svg>' +
        '<!--Font Awesome Free 5.2.0 by @fontawesome - https://fontawesome.com License - ' +
        'https://fontawesome.com/license (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)-->';

    this.languages = {
      'language-markup': {'name':'html', 'prism': Prism.languages.markup},
      'language-java': {'name':'java', 'prism': Prism.languages.java},
      'language-javascript': {'name':'javascript', 'prism': Prism.languages.javascript},
      'language-cpp': {'name':'cpp', 'prism': Prism.languages.clike},
      'language-go': {'name':'go', 'prism': Prism.languages.go},
      'language-rust': {'name':'rust', 'prism': Prism.languages.rust},
      'language-python': {'name':'python', 'prism': Prism.languages.python},
      'language-php': {'name':'php', 'prism': Prism.languages.php},
      'language-bash': {'name':'bash', 'prism': Prism.languages.bash},
    };

    this.nodes = {
      holder: null,
      textarea: null,
        code: null,
        innerCode: null,
    };

    this.data = {
      code: data.code || '',
      selectedLanguage: data.selectedLanguage || 'language-markup', //default
    };

    this.nodes.holder = this.drawView();
  }

  /**
   * Create Tool's view
   *
   * @returns {HTMLElement}
   * @private
   */
  drawView() {
    const wrapper = document.createElement('div'),
        textarea = document.createElement('textarea'),
        pre = document.createElement('pre'),
      innerCode = document.createElement('code');
      pre.appendChild(innerCode);

    wrapper.classList.add(this.CSS.baseClass, this.CSS.wrapper);
    textarea.classList.add(this.CSS.textarea, this.CSS.input);
    textarea.textContent = this.data.code;
    textarea.placeholder = this.placeholder;

      innerCode.classList.add(this.CSS.code);
      innerCode.classList.add(this.CSS.input);
      innerCode.classList.add(this.CSS.codeblock);
      innerCode.classList.add('language-' + this.languages[this.data.selectedLanguage].name);

    if (this.readOnly) {
      textarea.disabled = true;
        textarea.classList.add('invisible');

    } else {
        pre.classList.add('invisible');
    }
      wrapper.appendChild(pre);
      wrapper.appendChild(textarea);

    /**
     * Enable keydown handlers
     */
    textarea.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'Tab':
          this.tabHandler(event);
          break;
      }
    });

    this.nodes.textarea = textarea;
    this.nodes.code = pre;
    this.nodes.innerCode = innerCode;
    return wrapper;
  }

    renderSettings() {
        const holder = document.createElement('div');
        holder.style.zIndex=200000;
        const modeSelectButton = document.createElement('span');
        modeSelectButton.addEventListener('click', () => {
          if (this.readOnly) {
                modeSelectButton.innerHTML = this.viewImg;
                this.readOnly = false;
                this.nodes.textarea.classList.remove('invisible');
                this.nodes.code.classList.add('invisible');
            } else {
              modeSelectButton.innerHTML = this.editImg;
              this.readOnly = true;
              this.nodes.textarea.classList.add('invisible');
              this.nodes.code.classList.remove('invisible');
              this.nodes.innerCode.classList.add('line-numbers');
            this.nodes.innerCode.innerHTML =
              Prism.highlight(this.nodes.textarea.value,
                this.languages[this.data.selectedLanguage].prism, this.languages[this.data.selectedLanguage].name);
            }
        });
        if (this.readOnly) {
            modeSelectButton.innerHTML = this.editImg;
        } else {
            modeSelectButton.innerHTML = this.viewImg;
        }
        modeSelectButton.classList.add(this.CSS.settingsButton);
        modeSelectButton.classList.add(this.CSS.input);
        modeSelectButton.classList.add(this.CSS.textvariant);

      const languageSelectMenu = document.createElement('select');
      const html = document.createElement('option');
      html.value = 'language-markup';
      html.innerText = 'Html/Xml/MathML';
      const java = document.createElement('option');
      java.value = 'language-java';
      java.innerText = 'Java';
      const javascript = document.createElement('option');
      javascript.value = 'language-javascript';
      javascript.innerText = 'Javascript';
      const go = document.createElement('option');
      go.value = 'language-go';
      go.innerText= 'Go';
      const cpp  = document.createElement('option');
      cpp.value = 'language-cpp';
      cpp.innerText = 'C/C++';
      const python = document.createElement('option');
      python.value = 'language-python';
      python.innerText = 'Python';
      const php = document.createElement('option');
      php.value = 'language-php';
      php.innerText = 'Php';
      const rust = document.createElement('option');
      rust.value = 'language-rust';
      rust.innerText = 'Rust';
      const bash = document.createElement('option');
      bash.value = 'language-bash';
      bash.innerText = 'Bash';
      languageSelectMenu.appendChild(html);
      languageSelectMenu.appendChild(java);
      languageSelectMenu.appendChild(javascript);
      languageSelectMenu.appendChild(go);
      languageSelectMenu.appendChild(cpp);
      languageSelectMenu.appendChild(python);
      languageSelectMenu.appendChild(php);
      languageSelectMenu.appendChild(rust);
      languageSelectMenu.appendChild(bash);
      languageSelectMenu.value = this.data.selectedLanguage;
      languageSelectMenu.addEventListener('change', () => {
        this.nodes.innerCode.classList.remove('language-' + this.languages[this.data.selectedLanguage].name);
        this.data.selectedLanguage = languageSelectMenu.value;
        this.nodes.innerCode.innerHTML =
          Prism.highlight(this.nodes.textarea.value,
            this.languages[this.data.selectedLanguage].prism, this.languages[this.data.selectedLanguage].name);
        this.nodes.innerCode.classList.add('language-' + this.languages[this.data.selectedLanguage].name);
        this.nodes.innerCode.style.zIndex=0;
      });
      holder.appendChild(languageSelectMenu);

        /**
         * Append settings button to holder
         */
        holder.appendChild(modeSelectButton);
        return holder;
    }
  /**
   * Return Tool's view
   *
   * @returns {HTMLDivElement} this.nodes.holder - Code's wrapper
   * @public
   */
  render() {
    return this.nodes.holder;
  }

  /**
   * Extract Tool's data from the view
   *
   * @param {HTMLDivElement} codeWrapper - CodeTool's wrapper, containing textarea with code
   * @returns {CodeData} - saved plugin code
   * @public
   */
  save(codeWrapper) {
    return {
      code: codeWrapper.querySelector('textarea').value,
      selectedLanguage: this.data.selectedLanguage,
    };
  }

  /**
   * onPaste callback fired from Editor`s core
   *
   * @param {PasteEvent} event - event with pasted content
   */
  onPaste(event) {
    const content = event.detail.data;

    this.data = {
      code: content.textContent,
    };
  }

  /**
   * Returns Tool`s data from private property
   *
   * @returns {CodeData}
   */
  get data() {
    return this._data;
  }

  /**
   * Set Tool`s data to private property and update view
   *
   * @param {CodeData} data - saved tool data
   */
  set data(data) {
    this._data = data;

    if (this.nodes.textarea) {
      this.nodes.textarea.textContent = data.code;
      this.nodes.code.innerHTML = data.code;
    }
  }

  /**
   * Get Tool toolbox settings
   * icon - Tool icon's SVG
   * title - title to show in toolbox
   *
   * @returns {{icon: string, title: string}}
   */
  static get toolbox() {
    return {
      icon: '<svg width="14" height="14" viewBox="0 -1 14 14" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M3.177 6.852c.205.253.347.572.427.954.078.372.117.844.117 1.417 0 .418.01.725.03.92.02.18.057.314' +
        '.107.396.046.075.093.117.14.134.075.027.218.056.42.083a.855.855 0 0 1 .56.297c.145.167.215.38.215.636 0 ' +
        '.612-.432.934-1.216.934-.457 0-.87-.087-1.233-.262a1.995 1.995 0 0 1-.853-.751 2.09 2.09 0 0 1-.305-1.097c' +
        '-.014-.648-.029-1.168-.043-1.56-.013-.383-.034-.631-.06-.733-.064-.263-.158-.455-.276-.578a2.163 2.163 0 0 ' +
        '0-.505-.376c-.238-.134-.41-.256-.519-.371C.058 6.76 0 6.567 0 6.315c0-.37.166-.657.493-.846.329-.186.56-.' +
        '342.693-.466a.942.942 0 0 0 .26-.447c.056-.2.088-.42.097-.658.01-.25.024-.85.043-1.802.015-.629.239-1.14.' +
        '672-1.522C2.691.19 3.268 0 3.977 0c.783 0 1.216.317 1.216.921 0 .264-.069.48-.211.643a.858.858 0 0 1-.563.2' +
        '9c-.249.03-.417.076-.498.126-.062.04-.112.134-.139.291-.031.187-.052.562-.061 1.119a8.828 8.828 0 0 1-.112 ' +
        '1.378 2.24 2.24 0 0 1-.404.963c-.159.212-.373.406-.64.583.25.163.454.342.612.538zm7.34 0c.157-.196.362-.375' +
        '.612-.538a2.544 2.544 0 0 1-.641-.583 2.24 2.24 0 0 1-.404-.963 8.828 8.828 0 0 1-.112-1.378c-.009-.557-.03-' +
        '.932-.061-1.119-.027-.157-.077-.251-.14-.29-.08-.051-.248-.096-.496-.127a.858.858 0 0 1-.564-.29C8.57 1.401 ' +
        '8.5 1.185 8.5.921 8.5.317 8.933 0 9.716 0c.71 0 1.286.19 1.72.574.432.382.656.893.671 1.522.02.952.033 1.553' +
        '.043 1.802.009.238.041.458.097.658a.942.942 0 0 0 .26.447c.133.124.364.28.693.466a.926.926 0 0 1 .493.846c0' +
        ' .252-.058.446-.183.58-.109.115-.281.237-.52.371-.21.118-.377.244-.504.376-.118.123-.212.315-.277.578-.025.' +
        '102-.045.35-.06.733-.013.392-.027.912-.042 1.56a2.09 2.09 0 0 1-.305 1.097c-.2.323-.486.574-.853.75a2.811 ' +
        '2.811 0 0 1-1.233.263c-.784 0-1.216-.322-1.216-.934 0-.256.07-.47.214-.636a.855.855 0 0 1 .562-.297c.201-.' +
        '027.344-.056.418-.083.048-.017.096-.06.14-.134a.996.996 0 0 0 .107-.396c.02-.195.031-.502.031-.92 0-.573.039' +
        '-1.045.117-1.417.08-.382.222-.701.427-.954z"/></svg>',
      title: 'Code',
    };
  }

  /**
   * Default placeholder for CodeTool's textarea
   *
   * @public
   * @returns {string}
   */
  static get DEFAULT_PLACEHOLDER() {
    return 'Code ...';
  }

  /**
   *  Used by Editor.js paste handling API.
   *  Provides configuration to handle CODE tag.
   *
   * @static
   * @returns {{tags: string[]}}
   */
  static get pasteConfig() {
    return {
      tags: [ 'pre' ],
    };
  }

  /**
   * Automatic sanitize config
   *
   * @returns {{code: boolean}}
   */
  static get sanitize() {
    return {
      code: true, // Allow HTML tags
    };
  }

  /**
   * Handles Tab key pressing (adds/removes indentations)
   *
   * @private
   * @param {KeyboardEvent} event - keydown
   * @returns {void}
   */
  tabHandler(event) {
    /**
     * Prevent editor.js tab handler
     */
    event.stopPropagation();

    /**
     * Prevent native tab behaviour
     */
    event.preventDefault();

    const textarea = event.target;
    const isShiftPressed = event.shiftKey;
    const caretPosition = textarea.selectionStart;
    const value = textarea.value;
    const indentation = '  ';

    let newCaretPosition;

    /**
     * For Tab pressing, just add an indentation to the caret position
     */
    if (!isShiftPressed) {
      newCaretPosition = caretPosition + indentation.length;

      textarea.value = value.substring(0, caretPosition) + indentation + value.substring(caretPosition);
    } else {
      /**
       * For Shift+Tab pressing, remove an indentation from the start of line
       */
      const currentLineStart = getLineStartPosition(value, caretPosition);
      const firstLineChars = value.substr(currentLineStart, indentation.length);

      if (firstLineChars !== indentation) {
        return;
      }

      /**
       * Trim the first two chars from the start of line
       */
      textarea.value = value.substring(0, currentLineStart) + value.substring(currentLineStart + indentation.length);
      newCaretPosition = caretPosition - indentation.length;
    }

    /**
     * Restore the caret
     */
    textarea.setSelectionRange(newCaretPosition, newCaretPosition);
  }
}
