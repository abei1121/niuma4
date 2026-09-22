use axum::{extract::Json, response::IntoResponse};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fs;
use std::path::Path;
use std::process::Command;

const LIB_DIR: &str = "/Users/hi/niuma/video_workspace/library";
const PADDING_SEC: f64 = 0.15;

#[derive(Deserialize)]
pub struct RoughWashReq {
    pub files: Vec<String>,
    pub silence_threshold_db: Option<f64>,
    pub silence_db: Option<f64>,
    pub min_silence_sec: Option<f64>,
    pub min_silence_duration_sec: Option<f64>,
    pub padding_sec: Option<f64>,
    pub ratio: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct KeepSegment {
    pub index: usize,
    pub file_index: usize,
    pub source_file: String,
    pub start: f64,
    pub end: f64,
    pub duration: f64,
}

#[derive(Serialize, Clone)]
pub struct CutSegment {
    pub index: usize,
    pub file_index: usize,
    pub source_file: String,
    pub start: f64,
    pub end: f64,
    pub duration: f64,
    pub label: String,
}

fn probe_duration(path: &str) -> f64 {
    Command::new("ffprobe")
        .args(["-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path])
        .output()
        .ok()
        .and_then(|o| String::from_utf8_lossy(&o.stdout).trim().parse::<f64>().ok())
        .unwrap_or(0.0)
}

fn detect_silences(path: &str, threshold: i32, min_sec: f64) -> Vec<(f64, f64)> {
    let af = format!("silencedetect=noise={}dB:d={}", threshold, min_sec);
    let out = Command::new("ffmpeg").args(["-vn", "-i", path, "-af", &af, "-f", "null", "-"]).output();
    let mut silences = Vec::new();
    if let Ok(o) = out {
        let stderr = String::from_utf8_lossy(&o.stderr);
        let mut cur_start: Option<f64> = None;
        for line in stderr.lines() {
            if line.contains("silence_start:") {
                if let Some(pos) = line.find("silence_start:") {
                    if let Some(val) = line[pos + 14..].split_whitespace().next().and_then(|v| v.parse::<f64>().ok()) {
                        cur_start = Some(val);
                    }
                }
            } else if line.contains("silence_end:") {
                if let Some(pos) = line.find("silence_end:") {
                    if let Some(end_v) = line[pos + 12..].split_whitespace().next().and_then(|v| v.parse::<f64>().ok()) {
                        if let Some(st) = cur_start {
                            silences.push((st, end_v));
                            cur_start = None;
                        }
                    }
                }
            }
        }
    }
    silences
}

pub async fn execute_rough_wash(Json(req): Json<RoughWashReq>) -> impl IntoResponse {
    let valid_files: Vec<&String> = req.files.iter().filter(|f| Path::new(f).exists()).collect();
    if valid_files.is_empty() {
        return Json(json!({ "success": false, "error": "没有找到有效的输入素材文件" }));
    }

    let _ = fs::create_dir_all(LIB_DIR);
    let threshold = req.silence_threshold_db.or(req.silence_db).unwrap_or(-28.0) as i32;
    let min_sec = req.min_silence_sec.or(req.min_silence_duration_sec).unwrap_or(0.6);
    let padding = req.padding_sec.unwrap_or(0.12);

    let first_stem = Path::new(valid_files[0]).file_stem().and_then(|s| s.to_str()).unwrap_or("video");
    let out_name = if valid_files.len() > 1 {
        format!("{}_merged_{}clips_clean_master.mp4", first_stem, valid_files.len())
    } else {
        format!("{}_clean_master.mp4", first_stem)
    };
    let output_path = Path::new(LIB_DIR).join(&out_name);

    let tmp_dir = format!("/tmp/wash_multi_{}", std::process::id());
    let _ = fs::create_dir_all(&tmp_dir);
    let concat_list_path = format!("{}/list.txt", tmp_dir);
    let mut concat_content = String::new();

    let mut all_keeps: Vec<KeepSegment> = Vec::new();
    let mut all_cuts: Vec<CutSegment> = Vec::new();
    let mut total_orig_dur = 0.0;
    let mut global_seg_idx = 1;
    let mut global_cut_idx = 1;
    let mut clip_counter = 0;

    for (f_idx, file_path) in valid_files.iter().enumerate() {
        let dur = probe_duration(file_path);
        if dur <= 0.0 { continue; }
        total_orig_dur += dur;
        let file_name = Path::new(file_path).file_name().and_then(|s| s.to_str()).unwrap_or("clip").to_string();

        let silences = detect_silences(file_path, threshold, min_sec);

        let mut raw_keeps: Vec<(f64, f64)> = Vec::new();
        let mut prev_end = 0.0;
        for (s_start, s_end) in &silences {
            let seg_start = if prev_end > 0.0 { (prev_end - padding).max(0.0) } else { 0.0 };
            let seg_end = (*s_start + padding).min(dur);
            if seg_end - seg_start >= 0.45 {
                raw_keeps.push((seg_start, seg_end));
            }
            prev_end = *s_end;
        }
        if prev_end < dur {
            let seg_start = (prev_end - padding).max(0.0);
            if dur - seg_start >= 0.45 {
                raw_keeps.push((seg_start, dur));
            }
        }
        if raw_keeps.is_empty() {
            raw_keeps.push((0.0, dur));
        }

        // 智能空隙融合：间隙 < 0.35s 视为正常呼吸不切断
        let mut file_keeps: Vec<(f64, f64)> = Vec::new();
        for seg in raw_keeps {
            if let Some(last) = file_keeps.last_mut() {
                if seg.0 - last.1 < 0.35 {
                    last.1 = seg.1;
                    continue;
                }
            }
            file_keeps.push(seg);
        }

        let mut c_cursor = 0.0;
        for (start, end) in file_keeps {
            if start > c_cursor + 0.35 {
                let d = ((start - c_cursor) * 100.0).round() / 100.0;
                let label = if c_cursor == 0.0 {
                    format!("{}:片头迟疑", file_name)
                } else {
                    format!("{}:忘词卡壳", file_name)
                };
                all_cuts.push(CutSegment {
                    index: global_cut_idx,
                    file_index: f_idx + 1,
                    source_file: file_name.clone(),
                    start: (c_cursor * 100.0).round() / 100.0,
                    end: (start * 100.0).round() / 100.0,
                    duration: d,
                    label,
                });
                global_cut_idx += 1;
            }
            c_cursor = end;

            let seg_dur = ((end - start) * 100.0).round() / 100.0;
            let seg_file = format!("{}/seg_{}.mp4", tmp_dir, clip_counter);
            clip_counter += 1;
            let _ = Command::new("ffmpeg")
                .args(["-y", "-ss", &start.to_string(), "-to", &end.to_string(), "-i", file_path, "-c", "copy", "-avoid_negative_ts", "make_zero", &seg_file])
                .status();
            concat_content.push_str(&format!("file '{}'\n", seg_file));

            all_keeps.push(KeepSegment {
                index: global_seg_idx,
                file_index: f_idx + 1,
                source_file: file_name.clone(),
                start: (start * 100.0).round() / 100.0,
                end: (end * 100.0).round() / 100.0,
                duration: seg_dur,
            });
            global_seg_idx += 1;
        }

        if dur > c_cursor + 0.35 {
            let d = ((dur - c_cursor) * 100.0).round() / 100.0;
            all_cuts.push(CutSegment {
                index: global_cut_idx,
                file_index: f_idx + 1,
                source_file: file_name.clone(),
                start: (c_cursor * 100.0).round() / 100.0,
                end: (dur * 100.0).round() / 100.0,
                duration: d,
                label: format!("{}:片尾废帧", file_name),
            });
            global_cut_idx += 1;
        }
    }

    if !concat_content.is_empty() {
        let _ = fs::write(&concat_list_path, &concat_content);
        let concat_status = Command::new("ffmpeg")
            .args(["-y", "-f", "concat", "-safe", "0", "-i", &concat_list_path, "-c", "copy", output_path.to_str().unwrap_or("")])
            .status();

        let _ = fs::remove_dir_all(&tmp_dir);

        if let Ok(st) = concat_status {
            if st.success() {
                let clean_dur = all_keeps.iter().map(|k| k.duration).sum::<f64>();
                let cut_sec = all_cuts.iter().map(|c| c.duration).sum::<f64>();
                let cut_ratio = if total_orig_dur > 0.0 {
                    format!("{:.1}%", (cut_sec / total_orig_dur) * 100.0)
                } else {
                    "0%".to_string()
                };

                return Json(json!({
                    "success": true,
                    "clean_file": output_path.to_string_lossy(),
                    "name": out_name,
                    "message": format!("多段粗剪成功: 合并 {} 条素材，切除 {} 处无效停顿，净时长 {:.1} 秒", valid_files.len(), all_cuts.len(), clean_dur),
                    "stats": {
                        "original_duration_sec": (total_orig_dur * 10.0).round() / 10.0,
                        "clean_duration_sec": (clean_dur * 10.0).round() / 10.0,
                        "cut_sec": (cut_sec * 10.0).round() / 10.0,
                        "cut_ratio": cut_ratio,
                        "input_files_count": valid_files.len(),
                        "cut_count": all_cuts.len(),
                        "keep_count": all_keeps.len(),
                        "padding_ms": (padding * 1000.0) as u32
                    },
                    "keep_segments": all_keeps,
                    "cut_segments": all_cuts
                }));
            }
        }
    }

    let _ = fs::remove_dir_all(&tmp_dir);
    Json(json!({ "success": false, "error": "多段素材智能粗剪流切执行失败" }))
}
