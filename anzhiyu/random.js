var posts=["2026/04/27/hello-world/","2026/04/27/张居正：一根燃烧自己的脊梁/","2026/04/15/李清照/","2026/04/27/苏轼与苏辙：千年兄弟情的传奇/","2026/04/27/陆游与唐婉的爱情故事/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };