let gitalk = new Gitalk({
  id: decodeURI(window.location.pathname),
  clientID: '{{ site.comments.clientID }}',
  clientSecret: '{{ site.comments.secret }}',
  repo: '{{ site.comments.repo }}',
  owner: '{{ site.comments.owner }}',
  admin: '{{ site.comments.admin }}'
})

gitalk.render('disqus_thread');
