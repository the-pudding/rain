annual_chunks <- c("load_packages", "load_stations", "filter_precipitation", "download_data", "find_full", "find_average", "import_web", "filter_geo_annual")
puddingR::export_all(annualGeo, filename="annual_precipitation", location="open", codebook = TRUE, scripts = annual_chunks, script_file = here::here("rmds", "analysis.Rmd"))


daily_chunks <- c("load_packages", "load_stations", "filter_precipitation", "download_data", "find_full", "find_daily", "import_web", "filter_geo_daily")
puddingR::export_all(dailyGeo, filename="daily_precipitation", location="open", codebook = TRUE, scripts = daily_chunks, script_file = here::here("rmds", "analysis.Rmd"))
