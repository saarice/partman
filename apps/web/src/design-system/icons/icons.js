/**
 * Icon System JavaScript Utilities
 * Provides helper functions for using the SVG icon system
 */

/**
 * Creates an SVG icon element
 * @param {string} iconName - The icon name (without 'icon-' prefix)
 * @param {Object} options - Configuration options
 * @param {string} options.size - Icon size class (xs, sm, md, lg, xl, 2xl)
 * @param {string} options.color - Icon color class (primary, secondary, success, warning, error, info, neutral, muted)
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.title - Accessible title for the icon
 * @param {boolean} options.decorative - Whether the icon is decorative (hides from screen readers)
 * @returns {HTMLElement} The created SVG element
 */
function createIcon(iconName, options = {}) {
  const {
    size = 'md',
    color,
    className = '',
    title,
    decorative = false
  } = options;

  // Create the SVG element
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  // Build CSS classes
  const classes = ['icon'];
  if (size) classes.push(`icon--${size}`);
  if (color) classes.push(`icon--${color}`);
  if (className) classes.push(className);

  svg.setAttribute('class', classes.join(' '));
  svg.setAttribute('aria-hidden', decorative ? 'true' : 'false');

  if (title && !decorative) {
    svg.setAttribute('aria-label', title);
    svg.setAttribute('role', 'img');
  }

  // Create the use element
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#icon-${iconName}`);

  svg.appendChild(use);
  return svg;
}

/**
 * Creates an icon button element
 * @param {string} iconName - The icon name
 * @param {Object} options - Configuration options
 * @param {string} options.size - Button size (sm, md, lg)
 * @param {string} options.variant - Button variant (primary, secondary, destructive)
 * @param {string} options.className - Additional CSS classes
 * @param {string} options.ariaLabel - Accessible label for the button
 * @param {Function} options.onClick - Click handler function
 * @returns {HTMLElement} The created button element
 */
function createIconButton(iconName, options = {}) {
  const {
    size = 'md',
    variant,
    className = '',
    ariaLabel,
    onClick
  } = options;

  const button = document.createElement('button');

  // Build CSS classes
  const classes = ['icon-button'];
  if (size) classes.push(`icon-button--${size}`);
  if (variant) classes.push(`icon-button--${variant}`);
  if (className) classes.push(className);

  button.setAttribute('class', classes.join(' '));
  button.setAttribute('type', 'button');

  if (ariaLabel) {
    button.setAttribute('aria-label', ariaLabel);
  }

  // Add the icon
  const icon = createIcon(iconName, { decorative: true });
  button.appendChild(icon);

  // Add click handler
  if (onClick && typeof onClick === 'function') {
    button.addEventListener('click', onClick);
  }

  return button;
}

/**
 * Creates a status indicator with icon
 * @param {string} status - Status type (success, warning, error, info)
 * @param {string} text - Status text
 * @param {Object} options - Configuration options
 * @returns {HTMLElement} The created status indicator element
 */
function createStatusIndicator(status, text, options = {}) {
  const { className = '' } = options;

  const container = document.createElement('div');
  const classes = ['status-indicator', `status-indicator--${status}`];
  if (className) classes.push(className);
  container.setAttribute('class', classes.join(' '));

  // Icon mapping for status types
  const iconMap = {
    success: 'check-circle',
    warning: 'alert-circle',
    error: 'x-circle',
    info: 'info'
  };

  const icon = createIcon(iconMap[status] || 'info', {
    size: 'sm',
    decorative: true
  });

  const textSpan = document.createElement('span');
  textSpan.textContent = text;

  container.appendChild(icon);
  container.appendChild(textSpan);

  return container;
}

/**
 * Replaces emoji icons in the DOM with SVG icons
 * @param {Element} container - Container element to search within (defaults to document.body)
 */
function replaceEmojiIcons(container = document.body) {
  // Mapping of emoji to icon names
  const emojiToIcon = {
    '🏠': 'home',
    '📊': 'dashboard',
    '👥': 'users',
    '👤': 'user',
    '💼': 'briefcase',
    '⚙️': 'settings',
    '➕': 'plus',
    '✏️': 'edit',
    '🗑️': 'trash',
    '💾': 'save',
    '❌': 'x',
    '✅': 'check',
    '⚠️': 'alert-circle',
    '✔️': 'check-circle',
    '❎': 'x-circle',
    'ℹ️': 'info',
    '💰': 'dollar-sign',
    '📈': 'trending-up',
    '📊': 'bar-chart',
    '📧': 'mail',
    '📞': 'phone',
    '💬': 'message-circle',
    '📁': 'folder',
    '📄': 'file',
    '🔍': 'search',
    '🔽': 'chevron-down',
    '🔼': 'chevron-up',
    '◀️': 'chevron-left',
    '▶️': 'chevron-right',
    '🕒': 'clock',
    '📅': 'calendar'
  };

  // Find all text nodes and replace emoji
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }

  textNodes.forEach(textNode => {
    const parent = textNode.parentNode;
    if (!parent) return;

    const text = textNode.textContent;
    let hasReplacements = false;
    let newContent = text;

    // Replace each emoji with a placeholder
    Object.entries(emojiToIcon).forEach(([emoji, iconName]) => {
      if (text.includes(emoji)) {
        newContent = newContent.replace(new RegExp(emoji, 'g'), `[ICON:${iconName}]`);
        hasReplacements = true;
      }
    });

    if (hasReplacements) {
      // Split by icon placeholders and create elements
      const parts = newContent.split(/\[ICON:([^\]]+)\]/);
      const fragment = document.createDocumentFragment();

      for (let i = 0; i < parts.length; i++) {
        if (i % 2 === 0) {
          // Regular text
          if (parts[i]) {
            fragment.appendChild(document.createTextNode(parts[i]));
          }
        } else {
          // Icon placeholder
          const iconName = parts[i];
          const icon = createIcon(iconName, { decorative: true });
          fragment.appendChild(icon);
        }
      }

      parent.replaceChild(fragment, textNode);
    }
  });
}

/**
 * Initialize the icon system
 */
function initializeIcons() {
  // Ensure the icon sprite is loaded
  if (!document.querySelector('#partman-icon-sprite')) {
    fetch('/src/design-system/icons/icons.svg')
      .then(response => response.text())
      .then(svgContent => {
        const div = document.createElement('div');
        div.id = 'partman-icon-sprite';
        div.style.display = 'none';
        div.innerHTML = svgContent;
        document.body.insertBefore(div, document.body.firstChild);

        // Replace emoji icons after sprite is loaded
        replaceEmojiIcons();
      })
      .catch(error => {
        console.warn('Failed to load icon sprite:', error);
      });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeIcons);
} else {
  initializeIcons();
}

// Export functions for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createIcon,
    createIconButton,
    createStatusIndicator,
    replaceEmojiIcons,
    initializeIcons
  };
}

// Global availability
window.PartmanIcons = {
  createIcon,
  createIconButton,
  createStatusIndicator,
  replaceEmojiIcons,
  initializeIcons
};