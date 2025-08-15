# Responsive Image Implementation

## Overview
The Alice Reader landing page now features a responsive image that adapts to different screen sizes for optimal viewing experience.

## Implementation Details

### Image Location
- **File**: `src/pages/LandingPage.tsx`
- **Component**: LandingPage
- **Image**: Alice in Wonderland book cover (`localAliceCover`)

### Responsive Breakpoints
The image uses Material-UI's responsive breakpoints with the following sizes:

| Breakpoint | Screen Size | Image Max Width | Description |
|------------|-------------|-----------------|-------------|
| `xs` | 0-599px | 180px | Small mobile screens |
| `sm` | 600-959px | 220px | Large mobile/small tablet |
| `md` | 960-1279px | 280px | Medium tablets |
| `lg` | 1280-1919px | 320px | Large tablets/small desktop |
| `xl` | 1920px+ | 350px | Large desktop screens |

### Code Implementation
```tsx
<Box
  component="img"
  src={localAliceCover}
  alt="Alice in Wonderland"
  sx={{
    width: '100%',
    height: 'auto',
    borderRadius: 2,
    boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
    transform: 'rotate(-3deg)',
    mx: 'auto',
    display: 'block',
    // Responsive image sizes for different screen sizes
    maxWidth: {
      xs: 180,  // Small mobile screens (0-599px)
      sm: 220,  // Large mobile/small tablet (600-959px)
      md: 280,  // Medium tablets (960-1279px)
      lg: 320,  // Large tablets/small desktop (1280-1919px)
      xl: 350   // Large desktop screens (1920px+)
    }
  }}
/>
```

### Key Features
1. **Responsive Design**: Image automatically adjusts size based on screen width
2. **Maintains Aspect Ratio**: Uses `height: 'auto'` to preserve image proportions
3. **Centered Layout**: Image is centered within its container
4. **Visual Effects**: Maintains the original styling (border radius, shadow, rotation)
5. **Accessibility**: Proper alt text for screen readers

### Benefits
- **Mobile-Friendly**: Smaller image size on mobile devices for better performance
- **Tablet Optimized**: Medium size for tablet users
- **Desktop Enhanced**: Larger image for desktop users with more screen real estate
- **Performance**: Appropriate image sizes reduce bandwidth usage
- **User Experience**: Optimal viewing experience across all devices

### Testing
To test the responsive behavior:
1. Open the landing page in a browser
2. Use browser developer tools to simulate different screen sizes
3. Observe how the image size changes at different breakpoints
4. Verify the image remains properly centered and styled

### Browser Support
This implementation uses Material-UI's responsive breakpoints, which are based on CSS media queries and are supported by all modern browsers. 