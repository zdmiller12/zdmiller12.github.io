# Photography Compendium

## Overview
The Photography Compendium is a structured collection system for organizing and displaying photographs with detailed metadata. Each photograph includes information about the subject, location, camera settings, and descriptive content.

## Structure

### Files and Directories
- `compendium.md` - Main compendium index page showing all photographs in a grid layout
- `_layouts/photograph.html` - Template for individual photograph pages
- `_compendium/` - Directory containing individual photograph entries
- `assets/img/compendium/` - Directory for photograph images

### Configuration
The compendium uses Jekyll collections, configured in `_config.yml`:
```yaml
collections:
  compendium:
    output: true
    permalink: /compendium/:name/
    sort_by: date
```

## Adding New Photographs

### 1. Create a Photograph Entry
Create a new markdown file in the `_compendium/` directory with the following format:

```yaml
---
title: "Descriptive Title of the Photograph"
species: "Scientific name (for wildlife/plants)"
location: "Specific location where photo was taken"
coordinates: "Latitude, Longitude (optional)"
date: YYYY-MM-DD
camera: "Camera model used"
lens: "Lens information"
settings: "Camera settings (f-stop, shutter speed, ISO)"
image: "/assets/img/compendium/filename.jpg"
tags: [tag1, tag2, tag3]
subtitle: "Optional subtitle"
---

Write your detailed description here. You can include:
- Behavioral observations
- Technical notes about the shot
- Interesting facts about the species/location
- Story behind the photograph

Use Markdown formatting for emphasis, lists, etc.
```

### 2. Add the Image
- Place your photograph in `assets/img/compendium/`
- Use descriptive, URL-friendly filenames
- Recommended formats: JPG, PNG
- Optimize images for web (reasonable file size while maintaining quality)

### 3. Example Entry
See `_compendium/cardinal-winter-2024.md` for a complete example.

## Metadata Fields

### Required Fields
- `title` - Display name for the photograph
- `date` - When the photograph was taken
- `image` - Path to the image file

### Optional Fields
- `species` - Scientific name (displayed in italics)
- `location` - Geographic location
- `coordinates` - GPS coordinates (creates a Google Maps link)
- `camera` - Camera model
- `lens` - Lens information
- `settings` - Camera settings
- `tags` - Array of descriptive tags
- `subtitle` - Additional title information

## Features

### Main Compendium Page (`/compendium/`)
- Grid layout of all photographs
- Hover overlay with key information
- Responsive design for mobile devices
- Sorted by date (newest first)

### Individual Photograph Pages (`/compendium/photo-name/`)
- Full-size image display
- Complete metadata table
- Detailed description content
- Navigation between photographs
- Link back to main compendium
- Social sharing buttons (configurable)

### Navigation Integration
The compendium is automatically added to the site navigation menu via `_config.yml`.

## Styling and Customization

The compendium includes custom CSS for:
- Responsive grid layouts
- Image overlays and hover effects
- Metadata presentation
- Navigation elements

Colors and styling can be customized by modifying the `<style>` sections in:
- `compendium.md` (main page styling)
- `_layouts/photograph.html` (individual page styling)

## Tips for Best Results

### Photography
- Use high-quality images with good composition
- Include contextual information in descriptions
- Be consistent with metadata formatting
- Consider adding multiple photos of the same species/location over time

### Organization
- Use descriptive, consistent filenames
- Tag photographs thoughtfully for future searchability
- Include location information when possible
- Document camera settings for technical reference

### Content
- Write engaging descriptions that tell a story
- Include interesting facts about subjects
- Note unique conditions or circumstances
- Share technical challenges or successes