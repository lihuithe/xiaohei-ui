# 主题定制

## 主题系统

本项目使用 Tailwind CSS v4 主题系统，支持浅色和深色模式。

## 主题配置

主题配置位于 `src/style.css` 文件中，使用 CSS 变量定义。

## 自定义颜色

```css
:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --primary: oklch(0.205 0 0);
    /* 更多颜色变量... */
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
    /* 更多暗色变量... */
}
```

## 使用自定义颜色

```vue
<div class="bg-background text-foreground">
  背景和文字
</div>
```

## 圆角大小

```css
--radius-sm: 0.375rem;
--radius-md: 0.5rem;
--radius-lg: 0.625rem;
--radius-xl: 0.875rem;
```
