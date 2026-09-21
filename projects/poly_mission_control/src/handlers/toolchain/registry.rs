#[derive(Debug, Clone, Copy)]
pub struct ToolSpec {
    pub id: &'static str,
    pub name: &'static str,
    pub category: &'static str,
    pub paths: &'static [&'static str],
    pub version_args: &'static [&'static str],
    pub process_pattern: Option<&'static str>,
    pub description: &'static str,
    pub probe_args: &'static [&'static str],
}

pub const REGISTRY: &[ToolSpec] = &[
    // 板块 1: 核心多媒体与硬件加速 (自媒体视频中枢)
    ToolSpec {
        id: "ffmpeg", name: "FFmpeg 音视频处理与转码中枢", category: "自媒体多媒体与硬件加速",
        paths: &["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"], version_args: &["-version"], process_pattern: Some("ffmpeg"),
        description: "自媒体剪辑、音频分离提取、画幅裁剪与多媒体压制核心引擎", probe_args: &["-version"],
    },
    ToolSpec {
        id: "videotoolbox", name: "Apple VideoToolbox 硬件加速中枢", category: "自媒体多媒体与硬件加速",
        paths: &["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg"], version_args: &["-encoders"], process_pattern: None,
        description: "Apple Silicon M2 专属硬件编解码加速，驱动 GPU 进行 H.264/HEVC/ProRes 零负载极速渲染", probe_args: &["-encoders"],
    },
    // 板块 2: 核心编译器与大模型驱动
    ToolSpec {
        id: "rustc", name: "Rust 编译器 (rustc)", category: "核心编译器与运行时",
        paths: &["/Users/hi/.cargo/bin/rustc", "/usr/local/bin/rustc", "/opt/homebrew/bin/rustc"], version_args: &["--version"], process_pattern: None,
        description: "牛马4号核心开发与高性能常驻进程编译底座 (极致性能与内存安全)", probe_args: &["--version"],
    },
    ToolSpec {
        id: "cargo", name: "Cargo 包构建中枢", category: "核心编译器与运行时",
        paths: &["/Users/hi/.cargo/bin/cargo", "/usr/local/bin/cargo", "/opt/homebrew/bin/cargo"], version_args: &["--version"], process_pattern: None,
        description: "Rust 官方包管理器、多小文件架构依赖解析与构建工具链", probe_args: &["--version"],
    },
    ToolSpec {
        id: "agy", name: "AGY 大模型原生驱动 CLI", category: "核心编译器与运行时",
        paths: &["/Users/hi/.local/bin/agy", "/Users/hi/niuma/bin/agy"], version_args: &["--version"], process_pattern: Some("agy"),
        description: "原生 AGY 大模型终端/子代理中枢与多账号动态轮换调度引擎", probe_args: &["--version"],
    },
    ToolSpec {
        id: "python3", name: "Python 3 解释器", category: "核心编译器与运行时",
        paths: &["/opt/homebrew/bin/python3", "/usr/bin/python3", "/usr/local/bin/python3"], version_args: &["--version"], process_pattern: None,
        description: "辅助脚本、自动化数据处理与多媒体工具链脚本环境", probe_args: &["--version"],
    },
    // 板块 3: 网络隧道与异地专网
    ToolSpec {
        id: "hysteria", name: "Hysteria 2 高性能专网隧道", category: "网络隧道与异地专网",
        paths: &["/usr/local/bin/hysteria", "/opt/homebrew/bin/hysteria"], version_args: &["version"], process_pattern: Some("hysteria"),
        description: "极速 QUIC 协议出海通道，为大模型接口与多媒体素材下载提供毫秒级低延迟", probe_args: &["version"],
    },
    ToolSpec {
        id: "tailscale", name: "Tailscale WireGuard 跨端异地组网", category: "网络隧道与异地专网",
        paths: &["/usr/local/bin/tailscale", "/opt/homebrew/bin/tailscale", "/Applications/Tailscale.app/Contents/MacOS/Tailscale"], version_args: &["version"], process_pattern: Some("Tailscale"),
        description: "多端点对点安全 Mesh VPN 专网，支持外网直连本控制台与视频素材跨端传输", probe_args: &["status", "--peers=false"],
    },
    ToolSpec {
        id: "proxy_health_checker", name: "Proxy Health 节点探活与选路", category: "网络隧道与异地专网",
        paths: &["/Users/hi/niuma/bin/proxy_health_checker_rust", "/Users/hi/niuma/niuma1-main/projects/proxy_health_checker_rust/target/release/proxy_health_checker_rust"], version_args: &[], process_pattern: Some("proxy_health_checker"),
        description: "Rust 原生异步代理健康检测与低延迟自动择优选路引擎", probe_args: &[],
    },
    ToolSpec {
        id: "hy2_switch", name: "Hysteria 2 三节点秒级切换器", category: "网络隧道与异地专网",
        paths: &["/Users/hi/niuma/bin/hy2_switch"], version_args: &["status"], process_pattern: None,
        description: "日/新/韩三节点多活灾备与自动故障转移管理工具", probe_args: &["status"],
    },
    // 板块 4: 系统守护与常驻服务
    ToolSpec {
        id: "system_keeper_rust", name: "System Keeper 系统守护巡检引擎", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/system_keeper_rust", "/Users/hi/niuma/niuma1-main/projects/system_keeper_rust/target/release/system_keeper_rust"], version_args: &[], process_pattern: Some("system_keeper_rust"),
        description: "Rust 编写的系统守卫，周期性巡检进程健康、算力隔离与记忆系统自愈", probe_args: &[],
    },
    ToolSpec {
        id: "telegram_bot_rust", name: "Telegram Bot 高可用桥接中枢", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/telegram_bot_rust", "/Users/hi/niuma/niuma1-main/projects/telegram_bot_rust/target/release/telegram_bot_rust"], version_args: &[], process_pattern: Some("telegram_bot_rust"),
        description: "全 Rust 重构的 Telegram 双向通信链路，具备多媒体、文件跨端直推与主动告警能力", probe_args: &[],
    },
    ToolSpec {
        id: "poly_mission_control", name: "自媒体控制台中枢 Web 引擎", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/poly_mission_control", "/Users/hi/niuma/niuma1-main/projects/poly_mission_control/target/release/poly_mission_control"], version_args: &[], process_pattern: Some("poly_mission_control"),
        description: "当前 Web 管理控制台、视频任务流水线、跨端传输与特战子代理调度后端引擎", probe_args: &[],
    },
    ToolSpec {
        id: "lan_file_server", name: "LAN File Server 局域网跨端传输", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/lan_file_server", "/Users/hi/niuma/niuma1-main/projects/lan_file_server_rust/target/release/lan_file_server_rust"], version_args: &[], process_pattern: Some("lan_file_server"),
        description: "局域网高速跨设备物理文件传输与多端同步服务", probe_args: &[],
    },
    ToolSpec {
        id: "tg_send", name: "TG Send 极速主动直推工具", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/tg_send", "/Users/hi/niuma/niuma1-main/scripts/tg_send"], version_args: &[], process_pattern: None,
        description: "向命主 Telegram 发送文本、告警与通知的底层跨端快速管道", probe_args: &[],
    },
    ToolSpec {
        id: "tg_send_file", name: "TG Send File 跨端多媒体直推", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/tg_send_file", "/Users/hi/niuma/niuma1-main/scripts/tg_send_file"], version_args: &[], process_pattern: None,
        description: "向命主 Telegram 发送图片、音频、视频与物理文件的一键直推工具", probe_args: &[],
    },
    ToolSpec {
        id: "memory_tool", name: "Memory Tool 记忆合规与自愈 CLI", category: "系统守护与常驻服务",
        paths: &["/Users/hi/niuma/bin/memory_tool"], version_args: &["check-rules"], process_pattern: None,
        description: "双轨制记忆（热路由/冷备/Wiki/双向反向链接）合规检测与自动化秒级自愈引擎", probe_args: &["check-rules"],
    },
    // 板块 5: 基础工具与版本控制
    ToolSpec {
        id: "git", name: "Git 分布式版本控制", category: "基础工具与版本控制",
        paths: &["/usr/bin/git", "/opt/homebrew/bin/git"], version_args: &["--version"], process_pattern: None,
        description: "本地代码版本与知识图谱历史版本溯源工具", probe_args: &["--version"],
    },
    ToolSpec {
        id: "curl", name: "cURL 高性能传输与探针", category: "基础工具与版本控制",
        paths: &["/usr/bin/curl", "/opt/homebrew/bin/curl"], version_args: &["--version"], process_pattern: None,
        description: "全协议 HTTP/HTTPS/WebSocket 探针与底层网络极速连通性验证工具", probe_args: &["--version"],
    },
    ToolSpec {
        id: "jq", name: "jq 命令行 JSON 处理器", category: "基础工具与版本控制",
        paths: &["/opt/homebrew/bin/jq", "/usr/local/bin/jq", "/usr/bin/jq"], version_args: &["--version"], process_pattern: None,
        description: "轻量级高性能 JSON 数据清洗、字段提取与流水线管道解析工具", probe_args: &["--version"],
    },
];
