# 前端部署说明

**摘要：编译后将整个 dist 文件夹放入后端 wwwroot 下。**

首先，安装项目依赖：

```shell
npm i
```

推荐使用`pnpm`和/或`yarn`。

接下来，运行：

```shell
npm run build-only
```

然后，将产物`dist`文件夹**完整**复制到后端的`Cinema/wwwroot`目录下。（wwwroot 目录可能需要手动创建）

**请注意：前端架构设计时未考虑使用 Nginx 作为 Web 服务器的情况，直接部署至 Nginx 会导致跨域问题和 Vue-router 历史记录问题！**
