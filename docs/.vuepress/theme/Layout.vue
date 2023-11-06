<template>
  <ParentLayout>
    <template #page-bottom>
      <div class="showtime" style="text-align: center;">
        <!--        <script src=""></script>-->
        <span id="timeDate">载入天数...</span><span id="times">载入时分秒...</span>
        <span id="busuanzi_container_site_pv">&nbsp&nbsp<i class="fa fa-home"></i><span
            id="busuanzi_value_site_pv"></span></span>
        <span id="busuanzi_container_site_uv">&nbsp&nbsp<i class="fa fa-user"></i><span
            id="busuanzi_value_site_uv"></span></span>
        <span id="busuanzi_container_page_pv">&nbsp&nbsp<i class="fa fa-eye"></i><span
            id="busuanzi_value_page_pv"></span></span>
      </div>

    </template>
  </ParentLayout>
</template>

<script>
import {createTime} from '../theme/index.js'
import ParentLayout from '/node_modules/vuepress/lib/default-theme/Layout.vue'

export default {
  name: 'Layout',
  components: {
    ParentLayout
  },
  mounted() {
    setInterval(() => {
      createTime();
    }, 250);
    const busuanzi = document.createElement('script');
    busuanzi.type = 'text/javascript';
    busuanzi.src = 'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    document.body.appendChild(busuanzi);
    const cnzz = document.createElement('script');
    cnzz.type = 'text/javascript';
    cnzz.src = 'https://s9.cnzz.com/z_stat.php?id=1278279829&web_id=1278279829';
    document.body.appendChild(cnzz);
  }
}

</script>

<style>
/*@import "//netdna.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css";*/
@import "//cdn.staticfile.org/font-awesome/4.7.0/css/font-awesome.min.css";
</style>
