require 'rake'
require 'yaml'
require "ruby/openai"

SOURCE = "."
CONFIG = {
  'posts' => File.join(SOURCE, "_posts/#{Time.now().year()}"),
  'post_ext' => "md",
}


client = OpenAI::Client.new(access_token: "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")
# text-ada-001
# text-babbage-001
# text-curie-001
# text-davinci-001
# code-davinci-002
# code-cushman-001
openai_client = OpenAI::Client.new(api_key: "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", default_engine: "ada")

# List Engines
openai_client.engines

# Retrieve Engine
openai_client.engine("babbage")

# Search
openai_client.search(documents: ["White House", "hospital", "school"], query: "the president")

# Create Completion
openai_client.completions(prompt: "Once upon a time", max_tokens: 50)


# Usage: rake post title="A Title"
desc "Begin a new post in #{CONFIG['posts']}"
task :post do
  abort("rake aborted: '#{CONFIG['posts']}' directory not found.") unless FileTest.directory?(CONFIG['posts'])
  title = ENV["title"] || "new-post"
  slug = title.downcase.strip.gsub(' ', '-').gsub(/[^\w-]/, '')
  filename = File.join(CONFIG['posts'], "#{Time.now.strftime('%Y-%m-%d')}-#{slug}.#{CONFIG['post_ext']}")
  if File.exist?(filename)
    abort("rake aborted!") if ask("#{filename} already exists. Do you want to overwrite?", ['y', 'n']) == 'n'
  end

  puts "Creating new post: #{filename}"
  open(filename, 'w') do |post|
    post.puts "---"
    post.puts "title: \"#{title.gsub(/-/,' ')}\""
    post.puts "date: #{Time.now}"
    post.puts "author: tangyuewei"
     post.puts "category: []"
    post.puts "tags: []"
    post.puts "math: true"
    post.puts "mermaid: true"
    post.puts "image:"
  	post.puts " src:"
    post.puts "---"
  end
end # task :post
