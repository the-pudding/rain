annual_chunks <- c("load_packages", "load_stations", "filter_precipitation", "download_data", "find_full", "find_average", "import_web", "filter_geo_annual")
puddingR::export_all(annualGeo, filename="annual_precipitation", location="open", codebook = TRUE, scripts = annual_chunks, script_file = "analysis.Rmd")
