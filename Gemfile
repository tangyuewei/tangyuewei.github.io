# default

# source "https://rubygems.org"
#
# gemspec
#
# group :test do
#   gem "html-proofer", "~> 3.18"
# end
#
# install_if -> { RUBY_PLATFORM =~ %r!mingw|mswin|java! } do
#   gem "tzinfo", "~> 1.2"
#   gem "tzinfo-data"
# end
# gem "wdm", "~> 0.1.1", :install_if => Gem.win_platform?
# gem "webrick", "~> 1.7"




source "https://rubygems.org"
gem "jekyll", "~> 4.2.0"
gem "minima", "~> 2.5"
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.12"
end
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", "~> 1.2"
  gem "tzinfo-data"
end
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]
gem "webrick", "~> 1.7"
gem "jekyll-theme-chirpy", "~> 3.2"
gem "rake", "~> 13.0"

gem "i18n", "~> 1.8"
