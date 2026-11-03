# Digital Pet Portal 设计

## 目的

为现有 `manjughosa/magpie-digital-pet` 增加一张独立的 magpie 市场卡片，避免宠物本体因「供应商」兜底标签被埋没。门面负责介绍和导流，宠物本体继续负责养成、存档和服务。

## 已选方案

- 不采用「原插件加栏目」：市场按 GitHub 仓库扫描根目录 `package.json`，原插件内加栏目不会增加卡片。
- 采用独立仓库、独立纯页面插件：`magpie-digital-pet-portal`。
- 视觉采用用户确认的混合方向：A 的暗色像素氛围 + B 的大界面橱窗。

## 页面内容

- 首屏：暗色导航、主标题「把每一次请求，变成一次成长」、真实宠物界面橱窗、明确的原插件入口。
- 数据文案：「600+ 宠物」「超过 14 套像素场景」。
- 场景展示：使用真实像素背景，介绍栖息地、探险与收藏。
- 玩法展示：日常照顾、鼠标互动、进化试炼、图鉴与历代搭档。
- 隐私说明：只读取 magpie 已记账的用量，不读取对话，不消耗额外 token，本地 SQLite 存档。
- 结尾：明确说明本仓库只是门面，所有获取入口指向 `https://github.com/manjughosa/magpie-digital-pet`。

## 技术约束

- 根目录 `package.json` 只声明 `magpie.page`，不得出现 `main`、`exports`、`magpie.middleware`、`magpie.agent`、`magpie.hooks`。
- 不设置服务端口，不启动 watcher，不依赖宠物引擎，不读写 `pet.db`。
- 静态 HTML/CSS/JS，无运行时依赖、无外部字体或脚本。
- 使用真实界面截图和现有视觉素材；保留素材许可与 NOTICE。
- 响应式布局、可见键盘焦点、减少动态效果偏好、所有外链使用 `noopener noreferrer`。

## 非目标

- 不复制宠物功能，不维护第二份养成逻辑。
- 不修改现有 Digital Pet。
- 不在本轮创建 GitHub 仓库、push、发布或提交 git commit。

## 验证

- 静态契约测试证明市场分类为 `page`，且不存在供应商兜底入口。
- 所有宣传数字、跳转地址和本地资产路径自动检查。
- 浏览器检查桌面与窄屏布局、导航和外链、控制台错误、横向溢出，并查看实际截图。
