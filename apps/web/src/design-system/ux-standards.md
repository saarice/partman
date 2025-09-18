# 🎨 Platform UX Standards

## Right-Slide Modal System

### Overview
All modals across the platform now use a consistent right-slide animation system that provides a modern, mobile-friendly user experience.

### Key Principles
- **Slide from Right**: All modals slide in from the right side of the screen
- **Full Height**: Modals use the full viewport height for maximum content space
- **Smooth Animation**: 400ms cubic-bezier animation for premium feel
- **Backdrop Blur**: 6px blur effect on background content
- **Consistent Sizing**: Standardized width breakpoints for different content types

## Implementation

### HTML Structure
```html
<div class="modal" id="your-modal" style="display: none;">
  <div class="modal__container modal__container--medium">
    <div class="modal__header">
      <h2 class="modal__title">Modal Title</h2>
      <button class="modal__close" aria-label="Close modal">
        <svg class="icon"><use href="#icon-x"></use></svg>
      </button>
    </div>
    <div class="modal__body">
      <!-- Your content here -->
    </div>
    <div class="modal__footer">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Save</button>
    </div>
  </div>
</div>
```

### JavaScript Usage
```javascript
// Show modal
document.getElementById('your-modal').style.display = 'flex';

// Hide modal
document.getElementById('your-modal').style.display = 'none';
```

### Container Sizes
- `modal__container--small`: 450px max-width - Simple forms
- `modal__container--medium`: 600px max-width - Standard forms
- `modal__container--large`: 800px max-width - Detail views
- `modal__container--xlarge`: 1000px max-width - Complex workflows

## Mobile Behavior
- Full width on screens < 768px
- Maintains slide-from-right animation
- Optimized touch interactions
- Reduced padding for mobile screens

## Accessibility Features
- Proper ARIA labels
- Focus management
- Keyboard navigation (ESC to close)
- Screen reader support

## Files Updated
- `/src/design-system/components/modals.css` - Core modal system
- `/src/styles/opportunities-enterprise.css` - Page-specific overrides
- `opportunities-enterprise.html` - Updated structure
- `partnership-manager-enterprise.html` - Updated structure

## Migration Guide
### From Old Modal System
1. Replace `modal-overlay` class with `modal`
2. Replace inner `modal` class with `modal__container`
3. Add appropriate size modifier (`--medium`, `--large`, etc.)
4. Update JavaScript to use `style.display = 'flex'`

### Benefits
- ✅ Consistent user experience across platform
- ✅ Modern, premium animation feel
- ✅ Better mobile experience
- ✅ More screen real estate for content
- ✅ Improved accessibility
- ✅ Easier maintenance

## Future Enhancements
- Toast notifications integration
- Multi-step modal workflows
- Drawer variants for navigation
- Animation customization options