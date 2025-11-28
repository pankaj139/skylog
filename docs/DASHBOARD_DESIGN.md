# SkyLog Dashboard Design Specification

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Glass navbar, sticky)                              │
│ ✈️ SkyLog    Dashboard  History  Profile    👤 user@email  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Welcome Back, User! 👋                                    │
│   Track your journey across the globe                      │
│                                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│   │ ✈️       │ │ 🌐       │ │ 🏢       │ │ 🌍       │     │
│   │    12    │ │    8     │ │    5     │ │    3     │     │
│   │ Flights  │ │ Airports │ │ Airlines │ │Countries │     │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘     │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                                                     │   │
│   │              🌍 INTERACTIVE 3D GLOBE               │   │
│   │                                                     │   │
│   │        (Rotating Earth with neon blue arcs)        │   │
│   │                                                     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   Recent Trips ──────────────────────────────────────       │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 🛫 NYC → LHR  │  British Airways  │  Nov 20, 2025  │   │
│   │    5,585 km   │      8h 30m       │   Business     │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ 🛫 DXB → SIN  │  Emirates         │  Nov 15, 2025  │   │
│   │    6,737 km   │      7h 15m       │   Economy      │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│                                                    ┌─────┐  │
│                                                    │  +  │  │
│                                                    └─────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Color Palette

### Background
- **Primary BG**: `#0a0e27` (Dark navy)
- **Surface**: `#1a1f40` (Lighter navy)
- **Border**: `#2d3561` (Navy border)

### Accents
- **Neon Blue**: `#00f0ff` (Primary accent)
- **Neon Cyan**: `#00ffff` (Secondary accent)
- **Neon Purple**: `#b794f4` (Tertiary)

### Text
- **Primary**: `#ffffff` (White)
- **Secondary**: `#a0aec0` (Light gray)
- **Muted**: `#718096` (Gray)

## Component Specifications

### 1. Header/Navigation
- **Height**: 64px
- **Background**: Glassmorphism (`rgba(26, 31, 64, 0.7)` + backdrop blur)
- **Border**: 1px solid `rgba(255, 255, 255, 0.1)`
- **Sticky**: Top of page
- **Logo**: ✈️ SkyLog (gradient text)
- **Nav Links**: Hover state with neon underline
- **User Section**: Avatar or email + dropdown

### 2. Welcome Section
- **Padding**: 48px vertical
- **Title**: 36px font, bold, white
- **Subtitle**: 18px, gray-400
- **Emoji**: Large decorative emoji

### 3. Statistics Cards
- **Layout**: Grid (4 columns on desktop, 2 on tablet, 1 on mobile)
- **Background**: Glassmorphism effect
- **Border**: 1px solid neon-blue with 20% opacity
- **Padding**: 24px
- **Icon**: Large emoji or icon at top
- **Number**: 48px font, bold, gradient text
- **Label**: 14px, gray-400
- **Animation**: Counter animation on load
- **Hover**: Subtle glow effect

### 4. Globe Container
- **Height**: 500px on desktop, 400px on mobile
- **Background**: Subtle radial gradient
- **Border Radius**: 16px
- **Margin**: 32px vertical
- **Globe Features**:
  - Dark Earth texture
  - Neon blue flight path arcs
  - Auto-rotation
  - Mouse/touch interactive
  - Airport markers (small dots)

### 5. Recent Trips Cards
- **Background**: Glassmorphism
- **Padding**: 20px
- **Border**: 1px solid white/10
- **Hover**: Scale up slightly, glow effect
- **Layout**: 
  - Left: Route (NYC → LHR)
  - Center: Airline name
  - Right: Date
  - Bottom row: Distance, duration, class

### 6. Floating Action Button (FAB)
- **Size**: 56px × 56px
- **Position**: Fixed, bottom-right, 24px margin
- **Background**: Gradient (neon-blue to cyan)
- **Icon**: + symbol
- **Shadow**: Neon glow
- **Animation**: Pulse effect
- **Hover**: Scale up to 64px

## Typography

- **Font Family**: Inter
- **Headings**: 
  - H1: 36px, bold
  - H2: 24px, semibold
  - H3: 20px, medium
- **Body**: 16px, regular
- **Small**: 14px, regular
- **Labels**: 12px, medium, uppercase, letter-spacing

## Effects & Animations

### Glassmorphism
```css
background: rgba(26, 31, 64, 0.7);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Neon Glow
```css
box-shadow: 0 0 20px rgba(0, 240, 255, 0.3);
```

### Gradient Text
```css
background: linear-gradient(135deg, #00f0ff 0%, #00ffff 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Hover Animations
- Stat cards: Scale 1.02, increase glow
- Trip cards: Scale 1.01, border glow
- Buttons: Scale 1.05, shadow increase

## Responsive Breakpoints

- **Mobile**: < 640px
  - Stats: 1 column
  - Globe height: 300px
  - Hide some nav items
  
- **Tablet**: 640px - 1024px
  - Stats: 2 columns
  - Globe height: 400px
  
- **Desktop**: > 1024px
  - Stats: 4 columns
  - Globe height: 500px
  - Full navigation

## Dark Mode Optimization

- Earth texture: Dark variant
- Flight paths: Bright neon for contrast
- Reduce white opacity for softer look
- Increase glow effects for depth
