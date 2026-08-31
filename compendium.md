---
layout: page
title: Photography Compendium
subtitle: A collection of photographs documenting nature, wildlife, and places
cover-img: /assets/img/compendium/banner.jpg
---

<div class="compendium-grid">
  {% assign sorted_photos = site.compendium | sort: 'date' | reverse %}
  {% for photo in sorted_photos %}
    <div class="compendium-item">
      <a href="{{ photo.url | relative_url }}">
        <div class="compendium-image-container">
          {% if photo.image %}
            <img src="{{ photo.image | relative_url }}" alt="{{ photo.title }}" class="compendium-thumbnail">
          {% else %}
            <div class="compendium-no-image">No Image</div>
          {% endif %}
          <div class="compendium-overlay">
            <h3 class="compendium-title">{{ photo.title }}</h3>
            {% if photo.species %}
              <p class="compendium-species"><em>{{ photo.species }}</em></p>
            {% endif %}
            {% if photo.location %}
              <p class="compendium-location">📍 {{ photo.location }}</p>
            {% endif %}
            {% if photo.date %}
              <p class="compendium-date">📅 {{ photo.date | date: "%B %d, %Y" }}</p>
            {% endif %}
          </div>
        </div>
      </a>
    </div>
  {% endfor %}
</div>

{% if site.compendium.size == 0 %}
  <div class="compendium-empty">
    <h3>No photographs yet</h3>
    <p>The compendium is currently empty. Check back soon for new additions!</p>
  </div>
{% endif %}

<style>
.compendium-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.compendium-item {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.compendium-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.compendium-image-container {
  position: relative;
  aspect-ratio: 4/3;
  background-color: #f8f9fa;
}

.compendium-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.compendium-no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  font-size: 1.1em;
}

.compendium-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
  padding: 20px 15px 15px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.compendium-item:hover .compendium-overlay {
  opacity: 1;
}

.compendium-title {
  margin: 0 0 8px 0;
  font-size: 1.2em;
  font-weight: bold;
}

.compendium-species {
  margin: 4px 0;
  font-size: 0.95em;
}

.compendium-location, .compendium-date {
  margin: 4px 0;
  font-size: 0.9em;
  opacity: 0.9;
}

.compendium-empty {
  text-align: center;
  margin-top: 60px;
  padding: 40px;
  color: #6c757d;
}

@media (max-width: 768px) {
  .compendium-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
  }
}
</style>