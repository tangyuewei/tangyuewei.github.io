---
title: 证件照
icon: fas fa-id-card
order: 8
---

<style>
  /* 仅作用于本页 iframe：单一 id 选择器，不污染主题样式 */
  #photo-lab {
    display: block;
    width: 100%;
    height: calc(100vh - 132px);
    min-height: 600px;
    border: 0;
    border-radius: 14px;
    background: #f1ece2;
    box-shadow: 0 14px 34px -22px rgba(0, 0, 0, .5);
  }
  @media (max-width: 991px) {
    #photo-lab { height: calc(100vh - 108px); min-height: 560px; }
  }
  @media (max-width: 575px) {
    #photo-lab { height: calc(100dvh - 96px); min-height: 520px; border-radius: 10px; }
  }
</style>

<iframe
  id="photo-lab"
  src="{{ '/assets/photo-lab/id-photo-tool.html' | relative_url }}"
  title="证件照工坊 — 浏览器内 AI 抠图 · 换底色 · 标准裁剪 · 美颜 · 导出"
  scrolling="auto"
></iframe>
