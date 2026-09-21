use log::warn;
use reqwest::{Client, Proxy};

use crate::config::{PROXY_URL, TARGET_URL, TIMEOUT};

pub struct Checker {
    client: Client,
}

impl Checker {
    pub fn new() -> anyhow::Result<Self> {
        let mut builder = Client::builder().timeout(TIMEOUT);
        let proxy_target = std::env::var("HTTP_PROXY").unwrap_or_else(|_| PROXY_URL.to_string());
        
        // If proxy is reachable or explicitly requested, use it, else direct
        if !proxy_target.is_empty() {
            if let Ok(proxy) = Proxy::all(&proxy_target) {
                // Test if proxy port is listening
                if let Ok(stream) = std::net::TcpStream::connect_timeout(
                    &"127.0.0.1:10809".parse().unwrap(),
                    std::time::Duration::from_millis(200),
                ) {
                    drop(stream);
                    builder = builder.proxy(proxy);
                }
            }
        }
        let client = builder.build()?;
        Ok(Checker { client })
    }

    pub async fn check(&self) -> bool {
        match self.client.get(TARGET_URL).send().await {
            Ok(resp) => {
                let status = resp.status();
                if status.is_success() || status.is_redirection() {
                    true
                } else {
                    warn!("[ProxyChecker] 响应异常状态码: {}", status.as_u16());
                    false
                }
            }
            Err(e) => {
                warn!("[ProxyChecker] 探测请求失败: {}", e);
                false
            }
        }
    }
}
