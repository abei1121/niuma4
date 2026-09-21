# Workspace Boundary & Safety Rules

## 1. 严格工作区边界 (Directory Boundary)
- **唯一合法工作目录**：`/Users/hi/niuma`
- 严禁对 `/Users/hi/niuma` 以外的任何目录（包括但不限于 `/Users/hi/Desktop`、`/Users/hi/Documents`、`/Users/hi/Downloads`、`/System`、`/Library` 等）进行创建、修改、重命名或删除操作。
- 所有的终端命令执行必须以 `/Users/hi/niuma`（或其子目录）作为工作目录（`Cwd`）。

## 2. 破坏性操作防护 (Destructive Operations Guard)
- 严禁执行未经确认的全局删除、强制重置（如 `rm -rf`、`git reset --hard`、`git clean -f` 等）。
- 如有清理需求，必须明确列出具体文件并获得用户确认。

## 3. 主机资源保护 (Mac mini M2 8GB)
- 严格控制内存与后台任务占用，杜绝启动高负载无限制的常驻守护进程。
- 发现挂起或超时进程立即清理，避免僵尸进程占用资源。
