import { defineComponent } from 'vue';
// import HelloWorld from '@/components/HelloWorld.vue'; // @ is an alias to /src
import Editor from '@/components/editor.vue';
// import Editor from '@/components/editor2.vue';

export default defineComponent({
  name: 'HomeView',
  components: {
    // HelloWorld,
    Editor,
  },
});
