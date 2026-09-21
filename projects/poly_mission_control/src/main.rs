mod handlers;
mod types;

use axum::extract::DefaultBodyLimit;
use axum::routing::{get, post};
use axum::Router;
use clap::Parser;
use std::net::SocketAddr;
use tower_http::cors::CorsLayer;
use tower_http::services::ServeDir;

#[derive(Parser, Debug)]
#[command(name = "poly_mission_control")]
#[command(about = "小韭菜牧场剪辑牛马 (牛马4号) - 自媒体视频剪辑控制中枢")]
struct Args {
    #[arg(short, long, default_value_t = 8999)]
    port: u16,

    #[arg(short, long, default_value = "0.0.0.0")]
    host: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let args = Args::parse();
    let addr_str = format!("{}:{}", args.host, args.port);
    let addr: SocketAddr = addr_str.parse()?;

    let app = Router::new()
        .route("/", get(handlers::frontend::serve_dashboard))
        .route("/api/system", get(handlers::system::get_system_metrics))
        .route("/api/system/doctor", get(handlers::system::run_system_doctor))
        // 自媒体视频剪辑管线 API
        .route("/api/video/status", get(handlers::video_pipeline::get_video_engine_status))
        .route("/api/video/tasks", get(handlers::video_pipeline::list_video_tasks))
        .route("/api/video/tasks/create", post(handlers::video_pipeline::create_video_task))
        .route("/api/video/library", get(handlers::video_pipeline::list_video_library))
        .route("/api/video/projects", get(handlers::video_projects::list_projects))
        .route("/api/video/projects/save", post(handlers::video_projects::save_project))
        .route("/api/video/projects/load", get(handlers::video_projects::load_project))
        .route("/api/video/fix-orientation", post(handlers::video_orientation::fix_orientation))
        .route("/api/video/detect-rotation", get(handlers::video_orientation::detect_rotation))
        .route("/api/video/download-url", post(handlers::video_orientation::download_remote_video))
        .route("/api/video/rough-wash", post(handlers::video_wash::execute_rough_wash))
        .route("/api/video/director-draft", post(handlers::director_engine::generate_director_draft))
        .route("/api/canvas/auto-workflow", post(handlers::canvas_bridge::run_auto_workflow))
        // Agent Brain & Models & Gemini Accounts Matrix
        .route("/api/agent/status", get(handlers::agent_brain::get_agent_status))
        .route("/api/agent/models", get(handlers::agent_brain::list_available_models))
        .route("/api/agent/models/switch", post(handlers::agent_brain::switch_model))
        .route("/api/agent/gemini-rules", post(handlers::agent_brain::update_gemini_rules))
        .route("/api/agent/prompt", post(handlers::agent_brain::execute_agent_prompt))
        .route("/api/gemini-accounts", get(handlers::gemini_accounts::list_gemini_accounts))
        .route("/api/gemini-accounts/add", post(handlers::gemini_accounts::add_gemini_account))
        .route("/api/gemini-accounts/update-name", post(handlers::gemini_accounts::update_gemini_account_name))
        .route("/api/gemini-accounts/switch", post(handlers::gemini_accounts::switch_gemini_account))
        .route("/api/gemini-accounts/unblock", post(handlers::gemini_accounts::unblock_gemini_account))
        .route("/api/gemini-accounts/unblock-all", post(handlers::gemini_accounts::unblock_all_gemini_accounts))
        .route("/api/gemini-accounts/test-cooling", post(handlers::gemini_accounts::test_gemini_cooling))
        .route("/api/gemini-accounts/remove", post(handlers::gemini_accounts::remove_gemini_account))
        .route("/api/gemini-accounts/oauth/start", get(handlers::gemini_accounts::start_pkce_flow))
        .route("/api/gemini-accounts/oauth/exchange", post(handlers::gemini_accounts::exchange_pkce_code))
        // Sub-Agent Dispatch Matrix
        .route("/api/subagents/status", get(handlers::subagents::get_subagents_status))
        .route("/api/subagents/dispatch", post(handlers::subagents::dispatch_subagent_task))
        // Skills Ecosystem
        .route("/api/skills", get(handlers::skills::list_skills))
        .route("/api/skills/detail", get(handlers::skills::get_skill_detail))
        .route("/api/skills/save", post(handlers::skills::save_skill_detail))
        // System Services & Crontab
        .route("/api/services/crontab", get(handlers::system_services::get_crontab_jobs))
        .route("/api/services/crontab/run", post(handlers::system_services::run_crontab_job_now))
        .route("/api/services/daemons", get(handlers::system_services::get_daemons_status))
        .route("/api/services/restart", post(handlers::system_services::restart_service))
        // Wiki Knowledge Graph
        .route("/api/wiki/list", get(handlers::wiki::list_wiki_files))
        .route("/api/wiki/file", get(handlers::wiki::get_wiki_file))
        .route("/api/wiki/save", post(handlers::wiki::save_wiki_file))
        .route("/api/logs", get(handlers::logs::get_logs))
        .route("/api/insights/dream", get(handlers::insights::get_latest_dream_report))
        // LAN File Transfer & Cross-Device Sync Hub
        .route("/api/files/list", get(handlers::file_transfer::list_files))
        .route("/api/files/upload", post(handlers::file_transfer::upload_file))
        .route("/api/files/download", get(handlers::file_transfer::download_file))
        .route("/api/files/stream", get(handlers::file_transfer::stream_media))
        .route("/api/files/delete", post(handlers::file_transfer::delete_file))
        .route("/api/files/create-folder", post(handlers::file_transfer::create_folder))
        .route("/api/files/send-to-tg", post(handlers::file_transfer::send_file_to_tg))
        // Toolchain Registry
        .route("/api/toolchain", get(handlers::toolchain::list_toolchain_registry))
        .route("/api/toolchain/probe", post(handlers::toolchain::probe_toolchain))
        .nest_service("/media/library", ServeDir::new("/Users/hi/niuma/video_workspace/library"))
        .nest_service("/media/outputs", ServeDir::new("/Users/hi/niuma/video_workspace/outputs"))
        .fallback(handlers::frontend::serve_static_asset)
        .layer(DefaultBodyLimit::disable())
        .layer(CorsLayer::permissive());

    println!("==================================================================");
    println!(" [🎬] 小韭菜牧场剪辑牛马 (牛马4号) 自媒体视频剪辑控制中枢正在启动...");
    println!(" [🌐] Web Dashboard: http://127.0.0.1:{}", args.port);
    println!(" [📡] LAN/Remote Address: http://{}:{}", args.host, args.port);
    println!("==================================================================");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
