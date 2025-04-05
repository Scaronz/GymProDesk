// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager; // Import the Manager trait

fn main() {
    let context = tauri::generate_context!();

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .setup(|app| { // Use the setup hook
            match app.path().app_config_dir() {
                Ok(config_dir) => {
                    // Construct the expected DB path
                    let db_path = config_dir.join("GymProDesk.db");
                    println!("✅ Expected AppConfig directory: {:?}", config_dir);
                    println!("✅ Expected full DB path: {:?}", db_path);
                }
                Err(e) => {
                    eprintln!("❌ Error getting AppConfig directory: {}", e);
                }
            }
            Ok(())
        })
        .run(context)
        .expect("error while running tauri application");
}