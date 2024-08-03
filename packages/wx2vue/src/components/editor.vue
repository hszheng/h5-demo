
import { defineComponent, ref, shallowRef } from 'vue'
import { Codemirror } from 'vue-codemirror'
import vue2wxml from '../utils/vue2wxml'
import wxml2vue from '../utils/wxml2vue'
import mockData from '../utils/mock'
// import { javascript } from '@codemirror/lang-javascript'
import { html } from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'

export default defineComponent({
  components: {
    Codemirror
  },
  setup() {
    // const code = ref(`console.log('Hello, world!')`)
    const code = ref(mockData)
    const extensions = [html(), oneDark]
    const transformCode = ref('')

    // Codemirror EditorView instance ref
    const view = shallowRef()
    const handleReady = (payload: any) => {
      view.value = payload.view
    }

    const handleChange = (type: string, e: string)=> {
      console.log('change', type, e)
    }

    const handleBlur = (type: string, e: any)=> {
      console.log('change', type, e)
    }

    const handleTransformClick = (type: string) => {
      if (type === 'vue') {
        transformCode.value = vue2wxml(code.value)
        return
      }
      if (type === 'wxml') {
        transformCode.value = wxml2vue(code.value)
        return
      }
    }

    const handeCodeTransform = () => {
      const temp = code.value
      code.value = transformCode.value
      transformCode.value = temp
    }

    return {
      code,
      transformCode,
      extensions,
      handleReady,
      handleChange,
      handleBlur,
      handleTransformClick,
      handeCodeTransform,
      log: console.log
    }
  }
})
