<template>
  <div class="markdown-body" v-html="rendered"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface Props {
  content: string
}

const props = defineProps<Props>()

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return ''
  },
})

const rendered = computed(() => md.render(props.content))
</script>

<style>
.markdown-body {
  color: hsl(var(--foreground));
  line-height: 1.6;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 2rem;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 0.3rem;
}

.markdown-body h2 {
  font-size: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
  padding-bottom: 0.3rem;
}

.markdown-body h3 {
  font-size: 1.25rem;
}

.markdown-body p {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.markdown-body ul,
.markdown-body ol {
  margin-top: 0;
  margin-bottom: 1rem;
  padding-left: 2rem;
}

.markdown-body li {
  margin-top: 0.25rem;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 0.875em;
  background-color: hsl(var(--muted));
  border-radius: 0.25rem;
}

.markdown-body pre {
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  overflow: auto;
  font-size: 0.875rem;
  line-height: 1.45;
  background-color: hsl(var(--muted));
  border-radius: 0.5rem;
}

.markdown-body pre code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
}

.markdown-body blockquote {
  margin: 0;
  padding: 0 1rem;
  color: hsl(var(--muted-foreground));
  border-left: 0.25rem solid hsl(var(--border));
}

.markdown-body table {
  width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.markdown-body th,
.markdown-body td {
  padding: 0.5rem 1rem;
  border: 1px solid hsl(var(--border));
}

.markdown-body a {
  color: hsl(var(--primary));
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}
</style>
