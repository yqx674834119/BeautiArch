AiriLab Design System & Replication Spec
1. Visual Language
Color Palette
Neutrals (Structure & Backgrounds)

bg-page: #F3F6FC (Light Blue-Gray/Lavender Tint)
bg-sidebar: #FFFFFF (White - Clean look)
bg-card: #FFFFFF (White)
border-subtle: #E2E8F0 (Light Slate)
border-focus: #3B82F6 (Blue Focus Ring)
Text Colors

text-primary: #1E293B (Slate 800 - Deep Blue-Gray)
text-secondary: #64748B (Slate 500)
text-tertiary: #94A3B8 (Slate 400)
Accents (Interactivity)

accent-primary: #2563EB (Royal Blue - Main Buttons/Actions)
accent-highlight: #1D4ED8 (Darker Blue - Hover/Active states)
accent-indigo: #4F46E5 (Secondary tags/accents)
accent-purple: #8B5CF6 (Special tags like "Exterior")
Typography
Font Family: System stack prioritizing cleanliness.
font-sans: Inter, PingFang SC, system-ui, -apple-system, sans-serif.
Scale:
text-xs (10-12px): Labels, micro-copy.
text-sm (14px): Body text, Inputs, Button labels.
text-base (16px): Section headings.
text-lg (18-20px): Page titles.
Weights:
Regular (400): Body, Inputs.
Medium (500): Buttons, Labels.
Bold (600/700): Headings.
Spacing & Shape
Radius:
rounded-lg: 8px (Buttons, Inputs).
rounded-xl: 12px (Cards, Modals, Popovers).
rounded-full: (Pill buttons, Avatars).
Shadows:
shadow-sm: Subtle separation for cards.
shadow-md: Hover states and popovers.
2. Layout Structure (The "IDE" View)
The application uses a fixed-height header with a fluid 3-column body.

A. Header (h-[60px])
Left: Breadcrumbs ("My space / Project Name").
Right: User profile, "Go Pro" buttons, Notification bell.
Style: White background, bottom border (border-b).
B. Left Sidebar (w-[280px])
Purpose: Asset management & Inputs.
Sections:
"Design Library" (Grid of style cards).
"Prompt Input" (Large text area).
Styling: bg-sidebar, border-right.
C. Main Canvas (Fluid flex-1)
Purpose: Viewing generations.
Content: Grid of generated images or empty state.
Styling: bg-page, centered content.
D. Right Sidebar (w-[320px])
Purpose: Controls & Parameters.
Sections:
Creative Tools (Tabs).
Model Settings (Dropdowns).
Sliders (Intensity/Weight).
"Generate" Button (Fixed at bottom).
Styling: bg-sidebar, border-left.
3. Core Components
1. Style Card
Container: bg-white, rounded-xl, border border-transparent hover:border-gray-200.
Image: Aspect ratio cover, rounded top corners.
Label: Text below image, text-sm, font-medium.
2. Segmented Control (Tabs)
Container: bg-gray-100 (#F3F4F6), p-1, rounded-lg.
Tab:
Inactive: Transparent, text-secondary.
Active: bg-white, text-primary, shadow-sm, rounded-md.
3. Custom Slider
Track: h-1 bg-gray-200 rounded-full.
Fill: bg-blue-500.
Thumb: Circle, bg-white, border-2 border-blue-500, shadow-sm.
4. Primary Button (Generate)
Style: bg-black (or very dark gray), text-white, w-full, py-3, rounded-lg, font-medium.
Hover: slightly lighter opacity or transform.