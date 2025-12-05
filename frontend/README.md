# Weight Journal (iOS)

一个在 iOS 上运行的体重与饮食记录 App，包含顶部标题栏（体重/饮食）、卡片式数据展示、以及每周打卡状态柱状图。切换标题栏具有流畅过渡动画。

## 快速开始

1. 安装依赖：

```zsh
npm install -g expo-cli # 若未安装
cd "./Weight journal"
npm install
```

2. 运行到 iOS：

```zsh
npm run ios
```

或运行开发服务：

```zsh
npm start
```

## 功能概览

- 顶部两个标题栏：体重 / 饮食，切换控制当前展示。
- 卡片形式的数据展示：今日体重、变化、周平均、目标等；饮食显示三餐+加餐的概览营养。
- 每周打卡柱状图：以柱状图展示一周的记录状态。
- 数据记录：每日体重与三餐/加餐的饮食，支持自定义食物的营养成分表。
- 流畅动画：切换标题栏与卡片进入/退出动画。 

## 目录结构

- `src/App.tsx`：应用入口，控制标签页切换。
- `src/components/`：`HeaderTabs`、`DataCards`、`WeeklyChart` 等 UI 组件。
- `src/screens/`：`WeightScreen`、`DietScreen` 页面。
- `src/storage/`：使用 AsyncStorage 的数据存取接口。

## 后续计划

- 添加体重录入表单与饮食录入表单。
- 食物库管理与营养计算。
- 更丰富的动画与主题。 
