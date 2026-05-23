# Implementation Plan: Merchant Benefits Section

## Overview

This implementation adds a new "Merchant Benefits" section to the existing LandingPage component. The section will display 6 merchant benefits in a responsive grid layout with hover effects, Bootstrap Icons, and full RTL support. The section will be added inline to the LandingPage component (not as a separate component) and placed after the "Why Haya" section and before the "Download" section.

## Tasks

- [x] 1. Add merchant benefits data structure to LandingPage component
  - Add `merchantBenefits` array property to the `LandingPage` class in `landing-page.ts`
  - Define the 6 benefit items with icon, title, and description as specified in requirements
  - Use Bootstrap Icon class names (e.g., 'bi-graph-up-arrow', 'bi-people', etc.)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]* 1.1 Write unit tests for merchant benefits data structure
  - Test that `merchantBenefits` array contains exactly 6 items
  - Test that each benefit has required properties (icon, title, desc)
  - Test that all benefit titles and descriptions match requirements
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 2. Add HTML section for merchant benefits
  - Add new `<section class="lp-merchant-benefits">` in `landing-page.html`
  - Place section after `lp-why` section and before `lp-download` section
  - Add section header with decorative sparkle (✦) and title "مزايا وحلول التجار"
  - Implement benefits grid using `@for` loop to iterate over `merchantBenefits` array
  - Add benefit cards with icon, title, and description structure
  - Use Bootstrap Icon classes with `[class]` binding for dynamic icons
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4_

- [ ]* 2.1 Write unit tests for HTML rendering
  - Test that section renders with correct class name
  - Test that section header displays correct title
  - Test that exactly 6 benefit cards are rendered
  - Test that each card displays icon, title, and description
  - Test that Bootstrap Icon classes are applied correctly
  - _Requirements: 1.1, 2.1, 3.1, 3.2, 3.3_

- [ ]* 2.2 Write snapshot tests for HTML structure
  - Create snapshot test for complete section markup
  - Verify section structure matches design specifications
  - _Requirements: 1.1, 2.1, 3.1_

- [ ] 3. Implement CSS styles for merchant benefits section
  - Add `.lp-merchant-benefits` section styles in `landing-page.css`
  - Follow BEM naming convention (`.lp-merchant-benefits__card`, `.lp-merchant-benefits__icon`, etc.)
  - Implement section header styles with sparkle and title
  - Add grid layout styles using CSS Grid (`.lp-merchant-benefits__grid`)
  - Style benefit cards with border, padding, and background
  - Implement hover effects (background color change, shadow, border color)
  - Add smooth transitions (0.3s duration) for hover effects
  - Style icons, titles, and descriptions within cards
  - Ensure RTL text alignment (text-align: right)
  - Use consistent color scheme (#7a3ca0 for primary elements)
  - _Requirements: 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4. Implement responsive grid breakpoints
  - Add desktop breakpoint (min-width: 992px): 3 columns grid
  - Add tablet breakpoint (576px - 991.98px): 2 columns grid
  - Add mobile breakpoint (max-width: 575.98px): 1 column grid
  - Adjust card spacing and padding for each breakpoint
  - Test grid layout at all breakpoints
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [ ]* 4.1 Write visual regression tests for responsive layouts
  - Create snapshot test for desktop layout (1200px width)
  - Create snapshot test for tablet layout (768px width)
  - Create snapshot test for mobile layout (375px width)
  - Verify grid columns adjust correctly at each breakpoint
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 5. Checkpoint - Verify section integration and styling
  - Ensure section appears in correct position on landing page
  - Verify all 6 benefits display correctly
  - Test hover effects on cards
  - Test responsive behavior at all breakpoints
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 6. Implement accessibility features
  - Add `id="merchant-benefits"` to section element
  - Add `aria-labelledby` attribute to section
  - Add `id="merchant-benefits-title"` to section title
  - Add `aria-hidden="true"` to decorative icons
  - Ensure proper heading hierarchy (h2 for section, h3 for cards)
  - Verify RTL direction is set (`dir="rtl"` on root element)
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 6.1 Write accessibility tests
  - Test proper heading hierarchy (h2 → h3)
  - Test color contrast meets WCAG AA standards (4.5:1 ratio)
  - Test keyboard navigation and tab order
  - Test ARIA labels are present and correct
  - Test screen reader compatibility
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ]* 7. Performance optimization and testing
  - Verify Bootstrap Icons are loaded efficiently
  - Ensure CSS is optimized and minified
  - Test section renders within 2 seconds on page load
  - Verify no large images are used (icons only)
  - Measure and verify Cumulative Layout Shift (CLS) is minimal
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 8. Final checkpoint - Complete integration testing
  - Run full test suite and ensure all tests pass
  - Test on real devices (desktop, tablet, mobile)
  - Verify section integrates seamlessly with landing page design
  - Check browser compatibility (Chrome, Firefox, Safari, Edge)
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The section is added inline to the existing LandingPage component, not as a separate component
- All styles follow the existing BEM naming convention used in the landing page
- Bootstrap Icons are already loaded in the project, no additional dependencies needed
- The design uses TypeScript (Angular), so all implementation will be in TypeScript
- No property-based tests are included as this is a static UI component with no business logic

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["1.1", "2"] },
    { "id": 2, "tasks": ["2.1", "2.2", "3"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["4.1", "6"] },
    { "id": 5, "tasks": ["6.1", "7"] }
  ]
}
```
