# 图片处理与占位系统

## 功能背景/动机

当前脚手架在图片展示方面几乎是一片空白：没有统一的图片加载策略、没有懒加载占位、没有加载失败时的回退 UI、也没有自适应裁剪的规范。在实际桌面应用中，图片是不可或缺的视觉元素（用户头像、附件预览、封面图、截图等），缺乏系统化的图片处理会导致：

1. **布局抖动（CLS）**：图片加载前没有占位，加载后突然撑开容器，导致页面内容跳动。
2. **加载体验差**：大图片同步加载时阻塞渲染，用户看到空白区域等待。
3. **错误体验差**：图片加载失败（404、网络中断）时显示浏览器默认的破图图标，极其不专业。
4. **裁剪不一致**：有的地方用 `object-cover`，有的地方用 `object-fill`，圆角、边框、遮罩处理方式各异。
5. **深色模式不适配**：白色背景的图片在深色模式下边缘产生刺眼的光晕。

提供一套**图片处理与占位系统**，能让图片在任何场景下都有优雅、一致、高性能的呈现方式。

## 功能描述

构建一套**图片处理与占位系统**，包含：

1. **智能图片组件 `SmartImage`**：
   - 自动懒加载：使用 Intersection Observer，图片进入视口前不加载。
   - 加载占位：加载期间显示骨架屏或模糊占位图（可传入 `placeholder` 或自动生成低分辨率模糊图）。
   - 错误占位：加载失败时显示统一的错误占位 UI（带刷新按钮和错误图标）。
   - 自适应裁剪：支持 `fit: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'`，自动应用 `object-fit`。
   - 深色模式边框：在深色/OLED 模式下自动为图片添加微弱边框，避免白色图片边缘"割裂"。
2. **图片占位组件族**：
   - `ImageSkeleton`：图片专用的骨架屏占位，呈现图片预期比例的灰色矩形 + 可选的图标暗示（如人像轮廓、文件图标）。
   - `ImageBlurHash`：基于 [BlurHash](https://blurha.sh/) 或 [ThumbHash](https://github.com/evanw/thumbhash) 的模糊占位，在图片加载前显示与图片色彩相近的模糊色块，加载完成后平滑过渡到清晰图。
   - `ImageError`：加载失败时的统一占位，显示错误图标 + "加载失败"文字 + "重试"按钮。
   - `ImageEmpty`：无图片时的占位（如用户未上传头像），显示默认图标或首字母。
3. **图片处理 Composable**：
   - `useImageLoader(url)`：管理图片的 `loading` / `loaded` / `error` 状态，支持重试。
   - `useLazyImage()`：封装 Intersection Observer 懒加载逻辑。
   - `useImagePlaceholder(type)`：根据图片类型（avatar / cover / thumbnail / icon）返回对应的骨架屏配置。
4. **图片自适应系统**：
   - 响应式图片尺寸：根据容器宽度自动选择最佳分辨率（配合 `srcset`）。
   - 圆角与比例规范：内置 `aspect-ratio` 预设（1:1 头像、16:9 封面、4:3 内容、3:2 卡片），自动裁剪。
   - 悬停效果：图片 Hover 时可配置缩放（`zoom`）、变暗（`dim`）、显示覆盖层（`overlay`）。
5. **深色模式图片适配**：
   - 自动为白色背景图片添加微弱暗角或边框（`border: 1px solid rgba(255,255,255,0.06)`）。
   - 可选的 `darken-on-dark` 模式：在深色模式下自动降低图片亮度（`brightness(0.92)`），减少视觉刺激。

## 目标用户

- **需要展示用户头像、附件、封面图的桌面应用开发者**。
- **追求零布局抖动、精致图片加载体验的产品**。
- **需要处理大量图片列表（如相册、文件管理器）的开发者**。

## 详细设计

### 视觉/动画效果描述

**SmartImage 加载流程：**
```
[未加载] → 显示 ImageSkeleton 或 ImageBlurHash（与图片同尺寸）
   ↓ 进入视口/开始加载
[加载中] → 骨架屏/模糊图保持，显示轻微脉冲动画
   ↓ 加载完成
[已加载] → 清晰图淡入（opacity 0→1，300ms ease-out），骨架屏淡出
   ↓ 加载失败
[错误] → 显示 ImageError 占位（带重试按钮）
```

**ImageSkeleton 预设：**
```css
.image-skeleton-avatar    { aspect-ratio: 1/1;   border-radius: 9999px; }
.image-skeleton-cover     { aspect-ratio: 16/9;  border-radius: var(--radius-lg); }
.image-skeleton-thumbnail { aspect-ratio: 4/3;   border-radius: var(--radius-md); }
.image-skeleton-icon      { aspect-ratio: 1/1;   border-radius: var(--radius-sm); width: 48px; }
```

**图片淡入过渡：**
```css
.smart-image-img {
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.smart-image-img.is-loaded {
  opacity: 1;
}
```

**深色模式适配：**
```css
.dark .smart-image-frame {
  border: 1px solid hsl(0 0% 100% / 0.06);
}
.dark .smart-image-frame[data-darken="true"] img {
  filter: brightness(0.92);
}
```

**图片 Hover 效果：**
```css
.smart-image-hover-zoom:hover img {
  transform: scale(1.05);
  transition: transform 0.4s ease-out;
}
.smart-image-hover-dim:hover img {
  filter: brightness(0.7);
  transition: filter 0.3s ease-out;
}
```

### 涉及的技术点

- **Intersection Observer**：实现懒加载，图片进入视口（或提前 200px 进入）时才开始加载。
- **BlurHash / ThumbHash**：极小的字符串（20-30 字符）可解码为模糊占位图，提升感知加载速度。
- **`object-fit` + `aspect-ratio`**：现代 CSS 属性组合，确保图片在任何容器中保持正确比例。
- **图片解码优化**：使用 `img.decode()` 或 `loading="lazy"` 配合自定义逻辑。
- **错误重试**：指数退避重试策略，最多 3 次，每次间隔递增。
- **内存管理**：组件卸载时取消图片加载（`AbortController` 或重置 `src`）。

### 与现有架构的衔接方式

- **新增 `src/components/ui/image/` 目录**：
  - `SmartImage.vue`：智能图片主组件。
  - `ImageSkeleton.vue`：图片骨架屏占位。
  - `ImageBlurHash.vue`：BlurHash 模糊占位解码与渲染。
  - `ImageError.vue`：错误占位组件。
  - `ImageEmpty.vue`：空状态占位组件。
- **新增 `src/composables/useImageLoader.ts`**：
  - 管理图片加载状态机（idle/loading/loaded/error）。
  - 提供 `retry()` 方法。
- **新增 `src/composables/useLazyImage.ts`**：
  - 封装 Intersection Observer 懒加载逻辑。
- **新增 `src/utils/blurhash.ts`**：
  - BlurHash 解码工具函数（若使用 ThumbHash 则改为 `thumbhash.ts`）。
- **修改 `src/style.css`**：
  - 增加图片相关的 CSS 变量（如 `--image-border-dark`）。
- **修改 `src/components/ui/avatar/AvatarImage.vue`**：
  - 接入 `SmartImage`，获得懒加载、错误占位、BlurHash 能力。
- **修改 `src/components/ui/alert-dialog/AlertDialogMedia.vue`**：
  - 接入 `SmartImage`。
- **扩展 `ComponentPlayground.vue`**：
  - 新增「图片系统」演示区，展示懒加载、BlurHash、错误占位、Hover 效果。

### 需要新增/修改的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/components/ui/image/SmartImage.vue` | 新增 | 智能图片主组件 |
| `src/components/ui/image/ImageSkeleton.vue` | 新增 | 图片骨架屏占位 |
| `src/components/ui/image/ImageBlurHash.vue` | 新增 | BlurHash 模糊占位 |
| `src/components/ui/image/ImageError.vue` | 新增 | 错误占位 |
| `src/components/ui/image/ImageEmpty.vue` | 新增 | 空状态占位 |
| `src/composables/useImageLoader.ts` | 新增 | 图片加载状态管理 |
| `src/composables/useLazyImage.ts` | 新增 | 懒加载逻辑 |
| `src/utils/blurhash.ts` | 新增 | BlurHash 解码工具 |
| `src/components/ui/avatar/AvatarImage.vue` | 修改 | 接入 SmartImage |
| `src/style.css` | 修改 | 图片相关 CSS 变量 |
| `src/pages/ComponentPlayground.vue` | 修改 | 新增图片系统演示区 |

## 验收标准

- [ ] `SmartImage` 支持懒加载，未进入视口时不发起图片请求。
- [ ] 加载期间显示与图片同尺寸的 `ImageSkeleton` 或 `ImageBlurHash` 占位，无布局抖动。
- [ ] 图片加载完成后以 300ms 淡入动画过渡到清晰图。
- [ ] 加载失败时显示 `ImageError` 占位，带重试按钮，点击可重新加载。
- [ ] 支持 `aspect-ratio` 预设（1:1、16:9、4:3、3:2），自动裁剪。
- [ ] 深色模式下自动为图片添加微弱边框，可选降低亮度。
- [ ] 支持 Hover 效果（缩放/变暗/覆盖层）。
- [ ] AvatarImage 接入后，头像懒加载、错误回退、BlurHash 均生效。
- [ ] ComponentPlayground 中可交互式预览图片加载全流程。

## 优先级

P1

## 参考实现

- [BlurHash](https://blurha.sh/)：图片模糊占位算法，轻量且效果出色。
- [ThumbHash](https://github.com/evanw/thumbhash)：BlurHash 的替代方案，更小更快。
- [Unsplash 图片加载](https://unsplash.com/)：BlurHash + 淡入的行业标杆实现。
- [Next.js Image](https://nextjs.org/docs/app/api-reference/components/image)：智能图片组件的最佳实践参考。
- [Nuxt Image](https://image.nuxt.com/)：Vue 生态的图片优化模块参考。
