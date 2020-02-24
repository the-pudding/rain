
## daily_precipitation.csv & daily_precipitation.R

  - **What is this?**: The R scripts and resulting data documenting total daily precipitation in 2019 for 640 weather stations across the US.
  - **Source(s) & Methods**: All of the data used in this story came from the Global Historical Climatology Network (GHCN)-Daily [database](https://www.ncdc.noaa.gov/ghcn-daily-description) and was acquired from the National Oceanic and Atmospheric Administration’s (NOAA) [open data server](ftp://ftp.ncdc.noaa.gov/pub/data/ghcn/daily/by_year/). While this database contains data from thousands of weather stations worldwide, we filtered the data down to only include weather stations with consistent daily precipitation recordings from January 1, 2010 - December 31, 2019. Further, some of these stations were located in mountain ranges or other areas away from cities. To make the comparison to cities like Seattle more relevant, we used [Geocod.io](https://geocod.io/) to find the nearest city or town to the latitude and longitude of each weather station. If no city or town could be located with an Accuracy Score of 0.8 that weather station was excluded. Ultimately, 640 weather stations remained in our analysis and the data for those weather stations is included here, along with the R script to download and filter all of the data.
  - **Last Modified**: February 23, 2020
  - **Contact Information**: [Amber Thomas](mailto:YOUR-EMAIL@pudding.cool)
  - **Spatial Applicability**: These data represent weather stations within the US.
  - **Temporal Applicability**: January 1, 2019 - December 31, 2019
  - **Observations (Rows)**: There are 233,600 rows in this dataset.
    Each row represents a single day for a single weather station.
  - **Variables (Columns)**: There are 10 columns in this dataset. They
    are described below:

| Header    | Description                           | Data Type |
| :-------- | :------------------------------------ | :-------- |
| id        | The GHCN ID for each weather station | character |
| city      | The closest city to the weather station (as determined by [Geocod.io](https://geocod.io), based on the station's latitude and longitude) | character |
| station   | The name of each weather station | character |
| date      | Date of data collection (in mm/dd/yyyy format) | Date      |
| value     | Amount of precipitation (in inches) | numeric   |
| latitude  | The latitude of the weather station | numeric   |
| longitude | The longitude of the weather station | numeric   |
| state     | The state that the weather station is located in | character |