# frozen_string_literal: true

# 稀薄页 / 聚合页从 sitemap 中排除。
#
# jekyll-sitemap 生成的 sitemap.xml 是 Liquid 模板，直到 render 阶段才遍历
# site.pages（模板中用 `where_exp:'doc','doc.sitemap != false'` 过滤）。
# 因此在 :pre_render 写入 page.data["sitemap"] = false 即可生效；此时
# jekyll-archives 生成的 tag / category 页也已进入 site.pages。
#
# 与 _includes/head.html 中的 noindex / 广告守卫保持同一套判定规则。
#
# 注意：_tabs/ 属于 collections.tabs，是 Jekyll::Document 而非 Jekyll::Page，
# jekyll-sitemap 也会把它们输出。因此必须连 site.documents 一起处理，否则
# /tags/ /categories/ 索引页与带 noindex 的 tab 页仍会留在 sitemap 里。
Jekyll::Hooks.register :site, :pre_render do |site, _payload|
  thin_prefixes = %w[/tags/ /categories/ /moments/page /assets/photo-lab/].freeze
  thin_exact = %w[/archives/ /tags/ /categories/].freeze

  (site.pages + site.documents).each do |doc|
    url = doc.url.to_s
    is_thin = thin_exact.include?(url) ||
              thin_prefixes.any? { |prefix| url.start_with?(prefix) } ||
              doc.data["noindex"] == true
    next unless is_thin

    doc.data["sitemap"] = false
  end
end
