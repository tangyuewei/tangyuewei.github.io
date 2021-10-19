let gitalk = new Gitalk({
  id: decodeURI(window.location.pathname),
  clientID: '{{ site.comments.clientID }}',  //这里其实可以直接填值，但是考虑到页面安全性，还是通过配置的方式添加
  clientSecret: '{{ site.comments.secret }}',
  repo: '{{ site.comments.repo }}',
  owner: '{{ site.comments.owner }}',
  admin: '{{ site.comments.admin }}'
})

gitalk.render('disqus_thread');
