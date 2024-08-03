const data = `<template>
<div class="container" data-id="123" @click="handleClick">
  <!-- 这是一段注释 -->
  <span>{{ title }}</span>
  <p v-if="title">{{ title }}</p>
  <p v-else>ddddd</p>
  <ul>
    <li v-for="item in items" :key="item.id">
      {{ item.name }} - {{ item.price }}
    </li>
  </ul>
</div>
<code>
  <pre>
    {{ title }}
  </pre>
</code>
</template>
`
export default data;